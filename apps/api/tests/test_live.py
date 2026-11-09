from ipo_api.live import in_subscription
from ipo_api.models import Ipo
from ipo_api.normalize import normalize_item


def make(start: str | None, end: str | None) -> Ipo:
    raw = {"ipoCode": "A1", "compName": "x", "poStartDate": start, "poEndDate": end}
    return normalize_item(raw, "subscription", "2026-11-09")


def test_open_on_every_day_of_the_window() -> None:
    ipo = make("2026-11-06", "2026-11-09")
    assert in_subscription(ipo, "2026-11-06")
    assert in_subscription(ipo, "2026-11-09")
    assert not in_subscription(ipo, "2026-11-05")
    assert not in_subscription(ipo, "2026-11-10")


def test_single_day_and_missing_dates() -> None:
    assert in_subscription(make("2026-11-09", None), "2026-11-09")
    assert not in_subscription(make(None, None), "2026-11-09")
