import argparse
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from ipo_api.merge import merge
from ipo_api.naver import fetch_progress
from ipo_api.normalize import normalize_response
from ipo_api.store import load_ipos, save_dataset

KST = ZoneInfo("Asia/Seoul")
DEFAULT_OUT = Path(__file__).resolve().parents[4] / "apps/web/public/data/ipos.json"


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect IPO data from Naver")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    now = datetime.now(KST)
    fresh = normalize_response(fetch_progress(), today=now.date().isoformat())
    ipos = merge(load_ipos(args.out), fresh)
    save_dataset(args.out, {"fetched_at": now.isoformat(timespec="seconds"), "ipos": ipos})
    print(f"saved {len(ipos)} ipos ({len(fresh)} in feed) to {args.out}")
