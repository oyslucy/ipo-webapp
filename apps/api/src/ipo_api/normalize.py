"""Convert the raw Naver IPO progress response into Ipo records."""

from collections.abc import Mapping
from typing import Any

from ipo_api.models import Ipo, Stage

STAGE_KEYS: dict[str, Stage] = {
    "examinationList": "examination",
    "demandForecastingList": "demand_forecast",
    "forecastingCompleteList": "forecast_done",
    "subscriptionList": "subscription",
    "subscriptionCompleteList": "subscription_done",
    "listingList": "listing",
}


class SchemaError(ValueError):
    pass


def _str(raw: Mapping[str, Any], key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _int(raw: Mapping[str, Any], key: str) -> int | None:
    text = _str(raw, key)
    return None if text is None else int(float(text.replace(",", "")))


def _float(raw: Mapping[str, Any], key: str) -> float | None:
    text = _str(raw, key)
    return None if text is None else float(text.replace(",", ""))


def _split(raw: Mapping[str, Any], key: str) -> list[str]:
    text = _str(raw, key)
    return [] if text is None else [part.strip() for part in text.split(",") if part.strip()]


def normalize_item(raw: Mapping[str, Any], stage: Stage, today: str) -> Ipo:
    code = _str(raw, "ipoCode")
    name = _str(raw, "compName")
    if code is None or name is None:
        raise SchemaError(f"missing ipoCode/compName in {dict(raw)}")
    return {
        "code": code,
        "name": name,
        "market": _str(raw, "marketType"),
        "industry": _str(raw, "compUpjong"),
        "stage": stage,
        "status_text": _str(raw, "ipoStatus"),
        "underwriters": _split(raw, "orgNm"),
        "hope_price_low": _int(raw, "hopePubStart"),
        "hope_price_high": _int(raw, "hopePubEnd"),
        "fixed_price": _int(raw, "fixPubPrice"),
        "offered_shares": _int(raw, "poExptShares"),
        "offering_amount": _int(raw, "fnlPoPrice"),
        "competition_ratio": _float(raw, "fnlCmptRatio"),
        "review_requested_on": _str(raw, "dcalDate"),
        "approved_on": _str(raw, "acalDate"),
        "filed_on": _str(raw, "regSmDate"),
        "forecast_start": _str(raw, "dfStartDate"),
        "forecast_end": _str(raw, "dfEndDate"),
        "subscription_start": _str(raw, "poStartDate"),
        "subscription_end": _str(raw, "poEndDate"),
        "allocation_on": _str(raw, "allocDate"),
        "payment_on": _str(raw, "payupDate"),
        "refund_on": _str(raw, "refundDate"),
        "listing_on": _str(raw, "lcalDate"),
        "last_seen_on": today,
        "in_feed": True,
    }


def normalize_response(payload: Mapping[str, Any], today: str) -> list[Ipo]:
    missing = [key for key in STAGE_KEYS if not isinstance(payload.get(key), list)]
    if missing:
        # A changed response shape must fail loudly instead of wiping the dataset.
        raise SchemaError(f"response missing lists: {missing}")
    return [
        normalize_item(item, stage, today)
        for key, stage in STAGE_KEYS.items()
        for item in payload[key]
    ]
