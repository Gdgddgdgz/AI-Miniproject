"""
train.py – POST /train  &  POST /compare

POST /train
  Train a single user-selected model and return metrics + predictions.

POST /compare
  Train ALL applicable models automatically and return a ranked comparison table.
"""

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from sklearn.base import clone
from sklearn.model_selection import cross_val_score, KFold, StratifiedKFold

from utils.helpers import get_session
from utils.auth import get_current_user
from utils.history import save_model_to_history
from ml.preprocessing import (
    prepare_features_and_target,
    get_image_columns,
    build_preprocessor,
    get_feature_names_from_preprocessor,
)
from ml.model_trainer import (
    PARAM_GRIDS,
    get_model_estimator,
    build_full_pipeline,
    split_data,
    train_pipeline,
    get_feature_importances,
)
from ml.model_selector import detect_problem_type, get_model_list
from ml.evaluator import evaluate
from ml.explainer import generate_explanation, generate_comparison_summary

router = APIRouter()


class AdvancedConfigBase(BaseModel):
    target: str
    test_size: float = 0.2
    problem_type: Optional[str] = None
    features_to_drop: Optional[list] = None
    imputation_strategy: str = "mean"
    optimization_mode: str = "fast"
    scaling: str = "none"
    cv_folds: int = 5
    optimization_metric: str = "auto"
    random_seed: int = 42

    def validate_advanced(self):
        if not (2 <= self.cv_folds <= 20):
            raise ValueError("cv_folds must be between 2 and 20.")
        if not (0.05 <= self.test_size <= 0.5):
            raise ValueError("test_size must be between 0.05 and 0.50.")
        if self.problem_type not in (None, "classification", "regression"):
            raise ValueError("problem_type must be classification or regression.")
        if self.imputation_strategy not in {"mean", "median", "most_frequent", "zero", "drop"}:
            raise ValueError("Unsupported imputation strategy.")
        if self.scaling not in {"none", "standard", "minmax"}:
            raise ValueError("Unsupported feature scaling option.")
        if self.optimization_mode not in {"fast", "thorough"}:
            raise ValueError("optimization_mode must be fast or thorough.")
        if self.optimization_metric not in {"auto", "accuracy", "f1", "recall", "precision", "r2", "rmse", "mae"}:
            raise ValueError("Unsupported optimization metric.")
        if self.random_seed < 0:
            raise ValueError("random_seed must be non-negative.")


class TrainRequest(AdvancedConfigBase):
    model: str


