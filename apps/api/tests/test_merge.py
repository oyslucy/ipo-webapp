from ipo_api.merge import merge
from ipo_api.models import Ipo
from ipo_api.normalize import normalize_item


def make(code: str, listing_on: str | None, today: str = "2026-11-09") -> Ipo:
    raw = {"ipoCode": code, "compName": code, "lcalDate": listing_on}
    return normalize_item(raw, "listing", today)


def test_fresh_overrides_previous() -> None:
    old = make("A", "2026-11-10", today="2026-11-08")
    new = make("A", "2026-11-12")
    [merged] = merge([old], [new])
    assert merged["listing_on"] == "2026-11-12"
    assert merged["in_feed"] is True


def test_dropped_records_are_kept_as_history() -> None:
    [merged] = merge([make("A", "2026-11-01", today="2026-11-01")], [])
    assert merged["in_feed"] is False
    assert merged["last_seen_on"] == "2026-11-01"


def test_sorted_by_schedule() -> None:
    merged = merge([], [make("B", "2026-12-01"), make("A", "2026-11-01")])
    assert [ipo["code"] for ipo in merged] == ["A", "B"]
