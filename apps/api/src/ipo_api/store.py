import json
from pathlib import Path
from typing import Any, cast

from ipo_api.detail import EMPTY_DETAIL
from ipo_api.models import Dataset, Ipo

# Fields added after the first release; older history records lack them.
_BACKFILL: dict[str, Any] = {
    **EMPTY_DETAIL,
    "offering_amount_low": None,
    "offering_amount_high": None,
    "withdrawn_on": None,
}


def load_ipos(path: Path) -> list[Ipo]:
    if not path.exists():
        return []
    dataset: Dataset = json.loads(path.read_text(encoding="utf-8"))
    return [cast(Ipo, {**_BACKFILL, **ipo}) for ipo in dataset["ipos"]]


def save_dataset(path: Path, dataset: Dataset) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(dataset, ensure_ascii=False, indent=2)
    path.write_text(text + "\n", encoding="utf-8")