def _run_pipeline(
    df,
    target_col: str,
    model_name: str,
    test_size: float,
    provided_problem_type: Optional[str] = None,
    features_to_drop: Optional[list] = None,
    imputation_strategy: str = "mean",
    optimization_mode: str = "fast",
    scaling: str = "none",
    cv_folds: int = 5,
    optimization_metric: str = "auto",
    random_seed: int = 42,
    benchmark_metric: Optional[str] = None,
):
    """
    1. Extract X (raw features) and y (target).
    2. Split X_train, X_test, y_train, y_test BEFORE fitting scalers/imputers.
    3. Assemble unfitted ColumnTransformer preprocessor.
    4. Assemble full Pipeline(steps=[('preprocessor', preprocessor), ('model', estimator)]).
    5. Fit full pipeline strictly on X_train.
    6. Evaluate predictions on X_test.
    """
    problem_type = provided_problem_type or detect_problem_type(df, target_col)
    if problem_type not in {"classification", "regression"}:
        raise ValueError("problem_type must be classification or regression.")
    if problem_type == "regression" and not pd.api.types.is_numeric_dtype(df[target_col].dtype):
        raise ValueError("Regression requires a numeric target. Choose classification for text labels.")
    classification_metrics = {"accuracy", "f1", "recall", "precision"}
    regression_metrics = {"r2", "rmse", "mae"}
    if optimization_metric in (regression_metrics if problem_type == "classification" else classification_metrics):
        raise ValueError(f"Optimization metric '{optimization_metric}' does not apply to {problem_type}.")

    X, y, num_cols, cat_cols, label_encoder = prepare_features_and_target(
        df,
        target_col,
        features_to_drop=features_to_drop,
        imputation_strategy=imputation_strategy,
    )

    if y.nunique() < 2:
        raise ValueError("The selected target needs at least two distinct non-empty values.")
    X_train, X_test, y_train, y_test = split_data(
        X, y, test_size=test_size, random_seed=random_seed,
        stratify=problem_type == "classification",
    )

    preprocessor = build_preprocessor(
        num_cols, cat_cols, imputation_strategy=imputation_strategy, scaling=scaling
    )
    estimator = get_model_estimator(problem_type, model_name, random_seed=random_seed)
    
    pipeline = build_full_pipeline(preprocessor, estimator)

    cv_score = None
    scoring = {
            "accuracy": "accuracy", "f1": "f1_weighted", "recall": "recall_weighted",
            "precision": "precision_weighted", "r2": "r2",
            "rmse": "neg_root_mean_squared_error", "mae": "neg_mean_absolute_error",
            "auto": "f1_weighted" if problem_type == "classification" else "r2",
    }.get(benchmark_metric or "auto")
    if scoring is None:
        raise ValueError(f"Unsupported optimization metric: {benchmark_metric}")
    tuned_search = optimization_mode == "thorough" and bool(PARAM_GRIDS.get(model_name))
    if benchmark_metric is not None and not tuned_search:
        if problem_type == "classification":
            smallest_class = int(pd.Series(y_train).value_counts().min())
            folds = min(cv_folds, smallest_class)
            if folds < 2:
                raise ValueError("Cross-validation needs at least two training examples in every class.")
            cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=random_seed)
        else:
            folds = min(cv_folds, len(y_train))
            if folds < 2:
                raise ValueError("Cross-validation needs at least two training rows.")
            cv = KFold(n_splits=folds, shuffle=True, random_state=random_seed)
        cv_values = cross_val_score(clone(pipeline), X_train, y_train, cv=cv, scoring=scoring, n_jobs=1)
        cv_score = float(np.mean(cv_values))
        if benchmark_metric in {"rmse", "mae"}:
            cv_score = -cv_score

    fitted_pipeline, tuning_score = train_pipeline(
        pipeline,
        X_train,
        y_train,
        model_name=model_name,
        optimization_mode=optimization_mode,
        cv_folds=cv_folds,
        optimization_metric=optimization_metric,
        random_seed=random_seed,
    )
    if benchmark_metric is not None and tuning_score is not None:
        cv_score = -tuning_score if benchmark_metric in {"rmse", "mae"} else tuning_score
    if benchmark_metric is not None and (cv_score is None or not np.isfinite(cv_score)):
        raise ValueError("Cross-validation did not produce a finite score for this model and dataset.")

    y_pred = fitted_pipeline.predict(X_test)
    metrics = evaluate(problem_type, y_test, y_pred)
    if label_encoder is not None:
        metrics["confusion_matrix_labels"] = [
            str(label_encoder.classes_[int(label)])
            for label in metrics["confusion_matrix_labels"]
        ]

    fitted_prep = fitted_pipeline.named_steps["preprocessor"]
    transformed_feature_names = get_feature_names_from_preprocessor(fitted_prep, num_cols, cat_cols)
    importances = get_feature_importances(fitted_pipeline, transformed_feature_names)

    def _to_list(arr):
        result = []
        for v in arr:
            if isinstance(v, (np.integer, int)):
                result.append(int(v))
            elif isinstance(v, (np.floating, float)):
                result.append(float(v))
            else:
                result.append(str(v))
        return result

    return (
        fitted_pipeline,
        metrics,
        _to_list(label_encoder.inverse_transform(np.asarray(y_test, dtype=int)) if label_encoder is not None else (y_test.values if hasattr(y_test, "values") else y_test)),
        _to_list(label_encoder.inverse_transform(np.asarray(y_pred, dtype=int)) if label_encoder is not None else y_pred),
        importances,
        problem_type,
        transformed_feature_names,
        label_encoder,
        list(X.columns),
        cv_score,
    )


