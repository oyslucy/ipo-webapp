from typing import Literal, TypedDict

Stage = Literal[
    "examination",
    "demand_forecast",
    "forecast_done",
    "subscription",
    "subscription_done",
    "listing",
]


class Ipo(TypedDict):
    code: str
    name: str
    market: str | None
    industry: str | None
    stage: Stage
    status_text: str | None
    underwriters: list[str]
    hope_price_low: int | None
    hope_price_high: int | None
    fixed_price: int | None
    offered_shares: int | None
    offering_amount: int | None
    competition_ratio: float | None
    review_requested_on: str | None
    approved_on: str | None
    filed_on: str | None
    forecast_start: str | None
    forecast_end: str | None
    subscription_start: str | None
    subscription_end: str | None
    allocation_on: str | None
    payment_on: str | None
    refund_on: str | None
    listing_on: str | None
    last_seen_on: str
    in_feed: bool


class Dataset(TypedDict):
    fetched_at: str
    ipos: list[Ipo]
