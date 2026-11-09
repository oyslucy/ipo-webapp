import json
from pathlib import Path
from typing import Any

import pytest

from ipo_api.normalize import SchemaError, normalize_item, normalize_response

FIXTURE = Path(__file__).parent / "fixtures" / "progress.json"


def load_fixture() -> dict[str, Any]:
    payload: dict[str, Any] = json.loads(FIXTURE.read_text(encoding="utf-8"))
    return payload


def test_normalize_response_maps_every_stage() -> None:
    ipos = normalize_response(load_fixture(), today="2026-11-09")
    assert {ipo["stage"] for ipo in ipos} == {
        "examination",
        "demand_forecast",
        "forecast_done",
        "subscription",
        "listing",
    }
    assert all(ipo["last_seen_on"] == "2026-11-09" and ipo["in_feed"] for ipo in ipos)


def test_normalize_item_parses_numbers_and_lists() -> None:
    raw = {
        "ipoCode": "A1",
        "compName": "테스트",
        "orgNm": "대신증권, 신한투자증권",
        "hopePubStart": "15700",
        "fixPubPrice": "17600",
        "fnlCmptRatio": "1219.37",
        "poStartDate": "2026-11-06",
        "lcalDate": None,
    }
    ipo = normalize_item(raw, "subscription", today="2026-11-09")
    assert ipo["underwriters"] == ["대신증권", "신한투자증권"]
    assert ipo["hope_price_low"] == 15700
    assert ipo["fixed_price"] == 17600
    assert ipo["competition_ratio"] == pytest.approx(1219.37)
    assert ipo["subscription_start"] == "2026-11-06"
    assert ipo["listing_on"] is None


def test_missing_list_raises() -> None:
    payload = load_fixture()
    del payload["listingList"]
    with pytest.raises(SchemaError):
        normalize_response(payload, today="2026-11-09")


def test_missing_code_raises() -> None:
    with pytest.raises(SchemaError):
        normalize_item({"compName": "x"}, "listing", today="2026-11-09")
