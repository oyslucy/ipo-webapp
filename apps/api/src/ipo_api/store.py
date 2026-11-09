import json
from pathlib import Path

from ipo_api.models import Dataset, Ipo


def load_ipos(path: Path) -> list[Ipo]:
    if not path.exists():
        return []
    dataset: Dataset = json.loads(path.read_text(encoding="utf-8"))
    return dataset["ipos"]


def save_dataset(path: Path, dataset: Dataset) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(dataset, ensure_ascii=False, indent=2)
    path.write_text(text + "\n", encoding="utf-8")
