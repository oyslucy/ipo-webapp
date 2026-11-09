"""Turn Naver's per-IPO detail response into the fields shown on the detail sheet."""

from collections.abc import Mapping
from typing import Any

from ipo_api.fields import integer, number, section, text
from ipo_api.models import Broker, Company, Document, Financial, Ipo, IpoDetail

EMPTY_DETAIL: IpoDetail = {
    "institution_ratio": None,
    "general_shares_min": None,
    "general_shares_max": None,
    "margin_ratio": None,
    "company": None,
    "financials": [],
    "brokers": [],
    "documents": [],
}

DETAIL_KEYS = tuple(EMPTY_DETAIL)


class DetailSchemaError(ValueError):
    pass


def _company(raw: Mapping[str, Any], address: str | None) -> Company | None:
    if not raw and address is None:
        return None
    return {
        "founded_on": text(raw, "foundDate"),
        "ceo": text(raw, "compOwner"),
        "employees": integer(raw, "empNum"),
        "products": text(raw, "compPrdt"),
        "homepage": text(raw, "compUrl"),
        "largest_shareholder": text(raw, "largstShare"),
        "largest_share_ratio": number(raw, "largstShareRatio"),
        "company_class": text(raw, "compClass"),
        "address": address,
    }


def _financials(raw: Mapping[str, Any]) -> list[Financial]:
    rows: list[Financial] = []
    # n2 is the oldest period and n0 the latest; keep them in reading order.
    for n in (2, 1, 0):
        period = text(raw, f"n{n}Ptitle")
        if period is None:
            continue
        rows.append(
            {
                "period": period,
                "sales": integer(raw, f"n{n}Sales"),
                "operating_profit": integer(raw, f"n{n}BizPrft"),
                "net_profit": integer(raw, f"n{n}CrntPrft"),
            }
        )
    return rows


def _broker(raw: Mapping[str, Any]) -> Broker | None:
    name = text(raw, "orgNm")
    if name is None:
        return None
    return {
        "name": name,
        "role": text(raw, "orgType"),
        "allocated_shares": integer(raw, "orgAllcShares"),
        "min_shares": integer(raw, "sbscMinNum"),
        "equal_shares": integer(raw, "orgEqlShares"),
        "proportional_shares": integer(raw, "orgPrtShares"),
        "total_ratio": number(raw, "ttlCmptRatio"),
        "proportional_ratio": number(raw, "prtCmptRatio"),
        "applications": integer(raw, "sbscNum"),
        "updated_at": text(raw, "updtTm"),
    }


def _document(raw: Mapping[str, Any]) -> Document | None:
    title = text(raw, "displayName")
    url = text(raw, "linkUrl")
    return None if title is None or url is None else {"title": title, "url": url}


def parse_detail(payload: Mapping[str, Any]) -> IpoDetail:
    managers = payload.get("joinManagers")
    documents = payload.get("irContents")
    if not isinstance(managers, list) or not isinstance(documents, list):
        raise DetailSchemaError(f"unexpected detail shape for {payload.get('ipoCode')}")
    statement = section(payload, "registrationStatement")
    return {
        "institution_ratio": number(section(payload, "demandForecastingResult"), "cmptnRate"),
        "general_shares_min": integer(statement, "gnrlMinShares"),
        "general_shares_max": integer(statement, "gnrlMaxShares"),
        "margin_ratio": number(statement, "sbscMrgnRatio"),
        "company": _company(
            section(payload, "listedExamination"),
            text(section(payload, "ipoInfo"), "compAddr"),
        ),
        "financials": _financials(section(payload, "registrationStatementDetail")),
        "brokers": [b for b in map(_broker, managers) if b is not None],
        "documents": [d for d in map(_document, documents) if d is not None],
    }


def with_detail(ipo: Ipo, payload: Mapping[str, Any]) -> Ipo:
    """Detail fields plus the final figures the progress list may still lack."""
    forecast = section(payload, "demandForecastingResult")
    confirmed = section(payload, "confirmedInfo")
    return {
        **ipo,
        **parse_detail(payload),
        "fixed_price": ipo["fixed_price"] or integer(forecast, "fixPubPrice"),
        "offering_amount": ipo["offering_amount"] or integer(forecast, "fnlPoPrice"),
        "competition_ratio": ipo["competition_ratio"] or number(confirmed, "fnlCmptRatio"),
    }


def carry_detail(ipo: Ipo, previous: Ipo | None) -> Ipo:
    """Keep yesterday's detail when today's detail request fails."""
    if previous is None:
        return ipo
    carried: Ipo = {**ipo}
    for key in DETAIL_KEYS:
        carried[key] = previous[key]  # type: ignore[literal-required]
    return carried
