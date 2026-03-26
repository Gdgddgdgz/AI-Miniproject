"""
model_selector.py – Detect problem type and recommend the best model.
"""

import pandas as pd
import numpy as np


def detect_problem_type(df: pd.DataFrame, target_col: str) -> str:
    """
    Determine whether the task is 'classification' or 'regression'.

    Rules:
      - If the target column has a non-numeric dtype → classification.
      - If the target is numeric but has ≤ 10 unique integer values → classification.
      - Otherwise → regression.
    """
    series = df[target_col]

    if series.dtype == object or str(series.dtype) == "category":
        return "classification"

    # Numeric target: check uniqueness
    unique_values = series.nunique()
    if series.dtype in [np.int32, np.int64] and unique_values <= 10:
        return "classification"

    return "regression"


def get_model_list(problem_type: str) -> list:
    """Return the list of available model names for the given problem type."""
    if problem_type == "classification":
        return [
            "Logistic Regression",
            "Decision Tree",
            "Random Forest",
            "KNN",
        ]
    else:
        return [
            "Linear Regression",
            "Decision Tree Regressor",
            "Random Forest Regressor",
        ]


def get_best_model(comparison: list) -> dict:
    """
    Given a comparison list [{model, score, ...}, ...],
    return the entry with the highest score.
    """
    if not comparison:
        return {}
    return max(comparison, key=lambda x: x.get("score", 0))
