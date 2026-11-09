from ipo_api.models import Ipo


def in_subscription(ipo: Ipo, today: str) -> bool:
    """Subscription is open today, so broker ratios move during market hours."""
    start = ipo["subscription_start"]
    end = ipo["subscription_end"] or start
    return start is not None and end is not None and start <= today <= end
