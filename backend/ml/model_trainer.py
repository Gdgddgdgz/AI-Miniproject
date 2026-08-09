"""
model_trainer.py – Model registry, pipeline assembly, training, and prediction.
"""

import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from typing import Tuple, Any, Dict, List

# Try importing XGBoost & LightGBM with robust fallbacks
try:
    from xgboost import XGBClassifier, XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    from lightgbm import LGBMClassifier, LGBMRegressor
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False


CLASSIFICATION_MODELS = {
    "Logistic Regression": LogisticRegression,
    "Decision Tree":       DecisionTreeClassifier,
    "Random Forest":       RandomForestClassifier,
    "KNN":                 KNeighborsClassifier,
}
if HAS_XGB:
    CLASSIFICATION_MODELS["XGBoost"] = XGBClassifier
if HAS_LGBM:
    CLASSIFICATION_MODELS["LightGBM"] = LGBMClassifier

REGRESSION_MODELS = {
    "Linear Regression":          LinearRegression,
    "Decision Tree Regressor":    DecisionTreeRegressor,
    "Random Forest Regressor":    RandomForestRegressor,
    "KNN Regressor":              KNeighborsRegressor,
}
if HAS_XGB:
    REGRESSION_MODELS["XGBoost Regressor"] = XGBRegressor
if HAS_LGBM:
    REGRESSION_MODELS["LightGBM Regressor"] = LGBMRegressor


PARAM_GRIDS = {
    "Logistic Regression": {"model__max_iter": [1000, 2000], "model__C": [0.1, 1.0, 10.0]},
    "Decision Tree": {"model__max_depth": [None, 3, 5, 10], "model__min_samples_split": [2, 5, 10]},
    "Random Forest": {"model__n_estimators": [50, 100, 200], "model__max_depth": [None, 10, 20]},
    "KNN": {"model__n_neighbors": [3, 5, 7, 10]},
    "XGBoost": {"model__n_estimators": [50, 100], "model__learning_rate": [0.01, 0.1]},
    "LightGBM": {"model__n_estimators": [50, 100], "model__learning_rate": [0.01, 0.1]},
    "Linear Regression": {},
    "Decision Tree Regressor": {"model__max_depth": [None, 3, 5, 10], "model__min_samples_split": [2, 5, 10]},
    "Random Forest Regressor": {"model__n_estimators": [50, 100, 200], "model__max_depth": [None, 10, 20]},
    "XGBoost Regressor": {"model__n_estimators": [50, 100], "model__learning_rate": [0.01, 0.1]},
    "LightGBM Regressor": {"model__n_estimators": [50, 100], "model__learning_rate": [0.01, 0.1]},
}


def get_model_estimator(problem_type: str, model_name: str, random_seed: int = 42):
    """Return a fresh unfitted estimator instance."""
    registry = CLASSIFICATION_MODELS if problem_type == "classification" else REGRESSION_MODELS
    if model_name not in registry:
        raise ValueError(
            f"Unknown model '{model_name}' for problem type '{problem_type}'. "
            f"Available: {list(registry.keys())}"
        )
        
    model_class = registry[model_name]
    try:
        return model_class(random_state=random_seed)
    except TypeError:
        return model_class()


def build_full_pipeline(preprocessor, estimator) -> Pipeline:
    """Combine preprocessor ColumnTransformer and estimator into a single sklearn Pipeline."""
    return Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", estimator)
    ])


def split_data(X, y, test_size: float = 0.2, random_seed: int = 42) -> Tuple:
    """Stratified split for classification; random split for regression."""
    try:
        return train_test_split(X, y, test_size=test_size, random_state=random_seed, stratify=y)
    except Exception:
        return train_test_split(X, y, test_size=test_size, random_state=random_seed)


def train_pipeline(
    pipeline: Pipeline, 
    X_train, 
    y_train, 
    model_name: str = "",
    optimization_mode: str = "fast", 
    cv_folds: int = 5,
    optimization_metric: str = "auto",
    random_seed: int = 42
) -> Pipeline:
    """
    Fit the full Pipeline strictly on X_train to prevent data leakage.
    Wrap in RandomizedSearchCV if optimization_mode == 'thorough'.
    """
    if optimization_mode == "thorough" and model_name in PARAM_GRIDS and PARAM_GRIDS[model_name]:
        param_grid = PARAM_GRIDS[model_name]
        scorer = None
        if optimization_metric != "auto":
            scorer_map = {
                "accuracy":  "accuracy",
                "f1":        "f1_weighted",
                "recall":    "recall_weighted",
                "precision": "precision_weighted",
                "r2":        "r2",
                "rmse":      "neg_root_mean_squared_error",
                "mae":       "neg_mean_absolute_error",
            }
            scorer = scorer_map.get(optimization_metric)

        n_iter = 10
        search = RandomizedSearchCV(
            pipeline, 
            param_grid, 
            n_iter=n_iter, 
            cv=cv_folds, 
            scoring=scorer,
            random_state=random_seed,
            n_jobs=-1
        )
        search.fit(X_train, y_train)
        return search.best_estimator_
        
    pipeline.fit(X_train, y_train)
    return pipeline


def get_feature_importances(pipeline: Pipeline, feature_names: List[str]) -> List[Dict]:
    """
    Extract feature importances from a fitted Pipeline.
    """
    model = pipeline.named_steps.get("model")
    if model is None:
        return []

    importances = None
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        coefs = np.abs(model.coef_).flatten()[:len(feature_names)]
        total = coefs.sum() or 1
        importances = coefs / total

    if importances is None:
        return []

    ranked = sorted(
        [{"feature": f, "importance": round(float(i), 4)}
         for f, i in zip(feature_names, importances)],
        key=lambda x: x["importance"], reverse=True,
    )
    return ranked

