import argparse
import sys
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx

from ipo_api.detail import DetailSchemaError, carry_detail, with_detail
from ipo_api.merge import merge
from ipo_api.models import Ipo
from ipo_api.naver import fetch_detail, fetch_progress
from ipo_api.normalize import normalize_response
from ipo_api.store import load_ipos, save_dataset

KST = ZoneInfo("Asia/Seoul")
DEFAULT_OUT = Path(__file__).resolve().parents[4] / "apps/web/public/data/ipos.json"
REQUEST_GAP_SECONDS = 0.3


def enrich(fresh: list[Ipo], previous: list[Ipo]) -> list[Ipo]:
    by_code = {ipo["code"]: ipo for ipo in previous}
    enriched: list[Ipo] = []
    failures = 0
    for ipo in fresh:
        try:
            enriched.append(with_detail(ipo, fetch_detail(ipo["code"])))
        except (httpx.HTTPError, DetailSchemaError, ValueError) as error:
            failures += 1
            print(f"detail failed for {ipo['code']}: {error}", file=sys.stderr)
            enriched.append(carry_detail(ipo, by_code.get(ipo["code"])))
        time.sleep(REQUEST_GAP_SECONDS)
    # Most requests failing means the API changed; stop rather than publish stale details.
    if fresh and failures > len(fresh) // 2:
        raise RuntimeError(f"detail requests failed for {failures}/{len(fresh)} ipos")
    return enriched


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect IPO data from Naver")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    now = datetime.now(KST)
    previous = load_ipos(args.out)
    fresh = normalize_response(fetch_progress(), today=now.date().isoformat())
    ipos = merge(previous, enrich(fresh, previous))
    save_dataset(args.out, {"fetched_at": now.isoformat(timespec="seconds"), "ipos": ipos})
    print(f"saved {len(ipos)} ipos ({len(fresh)} in feed) to {args.out}")
