from typing import Any

import httpx
import pytest

from ipo_api.models import Ipo, Performance
from ipo_api.normalize import normalize_item
from ipo_api.performance import (
    ChartSchemaError,
    carry_performance,
    is_tracked,
    parse_chart,
    refresh_performance,
    stock_code,
)

BARS = [
    {"localDate": "20261113", "openPrice": 4750.0, "highPrice": 5190.0, "closePrice": 4380.0},
    {"localDate": "20261112", "openPrice": 7620.0, "highPrice": 7900.0, "closePrice": 4800.0},
    {"localDate": "20261111", "openPrice": 1.0, "highPrice": 1.0, "closePrice": 1.0},
]

SNAPSHOT: Performance = {
    "open": 1,
    "high": 1,
    "close": 1,
    "latest_close": 1,
    "latest_on": "2026-11-12",
}


def make(code: str = "A493410", listing_on: str | None = "2026-11-12") -> Ipo:
    raw = {"ipoCode": code, "compName": code, "lcalDate": listing_on}
    return normalize_item(raw, "listing", "2026-11-10")


def test_stock_code_drops_prefix() -> None:
    assert stock_code("A493410") == "493410"
    assert stock_code("A0153R0") == "0153R0"


def test_parse_chart_uses_first_trading_day_and_latest_close() -> None:
    assert parse_chart(BARS, "2026-11-12") == {
        "open": 7620,
        "high": 7900,
        "close": 4800,
        "latest_close": 4380,
        "latest_on": "2026-11-13",
    }


def test_parse_chart_without_bars_or_with_bad_shape() -> None:
    assert parse_chart([], "2026-11-12") is None
    assert parse_chart([{"localDate": "bad"}], "2026-11-12") is None
    with pytest.raises(ChartSchemaError):
        parse_chart({"error": "x"}, "2026-11-12")


def test_tracked_from_listing_day_for_thirty_days() -> None:
    ipo = make(listing_on="2026-11-12")
    assert not is_tracked(ipo, "2026-11-11")
    assert is_tracked(ipo, "2026-11-12")
    assert is_tracked(ipo, "2026-12-12")
    assert not is_tracked(ipo, "2026-12-13")
    assert not is_tracked(make(listing_on=None), "2026-11-12")


def test_carry_keeps_previous_prices() -> None:
    old: Ipo = {**make(), "performance": SNAPSHOT}
    [carried] = carry_performance([make()], [old])
    assert carried["performance"] == SNAPSHOT


def test_refresh_fetches_tracked_ipos_only() -> None:
    calls: list[tuple[str, str, str]] = []

    def fetch(code: str, start: str, end: str) -> Any:
        calls.append((code, start, end))
        return BARS

    listed, upcoming = make(), make("A1", "2026-12-01")
    result = refresh_performance([listed, upcoming], "2026-11-13", fetch, gap_seconds=0)
    assert calls == [("493410", "20261112", "20261113")]
    assert result[0]["performance"] is not None
    assert result[0]["performance"]["open"] == 7620
    assert result[1]["performance"] is None


def test_refresh_keeps_old_value_on_failure() -> None:
    def fetch(code: str, start: str, end: str) -> Any:
        raise httpx.ConnectError("down")

    ipo: Ipo = {**make(), "performance": SNAPSHOT}
    [result] = refresh_performance([ipo], "2026-11-13", fetch, gap_seconds=0)
    assert result["performance"] == SNAPSHOT