def _recommended_item(df, target_col, pipeline, raw_features, label_encoder, session):
    image_columns = get_image_columns(df)
    if not image_columns:
        return None
    valid_df = df.dropna(subset=[target_col])
    if valid_df.empty:
        return None
    predicted = np.asarray(pipeline.predict(valid_df[raw_features]))
    if label_encoder is not None:
        numeric_labels = pd.to_numeric(pd.Series(label_encoder.classes_), errors="coerce")
        if not numeric_labels.notna().all():
            return None
        preferred_class = int(numeric_labels.idxmax())
        matches = np.flatnonzero(predicted.astype(int) == preferred_class)
        best_idx = int(matches[0]) if len(matches) else int(np.argmax(predicted.astype(float)))
        best_value = label_encoder.classes_[int(predicted[best_idx])]
    else:
        best_idx = int(np.nanargmax(predicted.astype(float)))
        best_value = predicted[best_idx]
    row = valid_df.iloc[best_idx]
    image_ref = row.get(image_columns[0])
    if pd.isna(image_ref):
        image_ref = None
    else:
        image_ref = str(image_ref)
        normalized = image_ref.replace("\\", "/")
        image_ref = session.get("image_map", {}).get(normalized, session.get("image_map", {}).get(normalized.split("/")[-1], image_ref))
    id_col = next((c for c in df.columns if str(c).lower() in {"id", "wine_id", "apartment_id", "name", "wine_name", "apartment_name", "title"}), None)
    return {
        "label": str(row[id_col]) if id_col else f"Dataset row {best_idx + 1}",
        "prediction": str(best_value),
        "image_url": image_ref,
    }


