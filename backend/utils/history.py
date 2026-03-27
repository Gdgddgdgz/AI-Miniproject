"""
history.py - Model training history tracker.
Persists model results per user as a flat JSON list.
"""

import json
import os
import uuid
from datetime import datetime, timezone

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "model_history.json")


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles NumPy scalars."""
    def default(self, obj):
        if hasattr(obj, "item"):  # numpy scalar
            return obj.item()
        if hasattr(obj, "tolist"):  # numpy array
            return obj.tolist()
        return super().default(obj)


def _ensure_history_file():
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w") as f:
            json.dump([], f)


def get_history() -> list:
    """Load the full history list from disk."""
    _ensure_history_file()
    with open(HISTORY_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def get_user_history(username: str) -> list:
    """Return the history records for a specific user."""
    return [entry for entry in get_history() if entry.get("username") == username]


def save_model_to_history(
    model_name: str,
    target: str,
    metrics: dict,
    params: dict,
    username: str = "anonymous",
) -> dict:
    """Append a new training record and persist to disk."""
    history = get_history()
    new_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "username": username,
        "model_name": model_name,
        "target_column": target,
        "metrics": metrics,
        "parameters": params,
    }
    history.insert(0, new_entry)  # newest first
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4, cls=NumpyEncoder)
    return new_entry
