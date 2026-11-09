import json
from pathlib import Path
from typing import Any

import pytest

from ipo_api.detail import DetailSchemaError, carry_detail, parse_detail, with_detail
from ipo_api.normalize import normalize_item

FIXTURE = Path(__file__).parent / "fixtures" / "detail.json"


def load() -> dict[str, Any]:
    payload: dict[str, Any] = json.loads(FIXTURE.read_text(encoding="utf-8"))
    return payload


def test_parse_detail_reads_every_section() -> None:
    detail = parse_detail(load())
    assert detail["institution_ratio"] == pytest.approx(871.74)
    assert (detail["general_shares_min"], detail["general_shares_max"]) == (600000, 720000)
    assert detail["margin_ratio"] == pytest.approx(50.0)
    assert detail["company"] is not None
    assert detail["company"]["homepage"] == "www.al-robot.com"
    assert [row["period"] for row in detail["financials"]] == [
        "2024년 4분기(개별)",
        "2025년 4분기(개별)",
        "2026년 2분기(개별)",
    ]
    [broker] = detail["brokers"]
    assert broker["name"] == "대신증권"
    assert broker["min_shares"] == 10
    assert broker["total_ratio"] == pytest.approx(395.5)
    assert [doc["title"] for doc in detail["documents"]] == [
        "에이엘로봇 투자설명서",
        "에이엘로봇 증권신고서",
    ]


def test_empty_sections_become_empty_values() -> None:
    payload: dict[str, Any] = {"joinManagers": [], "irContents": [], "registrationStatement": {}}
    detail = parse_detail(payload)
    assert detail["institution_ratio"] is None
    assert detail["company"] is None
    assert detail["financials"] == []


def test_unexpected_shape_raises() -> None:
    with pytest.raises(DetailSchemaError):
        parse_detail({"joinManagers": None})


def test_with_detail_fills_missing_final_figures() -> None:
    raw = {"ipoCode": "A471800", "compName": "에이엘로봇"}
    ipo = normalize_item(raw, "subscription", "2026-11-09")
    merged = with_detail(ipo, load())
    assert merged["fixed_price"] == 17600
    assert merged["offering_amount"] == 42240000000
    assert merged["institution_ratio"] == pytest.approx(871.74)


def test_carry_detail_keeps_previous_detail() -> None:
    raw = {"ipoCode": "A1", "compName": "x"}
    previous = with_detail(normalize_item(raw, "listing", "d"), load())
    fresh = normalize_item(raw, "listing", "d2")
    carried = carry_detail(fresh, previous)
    assert carried["institution_ratio"] == pytest.approx(871.74)
    assert carried["last_seen_on"] == "d2"
    assert carry_detail(fresh, None) == fresh