@router.post("/train", summary="Train a single ML model")
def train_single_model(
    body: TrainRequest,
    current_user: str = Depends(get_current_user),
):
    session = get_session(current_user)
    df = session.get("raw_df")

    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Please POST /upload first.")
    if body.target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{body.target}' not found.")

    try:
        body.validate_advanced()
        fitted_pipeline, metrics, y_test, y_pred, importances, problem_type, feature_names, label_encoder, raw_features, _ = _run_pipeline(
            df,
            body.target,
            body.model,
            body.test_size,
            body.problem_type,
            features_to_drop=body.features_to_drop,
            imputation_strategy=body.imputation_strategy,
            optimization_mode=body.optimization_mode,
            scaling=body.scaling,
            cv_folds=body.cv_folds,
            optimization_metric=body.optimization_metric,
            random_seed=body.random_seed,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

    session["trained_model"] = fitted_pipeline
    session["model_name"] = body.model
    session["target_column"] = body.target
    session["problem_type"] = problem_type
    session["feature_columns"] = feature_names
    session["label_encoder"] = label_encoder
    session["raw_feature_columns"] = raw_features

    try:
        save_model_to_history(
            model_name=body.model,
            target=body.target,
            metrics=metrics,
            params={"test_size": body.test_size, "optimization_mode": body.optimization_mode},
            username=current_user,
            problem_type=problem_type,
        )
    except Exception as e:
        print(f"Warning: Failed to save model history: {e}")

    predictions = [
        {"actual": a, "predicted": p}
        for i, (a, p) in enumerate(zip(y_test, y_pred))
        if i < 200
    ]
    capped_importances = importances[:20]
    explanation = generate_explanation(
        model_name=body.model,
        problem_type=problem_type,
        metrics=metrics,
        feature_importances=importances,
        is_best=False,
    )

    try:
        recommended_item = _recommended_item(df, body.target, fitted_pipeline, raw_features, label_encoder, session)
    except Exception:
        recommended_item = None

    return {
        "problem_type": problem_type,
        "model": body.model,
        "target": body.target,
        "test_size": body.test_size,
        "metrics": metrics,
        "predictions": predictions,
        "feature_importances": capped_importances,
        "explanation": explanation,
        "raw_features": raw_features,
        "recommended_item": recommended_item,
    }


@router.post("/compare", summary="Compare all applicable ML models")
def compare_models(
    body: AdvancedConfigBase,
    current_user: str = Depends(get_current_user),
):
    session = get_session(current_user)
    df = session.get("raw_df")

    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Please POST /upload first.")
    if body.target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{body.target}' not found.")

    try:
        body.validate_advanced()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    session["trained_model"] = None
    session["model_name"] = None
    session["feature_columns"] = None
    session["raw_feature_columns"] = None
    session["label_encoder"] = None
    problem_type = body.problem_type or detect_problem_type(df, body.target)
    model_names = get_model_list(problem_type)

    comparison = []
    pipeline_cache = {}

    for name in model_names:
        try:
            out = _run_pipeline(
                df, body.target, name, body.test_size, problem_type,
                features_to_drop=body.features_to_drop,
                imputation_strategy=body.imputation_strategy,
                optimization_mode=body.optimization_mode,
                scaling=body.scaling,
                cv_folds=body.cv_folds,
                optimization_metric=body.optimization_metric,
                random_seed=body.random_seed,
                benchmark_metric=body.optimization_metric,
            )
            pipeline_cache[name] = out
            score = out[9]
            rank_score = -score if body.optimization_metric in {"rmse", "mae"} else score
            comparison.append({"model": name, "score": round(score, 4), "rank_score": rank_score})
        except Exception as e:
            comparison.append({"model": name, "score": None, "error": str(e)})

    successful = [entry for entry in comparison if not entry.get("error")]
    comparison.sort(key=lambda x: x.get("rank_score", float("-inf")), reverse=True)
    best = max(successful, key=lambda x: x["rank_score"]) if successful else {}
    for entry in comparison:
        entry.pop("rank_score", None)

    best_result = None
    if best and not best.get("error") and best["model"] in pipeline_cache:
        try:
            out = pipeline_cache[best["model"]]
            b_pipeline, b_metrics, b_y_test, b_y_pred, b_importances, b_pt, b_feature_names, b_le, b_raw, _ = out
            session["trained_model"] = b_pipeline
            session["model_name"] = best["model"]
            session["target_column"] = body.target
            session["problem_type"] = b_pt
            session["feature_columns"] = b_feature_names
            session["label_encoder"] = b_le
            session["raw_feature_columns"] = b_raw
            best_result = {
                "model": best["model"], "target": body.target,
                "problem_type": b_pt, "metrics": b_metrics,
                "predictions": [{"actual": a, "predicted": p} for a, p in zip(b_y_test[:200], b_y_pred[:200])],
                "feature_importances": b_importances[:20],
                "raw_features": b_raw,
                "recommended_item": None,
                "explanation": generate_explanation(best["model"], b_pt, b_metrics, b_importances),
            }
            try:
                best_result["recommended_item"] = _recommended_item(df, body.target, b_pipeline, b_raw, b_le, session)
            except Exception:
                pass
        except Exception:
            session["trained_model"] = None
            session["model_name"] = None
            session["feature_columns"] = None
            session["raw_feature_columns"] = None
            session["label_encoder"] = None
            for entry in comparison:
                if entry["model"] == best["model"]:
                    entry["score"] = None
                    entry["error"] = "The selected model could not be prepared for the results page."
            best = {}
            best_result = None

    metric_name = body.optimization_metric if body.optimization_metric != "auto" else ("f1" if problem_type == "classification" else "r2")
    summary = generate_comparison_summary(best, problem_type, metric_name)

    if best_result:
        try:
            save_model_to_history(
                model_name=best["model"],
                target=body.target,
                metrics=best_result["metrics"],
                params={"test_size": body.test_size, "mode": "compare", "metric": metric_name},
                username=current_user,
                problem_type=problem_type,
                primary_score=best["score"],
            )
        except Exception as e:
            print(f"Warning: Failed to save model history: {e}")

    return {
        "problem_type": problem_type,
        "comparison": comparison,
        "best_model": best,
        "best_result": best_result,
        "summary": summary,
        "metric": metric_name,
    }

