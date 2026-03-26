"""
model_trainer.py – Model registry, train-test split, training, and prediction.
"""

import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from typing import Tuple, Any, Dict


# ---------------------------------------------------------------------------
# Model registry
# ---------------------------------------------------------------------------
CLASSIFICATION_MODELS = {
    "Logistic Regression": LogisticRegression,
    "Decision Tree":       DecisionTreeClassifier,
    "Random Forest":       RandomForestClassifier,
    "KNN":                 KNeighborsClassifier,
}

REGRESSION_MODELS = {
    "Linear Regression":          LinearRegression,
    "Decision Tree Regressor":    DecisionTreeRegressor,
    "Random Forest Regressor":    RandomForestRegressor,
    "KNN Regressor":              KNeighborsRegressor,
}

# Define hyperparameter grid for thorough optimization
PARAM_GRIDS = {
    "Logistic Regression": {"max_iter": [1000, 2000], "C": [0.1, 1.0, 10.0]},
    "Decision Tree": {"max_depth": [None, 3, 5, 10], "min_samples_split": [2, 5, 10]},
    "Random Forest": {"n_estimators": [50, 100, 200], "max_depth": [None, 10, 20]},
    "KNN": {"n_neighbors": [3, 5, 7, 10]},
    "Linear Regression": {},
    "Decision Tree Regressor": {"max_depth": [None, 3, 5, 10], "min_samples_split": [2, 5, 10]},
    "Random Forest Regressor": {"n_estimators": [50, 100, 200], "max_depth": [None, 10, 20]},
}

def get_model(problem_type: str, model_name: str, random_seed: int = 42):
    """
    Return a fresh (unfitted) sklearn estimator instantiated with the specific random seed.
    Raises ValueError for unknown model names.
    """
    registry = CLASSIFICATION_MODELS if problem_type == "classification" else REGRESSION_MODELS
    if model_name not in registry:
        raise ValueError(
            f"Unknown model '{model_name}' for problem type '{problem_type}'. "
            f"Available: {list(registry.keys())}"
        )
        
    model_class = registry[model_name]
    
    # Not all models accept random_state (e.g. KNeighborsClassifier, LinearRegression)
    try:
        return model_class(random_state=random_seed)
    except TypeError:
        return model_class()


def split_data(X, y, test_size: float = 0.2, random_seed: int = 42) -> Tuple:
    """
    Stratified split for classification; random split for regression.
    Returns X_train, X_test, y_train, y_test.
    """
    try:
        return train_test_split(X, y, test_size=test_size, random_state=random_seed, stratify=y)
    except Exception:
        return train_test_split(X, y, test_size=test_size, random_state=random_seed)


def train_model(
    model, 
    X_train, 
    y_train, 
    model_name: str = "",
    optimization_mode: str = "fast", 
    cv_folds: int = 5,
    optimization_metric: str = "auto",
    random_seed: int = 42
):
    """
    Fit a model. If optimization_mode == 'thorough', wrap in RandomizedSearchCV.
    Returns the fitted model.
    """
    if optimization_mode == "thorough" and model_name in PARAM_GRIDS and PARAM_GRIDS[model_name]:
        param_grid = PARAM_GRIDS[model_name]
        
        # Translate generic metric to sklearn scorer str
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

        n_iter = 10 # Cap evaluations to prevent excessive wait times
        search = RandomizedSearchCV(
            model, 
            param_grid, 
            n_iter=n_iter, 
            cv=cv_folds, 
            scoring=scorer,
            random_state=random_seed,
            n_jobs=-1
        )
        search.fit(X_train, y_train)
        return search.best_estimator_
        
    model.fit(X_train, y_train)
    return model


def predict(model, X_test) -> np.ndarray:
    """Return predictions."""
    return model.predict(X_test)


def get_feature_importances(model, feature_names: list) -> list:
    """
    Extract feature importances for tree-based models.
    Returns [{feature, importance}, ...] sorted descending,
    or [] if the model doesn't expose feature_importances_.
    """
    if not hasattr(model, "feature_importances_"):
        # For linear models use absolute coefficients
        if hasattr(model, "coef_"):
            coefs = np.abs(model.coef_).flatten()[:len(feature_names)]
            total = coefs.sum() or 1
            return sorted(
                [{"feature": f, "importance": round(float(c / total), 4)}
                 for f, c in zip(feature_names, coefs)],
                key=lambda x: x["importance"], reverse=True,
            )
        return []

    importances = model.feature_importances_
    ranked = sorted(
        [{"feature": f, "importance": round(float(i), 4)}
         for f, i in zip(feature_names, importances)],
        key=lambda x: x["importance"], reverse=True,
    )
    return ranked
