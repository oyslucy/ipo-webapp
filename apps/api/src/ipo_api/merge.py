from ipo_api.models import Ipo


def merge(previous: list[Ipo], fresh: list[Ipo]) -> list[Ipo]:
    """Fresh records win; records that left the feed are kept as history."""
    by_code: dict[str, Ipo] = {ipo["code"]: {**ipo, "in_feed": False} for ipo in previous}
    by_code.update({ipo["code"]: ipo for ipo in fresh})
    return sorted(by_code.values(), key=_sort_key)


def _sort_key(ipo: Ipo) -> tuple[str, str]:
    anchor = (
        ipo["listing_on"]
        or ipo["subscription_start"]
        or ipo["forecast_start"]
        or ipo["review_requested_on"]
        or ""
    )
    return (anchor, ipo["code"])
