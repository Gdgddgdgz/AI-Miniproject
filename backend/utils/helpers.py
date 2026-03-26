"""
helpers.py – Multi-user session store and utility functions.
"""

import pandas as pd
from typing import Any, Dict

# ---------------------------------------------------------------------------
# Multi-user in-memory session store
# Maps username -> session_dict
# NOTE: Data is lost on server restart. For production, use Redis or a DB.
# ---------------------------------------------------------------------------
_user_sessions: Dict[str, Dict[str, Any]] = {}

_EMPTY_SESSION = {
    "raw_df": None,           # pd.DataFrame uploaded by the user
    "processed_df": None,     # pd.DataFrame after preprocessing
    "trained_model": None,    # sklearn estimator (last trained)
    "model_name": None,       # str – name of the last trained model
    "target_column": None,    # str – name of the target column
    "feature_columns": None,  # list – feature column names (after encoding)
    "problem_type": None,     # "classification" | "regression"
    "label_encoder": None,    # LabelEncoder for the target (classification)
}


def get_session(username: str) -> Dict[str, Any]:
    """Return the session dict for a specific user, creating it if needed."""
    if username not in _user_sessions:
        _user_sessions[username] = dict(_EMPTY_SESSION)
    return _user_sessions[username]


def reset_session(username: str) -> None:
    """Clear session data for a specific user."""
    _user_sessions[username] = dict(_EMPTY_SESSION)


def df_to_records(df: pd.DataFrame, max_rows: int = 20) -> list:
    """Convert a DataFrame to a list of JSON-serialisable dicts."""
    subset = df.head(max_rows).copy()
    subset = subset.where(pd.notnull(subset), other=None)
    return subset.to_dict(orient="records")


def column_dtypes(df: pd.DataFrame) -> Dict[str, str]:
    """Return a column→dtype mapping as plain strings."""
    return {col: str(df[col].dtype) for col in df.columns}
