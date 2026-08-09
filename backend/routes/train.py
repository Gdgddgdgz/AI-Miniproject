"""
train.py – POST /train  &  POST /compare

POST /train
  Train a single user-selected model and return metrics + predictions.

POST /compare
  Train ALL applicable models automatically and return a ranked comparison table.
"""

import pickle
import numpy as np
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel

from utils.helpers import get_session
from utils.auth import get_current_user
from utils.history import save_model_to_history
from ml.preprocessing import (
    prepare_features_and_target,
    build_preprocessor,
    get_feature_names_from_preprocessor,
)
from ml.model_trainer import (
    get_model_estimator,
    build_full_pipeline,
    split_data,
    train_pipeline,
    get_feature_importances,
)
from ml.model_selector import detect_problem_type, get_model_list, get_best_model
from ml.evaluator import evaluate, get_primary_score
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

    X, y, num_cols, cat_cols, label_encoder = prepare_features_and_target(
        df,
        target_col,
        features_to_drop=features_to_drop,
        imputation_strategy=imputation_strategy,
    )

    X_train, X_test, y_train, y_test = split_data(
        X, y, test_size=test_size, random_seed=random_seed
    )

    preprocessor = build_preprocessor(
        num_cols, cat_cols, imputation_strategy=imputation_strategy, scaling=scaling
    )
    estimator = get_model_estimator(problem_type, model_name, random_seed=random_seed)
    
    pipeline = build_full_pipeline(preprocessor, estimator)

    fitted_pipeline = train_pipeline(
        pipeline,
        X_train,
        y_train,
        model_name=model_name,
        optimization_mode=optimization_mode,
        cv_folds=cv_folds,
        optimization_metric=optimization_metric,
        random_seed=random_seed,
    )

    y_pred = fitted_pipeline.predict(X_test)
    metrics = evaluate(problem_type, y_test, y_pred)

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
        _to_list(y_test.values if hasattr(y_test, "values") else y_test),
        _to_list(y_pred),
        importances,
        problem_type,
        transformed_feature_names,
        label_encoder,
        list(X.columns),
    )


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
        fitted_pipeline, metrics, y_test, y_pred, importances, problem_type, feature_names, label_encoder, raw_features = _run_pipeline(
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

    return {
        "problem_type": problem_type,
        "model": body.model,
        "test_size": body.test_size,
        "metrics": metrics,
        "predictions": predictions,
        "feature_importances": capped_importances,
        "explanation": explanation,
        "raw_features": raw_features,
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
            )
            pipeline_cache[name] = out
            metrics = out[1]
            score = get_primary_score(problem_type, metrics)
            comparison.append({"model": name, "score": round(score, 4), "metrics": metrics})
        except Exception as e:
            comparison.append({"model": name, "score": 0.0, "error": str(e)})

    comparison.sort(key=lambda x: x.get("score", 0), reverse=True)
    best = get_best_model(comparison)

    if best and not best.get("error") and best["model"] in pipeline_cache:
        try:
            b_pipeline, _, _, _, _, b_pt, b_feats, b_le, b_raw = pipeline_cache[best["model"]]
            session["trained_model"] = b_pipeline
            session["model_name"] = best["model"]
            session["target_column"] = body.target
            session["problem_type"] = b_pt
            session["feature_columns"] = b_feats
            session["label_encoder"] = b_le
            session["raw_feature_columns"] = b_raw
        except Exception:
            pass

    summary = generate_comparison_summary(best, problem_type)

    if best and not best.get("error"):
        try:
            save_model_to_history(
                model_name=best["model"],
                target=body.target,
                metrics=best["metrics"],
                params={"test_size": body.test_size, "mode": "compare"},
                username=current_user,
                problem_type=problem_type,
            )
        except Exception as e:
            print(f"Warning: Failed to save model history: {e}")

    return {
        "problem_type": problem_type,
        "comparison": comparison,
        "best_model": best,
        "summary": summary,
    }

