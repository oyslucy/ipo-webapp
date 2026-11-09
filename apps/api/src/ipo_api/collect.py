import argparse
import sys
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx

from ipo_api.detail import DetailSchemaError, carry_detail, with_detail
from ipo_api.live import in_subscription
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


def refresh_live(ipos: list[Ipo], today: str) -> list[Ipo]:
    """Re-fetch details only for IPOs whose subscription is open today."""
    targets = [ipo for ipo in ipos if in_subscription(ipo, today)]
    refreshed = {ipo["code"]: ipo for ipo in enrich(targets, ipos)} if targets else {}
    return [refreshed.get(ipo["code"], ipo) for ipo in ipos]


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect IPO data from Naver")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument(
        "--live",
        action="store_true",
        help="only refresh IPOs in their subscription window; write only on change",
    )
    args = parser.parse_args()

    now = datetime.now(KST)
    today = now.date().isoformat()
    previous = load_ipos(args.out)
    if args.live:
        ipos = refresh_live(previous, today)
        if ipos == previous:
            print("no live changes")
            return
    else:
        fresh = normalize_response(fetch_progress(), today=today)
        ipos = merge(previous, enrich(fresh, previous))
    save_dataset(args.out, {"fetched_at": now.isoformat(timespec="seconds"), "ipos": ipos})
    print(f"saved {len(ipos)} ipos to {args.out}")
