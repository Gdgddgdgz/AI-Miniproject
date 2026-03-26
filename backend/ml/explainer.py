"""
explainer.py – Generate natural-language explanations of model results.
"""

from typing import Dict, Any, List


_CLASSIFICATION_TEMPLATES = {
    "high": (
        "{model} achieved an excellent F1 score of {score:.2%}. "
        "It performed best by capturing complex patterns in the data. "
        "{importance_note}"
    ),
    "medium": (
        "{model} achieved a solid F1 score of {score:.2%}. "
        "The model correctly identified most patterns in the dataset. "
        "{importance_note}"
    ),
    "low": (
        "{model} achieved an F1 score of {score:.2%}, which leaves room for improvement. "
        "Consider feature engineering or hyperparameter tuning. "
        "{importance_note}"
    ),
}

_REGRESSION_TEMPLATES = {
    "high": (
        "{model} explained {score:.2%} of the variance in the target variable (R²). "
        "This indicates a strong predictive fit. "
        "{importance_note}"
    ),
    "medium": (
        "{model} achieved an R² of {score:.2f}, indicating a moderate fit. "
        "There may be non-linear relationships not yet captured. "
        "{importance_note}"
    ),
    "low": (
        "{model} achieved an R² of {score:.2f}, suggesting a weak fit. "
        "The relationship between features and target may be complex. "
        "{importance_note}"
    ),
}


def _importance_note(feature_importances: List[Dict]) -> str:
    if not feature_importances:
        return ""
    top = feature_importances[:3]
    names = ", ".join(f['feature'] for f in top)
    return f"The most influential features were: {names}."


def generate_explanation(
    model_name: str,
    problem_type: str,
    metrics: Dict[str, Any],
    feature_importances: List[Dict],
    is_best: bool = False,
) -> str:
    """
    Build a human-readable explanation of the model result.

    Parameters
    ----------
    model_name           : display name of the model
    problem_type         : "classification" or "regression"
    metrics              : dict returned by evaluator
    feature_importances  : list from model_trainer.get_feature_importances
    is_best              : whether this model is the top-ranked one
    """
    if problem_type == "classification":
        score = metrics.get("f1_score", 0.0)
        templates = _CLASSIFICATION_TEMPLATES
        threshold_high, threshold_low = 0.85, 0.60
    else:
        score = metrics.get("r2", 0.0)
        templates = _REGRESSION_TEMPLATES
        threshold_high, threshold_low = 0.85, 0.50

    tier = "high" if score >= threshold_high else ("medium" if score >= threshold_low else "low")
    note = _importance_note(feature_importances)
    explanation = templates[tier].format(model=model_name, score=score, importance_note=note)

    if is_best:
        explanation = "⭐ Best Model: " + explanation

    return explanation


def generate_comparison_summary(best_model: Dict, problem_type: str) -> str:
    """Generate a one-line summary of the model comparison."""
    if not best_model:
        return "No model comparison available."
    name  = best_model.get("model", "Unknown")
    score = best_model.get("score", 0.0)
    metric = "F1 score" if problem_type == "classification" else "R²"
    return (
        f"{name} outperformed all other models with a {metric} of {score:.4f}. "
        "It is recommended as the best model for this dataset."
    )
