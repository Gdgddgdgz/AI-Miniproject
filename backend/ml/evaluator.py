"""
evaluator.py – Compute evaluation metrics for trained models.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    mean_squared_error, mean_absolute_error, r2_score,
)
from typing import Dict, Any


def evaluate_classification(y_true, y_pred) -> Dict[str, Any]:
    """
    Return classification metrics + confusion matrix.
    Labels are sorted to keep confusion matrix order deterministic.
    """
    labels = sorted(set(y_true) | set(y_pred))
    cm = confusion_matrix(y_true, y_pred, labels=labels).tolist()

    return {
        "accuracy":  round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, average="weighted",
                                                  zero_division=0)), 4),
        "recall":    round(float(recall_score(y_true, y_pred, average="weighted",
                                              zero_division=0)), 4),
        "f1_score":  round(float(f1_score(y_true, y_pred, average="weighted",
                                          zero_division=0)), 4),
        "confusion_matrix": cm,
        "confusion_matrix_labels": [str(l) for l in labels],
    }


def evaluate_regression(y_true, y_pred) -> Dict[str, Any]:
    """Return RMSE, MAE, and R² score."""
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae  = float(mean_absolute_error(y_true, y_pred))
    r2   = float(r2_score(y_true, y_pred))

    return {
        "rmse": round(rmse, 4),
        "mae":  round(mae, 4),
        "r2":   round(r2, 4),
    }


def evaluate(problem_type: str, y_true, y_pred) -> Dict[str, Any]:
    """Dispatch to the correct evaluator."""
    if problem_type == "classification":
        return evaluate_classification(y_true, y_pred)
    return evaluate_regression(y_true, y_pred)


def get_primary_score(problem_type: str, metrics: Dict[str, Any]) -> float:
    """
    Return a single 'score' value for model comparison.
    Classification → F1 (weighted)
    Regression     → R²
    """
    if problem_type == "classification":
        return metrics.get("f1_score", 0.0)
    return metrics.get("r2", 0.0)
