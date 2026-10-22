"""
model_selector.py – Detect problem type and recommend the best model.
"""

import pandas as pd
from ml.model_trainer import CLASSIFICATION_MODELS, REGRESSION_MODELS


def detect_problem_type(df: pd.DataFrame, target_col: str) -> str:
    """
    Determine whether the task is 'classification' or 'regression'.

    Rules:
      - If the target column has a non-numeric dtype → classification.
      - If the target is numeric but has ≤ 10 unique integer values → classification.
      - Otherwise → regression.
    """
    series = df[target_col]

    if pd.api.types.is_object_dtype(series.dtype) or isinstance(series.dtype, pd.CategoricalDtype) or pd.api.types.is_bool_dtype(series.dtype):
        return "classification"

    # Numeric target: check uniqueness
    unique_values = series.nunique()
    if pd.api.types.is_integer_dtype(series.dtype) and unique_values <= 10:
        return "classification"

    return "regression"


def get_model_list(problem_type: str) -> list:
    """Return the list of available model names for the given problem type."""
    if problem_type == "classification":
        return list(CLASSIFICATION_MODELS)
    if problem_type == "regression":
        return list(REGRESSION_MODELS)
    raise ValueError("problem_type must be classification or regression.")


def get_best_model(comparison: list) -> dict:
    """
    Given a comparison list [{model, score, ...}, ...],
    return the entry with the highest score.
    """
    if not comparison:
        return {}
    return max(comparison, key=lambda x: x.get("score", 0))
