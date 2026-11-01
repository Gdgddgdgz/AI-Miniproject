"""
helpers.py – Multi-user session store and utility functions.
"""

import os
import hashlib
import tempfile
import threading
import joblib
import pandas as pd
from typing import Any, Dict

# ---------------------------------------------------------------------------
# Single-host session cache. Session values are also stored on the durable app volume.
# ---------------------------------------------------------------------------
_user_sessions: Dict[str, Dict[str, Any]] = {}
_session_lock = threading.RLock()
_SESSION_DIR = os.path.abspath(os.getenv(
    "SESSION_STORAGE_DIR",
    os.path.join(os.path.dirname(__file__), "..", "storage", "sessions"),
))

_EMPTY_SESSION = {
    "raw_df": None,           # pd.DataFrame uploaded by the user
    "trained_model": None,    # sklearn estimator (last trained)
    "model_name": None,       # str – name of the last trained model
    "target_column": None,    # str – name of the target column
    "feature_columns": None,  # list – feature column names (after encoding)
    "problem_type": None,     # "classification" | "regression"
    "label_encoder": None,    # LabelEncoder for the target (classification)
    "image_columns": None,    # image reference columns kept for display, excluded from model features
    "image_map": None,        # archive filename -> data URI for uploaded image assets
}


class PersistentSession(dict):
    """Session state persisted to the configured durable volume on each update."""
    def __init__(self, username: str, values: Dict[str, Any]):
        super().__init__(values)
        self.username = username

    def __setitem__(self, key, value):
        with _session_lock:
            super().__setitem__(key, value)
            _persist_session(self.username, self)


def _session_path(username: str) -> str:
    user_id = hashlib.sha256(username.encode("utf-8")).hexdigest()
    return os.path.join(_SESSION_DIR, user_id + ".joblib")


def _persist_session(username: str, session: Dict[str, Any]) -> None:
    os.makedirs(_SESSION_DIR, mode=0o700, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix="session-", suffix=".tmp", dir=_SESSION_DIR)
    os.close(fd)
    try:
        joblib.dump(dict(session), temp_path, compress=3)
        os.replace(temp_path, _session_path(username))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def get_session(username: str) -> Dict[str, Any]:
    """Return a user session, restoring it from durable storage when available."""
    with _session_lock:
        if username not in _user_sessions:
            path = _session_path(username)
            values = joblib.load(path) if os.path.isfile(path) else dict(_EMPTY_SESSION)
            _user_sessions[username] = PersistentSession(username, values)
        return _user_sessions[username]


def reset_session(username: str) -> None:
    """Clear session data for a specific user."""
    with _session_lock:
        _user_sessions[username] = PersistentSession(username, dict(_EMPTY_SESSION))
        path = _session_path(username)
        if os.path.exists(path):
            os.remove(path)


def df_to_records(df: pd.DataFrame, max_rows: int = 20) -> list:
    """Convert a DataFrame to a list of JSON-serialisable dicts."""
    subset = df.head(max_rows).copy().astype(object)
    subset = subset.where(pd.notnull(subset), other=None)
    records = subset.to_dict(orient="records")
    return [
        {k: (None if pd.isna(v) else v) for k, v in r.items()}
        for r in records
    ]


def column_dtypes(df: pd.DataFrame) -> Dict[str, str]:
    """Return a column→dtype mapping as plain strings."""
    return {col: str(df[col].dtype) for col in df.columns}
