"""Convert the raw Naver IPO progress response into Ipo records."""

from collections.abc import Mapping
from typing import Any

from ipo_api.detail import EMPTY_DETAIL
from ipo_api.fields import integer, number, text
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


def _split(raw: Mapping[str, Any], key: str) -> list[str]:
    value = text(raw, key)
    return [] if value is None else [part.strip() for part in value.split(",") if part.strip()]


def normalize_item(raw: Mapping[str, Any], stage: Stage, today: str) -> Ipo:
    code = text(raw, "ipoCode")
    name = text(raw, "compName")
    if code is None or name is None:
        raise SchemaError(f"missing ipoCode/compName in {dict(raw)}")
    return {
        "code": code,
        "name": name,
        "market": text(raw, "marketType"),
        "industry": text(raw, "compUpjong"),
        "stage": stage,
        "status_text": text(raw, "ipoStatus"),
        "underwriters": _split(raw, "orgNm"),
        "hope_price_low": integer(raw, "hopePubStart"),
        "hope_price_high": integer(raw, "hopePubEnd"),
        "fixed_price": integer(raw, "fixPubPrice"),
        "offered_shares": integer(raw, "poExptShares"),
        "offering_amount": integer(raw, "fnlPoPrice"),
        "offering_amount_low": integer(raw, "pubPriceStart"),
        "offering_amount_high": integer(raw, "pubPriceEnd"),
        "competition_ratio": number(raw, "fnlCmptRatio"),
        "review_requested_on": text(raw, "dcalDate"),
        "approved_on": text(raw, "acalDate"),
        "filed_on": text(raw, "regSmDate"),
        "forecast_start": text(raw, "dfStartDate"),
        "forecast_end": text(raw, "dfEndDate"),
        "subscription_start": text(raw, "poStartDate"),
        "subscription_end": text(raw, "poEndDate"),
        "allocation_on": text(raw, "allocDate"),
        "payment_on": text(raw, "payupDate"),
        "refund_on": text(raw, "refundDate"),
        "listing_on": text(raw, "lcalDate"),
        "withdrawn_on": text(raw, "rwDate"),
        "last_seen_on": today,
        "in_feed": True,
        **EMPTY_DETAIL,
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
