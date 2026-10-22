"""
explainer.py – Dynamic Explainable AI (XAI) & Automated Model Diagnostics.
"""

from typing import Dict, Any, List


def generate_explanation(
    model_name: str,
    problem_type: str,
    metrics: Dict[str, Any],
    feature_importances: List[Dict],
    is_best: bool = False,
) -> str:
    """
    Build a dynamic, data-driven explanation of the trained model result.
    """
    top_features = [f['feature'] for f in feature_importances[:3]] if feature_importances else []
    feat_str = f" Key driver features include: {', '.join(top_features)}." if top_features else ""

    if problem_type == "classification":
        acc = metrics.get("accuracy", 0.0)
        f1 = metrics.get("f1_score", 0.0)
        prec = metrics.get("precision", 0.0)
        rec = metrics.get("recall", 0.0)

        quality = "outstanding" if f1 >= 0.85 else ("solid" if f1 >= 0.65 else "sub-optimal")
        
        explanation = (
            f"{model_name} delivered an {quality} predictive performance with an F1-Score of {f1:.2%} "
            f"(Accuracy: {acc:.2%}, Precision: {prec:.2%}, Recall: {rec:.2%}).{feat_str}"
        )
    else:
        r2 = metrics.get("r2", 0.0)
        rmse = metrics.get("rmse", 0.0)
        mae = metrics.get("mae", 0.0)

        fit_quality = "strong" if r2 >= 0.80 else ("moderate" if r2 >= 0.50 else "weak")

        explanation = (
            f"{model_name} demonstrated a {fit_quality} fit, explaining {r2:.2%} of target variance (R² = {r2:.4f}). "
            f"Error metrics: RMSE = {rmse:.4f}, MAE = {mae:.4f}.{feat_str}"
        )

    if is_best:
        explanation = "🏆 Recommended Model: " + explanation

    return explanation


def generate_comparison_summary(best_model: Dict, problem_type: str, metric: str = "auto") -> str:
    """Generate a detailed summary comparing model benchmarks."""
    if not best_model:
        return "No model completed the comparison. Check the per-model errors and dataset size."
    name  = best_model.get("model", "Unknown")
    score = best_model.get("score", 0.0)
    metric_names = {
        "accuracy": "Accuracy", "f1": "weighted F1", "recall": "weighted recall",
        "precision": "weighted precision", "r2": "R²", "rmse": "RMSE", "mae": "MAE",
    }
    metric_label = metric_names.get(metric, "weighted F1" if problem_type == "classification" else "R²")
    return (
        f"Cross-validation ranked {name} highest by {metric_label} ({score:.4f}). "
        "The holdout metrics below are reported separately for the selected model."
    )

