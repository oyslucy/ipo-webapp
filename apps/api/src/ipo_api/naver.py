from typing import Any

import httpx

URL = "https://stock.naver.com/api/domestic/market/ipo/progress"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ipo-webapp/0.1)",
    "Referer": "https://stock.naver.com/market/stock/kr/ipo",
}


def fetch_progress(timeout: float = 15.0) -> dict[str, Any]:
    response = httpx.get(URL, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    payload: dict[str, Any] = response.json()
    return payload
