"""Lenient readers for Naver's stringly-typed JSON fields."""

from collections.abc import Mapping
from typing import Any


def text(raw: Mapping[str, Any], key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    stripped = str(value).strip()
    return stripped or None


def integer(raw: Mapping[str, Any], key: str) -> int | None:
    value = text(raw, key)
    return None if value is None else int(float(value.replace(",", "")))


def number(raw: Mapping[str, Any], key: str) -> float | None:
    value = text(raw, key)
    return None if value is None else float(value.replace(",", ""))


def section(raw: Mapping[str, Any], key: str) -> Mapping[str, Any]:
    value = raw.get(key)
    return value if isinstance(value, Mapping) else {}
