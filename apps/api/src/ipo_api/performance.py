"""Listing-day and recent prices for IPOs that have started trading."""

import sys
import time
from collections.abc import Callable, Mapping
from datetime import date, timedelta
from typing import Any

import httpx

from ipo_api.fields import integer, text
from ipo_api.models import Ipo, Performance

# After this many days the latest close stops being refreshed and stays as a snapshot.
TRACK_DAYS = 30
REQUEST_GAP_SECONDS = 0.3

PriceFetcher = Callable[[str, str, str], Any]


class ChartSchemaError(ValueError):
    pass


def stock_code(ipo_code: str) -> str:
    """Naver IPO codes carry an 'A' prefix that the chart API does not use."""
    return ipo_code.removeprefix("A")


def _bar_date(bar: Mapping[str, Any]) -> str | None:
    raw = text(bar, "localDate")
    if raw is None or len(raw) != 8:
        return None
    return f"{raw[:4]}-{raw[4:6]}-{raw[6:]}"


def parse_chart(payload: Any, listing_on: str) -> Performance | None:
    if not isinstance(payload, list):
        raise ChartSchemaError(f"expected a list of bars, got {type(payload).__name__}")
    bars = [(day, bar) for bar in payload if isinstance(bar, Mapping) and (day := _bar_date(bar))]
    trading = sorted((day, bar) for day, bar in bars if day >= listing_on)
    if not trading:
        return None
    _, first = trading[0]
    latest_on, latest = trading[-1]
    return {
        "open": integer(first, "openPrice"),
        "high": integer(first, "highPrice"),
        "close": integer(first, "closePrice"),
        "latest_close": integer(latest, "closePrice"),
        "latest_on": latest_on,
    }


def is_tracked(ipo: Ipo, today: str) -> bool:
    listing_on = ipo["listing_on"]
    if listing_on is None or listing_on > today:
        return False
    cutoff = (date.fromisoformat(today) - timedelta(days=TRACK_DAYS)).isoformat()
    return listing_on >= cutoff


def is_listing_today(ipo: Ipo, today: str) -> bool:
    return ipo["listing_on"] == today


def carry_performance(ipos: list[Ipo], previous: list[Ipo]) -> list[Ipo]:
    """Feed records arrive without prices; keep the ones collected earlier."""
    by_code = {ipo["code"]: ipo for ipo in previous}
    carried: list[Ipo] = []
    for ipo in ipos:
        old = by_code.get(ipo["code"])
        if ipo["performance"] is None and old is not None:
            ipo = {**ipo, "performance": old["performance"]}
        carried.append(ipo)
    return carried


def _fetch(ipo: Ipo, today: str, fetch: PriceFetcher) -> Performance | None:
    listing_on = ipo["listing_on"]
    assert listing_on is not None
    payload = fetch(stock_code(ipo["code"]), listing_on.replace("-", ""), today.replace("-", ""))
    return parse_chart(payload, listing_on)


def refresh_performance(
    ipos: list[Ipo],
    today: str,
    fetch: PriceFetcher,
    should_refresh: Callable[[Ipo, str], bool] = is_tracked,
    gap_seconds: float = REQUEST_GAP_SECONDS,
) -> list[Ipo]:
    """Prices are a nice-to-have, so a failed request keeps the old value instead of aborting."""
    refreshed: list[Ipo] = []
    for ipo in ipos:
        if should_refresh(ipo, today):
            try:
                fresh = _fetch(ipo, today, fetch)
                if fresh is not None:
                    ipo = {**ipo, "performance": fresh}
            except (httpx.HTTPError, ChartSchemaError, ValueError) as error:
                print(f"prices failed for {ipo['code']}: {error}", file=sys.stderr)
            time.sleep(gap_seconds)
        refreshed.append(ipo)
    return refreshed
