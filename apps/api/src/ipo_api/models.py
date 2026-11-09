from typing import Literal, TypedDict

Stage = Literal[
    "examination",
    "demand_forecast",
    "forecast_done",
    "subscription",
    "subscription_done",
    "listing",
]


class Company(TypedDict):
    founded_on: str | None
    ceo: str | None
    employees: int | None
    products: str | None
    homepage: str | None
    largest_shareholder: str | None
    largest_share_ratio: float | None
    company_class: str | None
    address: str | None


class Financial(TypedDict):
    period: str
    sales: int | None
    operating_profit: int | None
    net_profit: int | None


class Broker(TypedDict):
    name: str
    role: str | None
    allocated_shares: int | None
    min_shares: int | None
    equal_shares: int | None
    proportional_shares: int | None
    total_ratio: float | None
    proportional_ratio: float | None
    applications: int | None
    updated_at: str | None


class Document(TypedDict):
    title: str
    url: str


class IpoDetail(TypedDict):
    institution_ratio: float | None
    general_shares_min: int | None
    general_shares_max: int | None
    margin_ratio: float | None
    company: Company | None
    financials: list[Financial]
    brokers: list[Broker]
    documents: list[Document]


class Ipo(IpoDetail):
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
    offering_amount_low: int | None
    offering_amount_high: int | None
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
    withdrawn_on: str | None
    last_seen_on: str
    in_feed: bool


class Dataset(TypedDict):
    fetched_at: str
    ipos: list[Ipo]
