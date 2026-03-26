"""
preprocessing.py – Auto preprocessing engine.

Steps applied in order:
  1. Separate features from the target column.
  2. Impute missing values  (mean for numerical, mode for categorical).
  3. Encode categorical features with OneHotEncoding.
  4. Scale numerical features with StandardScaler.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from typing import Tuple, List


def get_column_types(df: pd.DataFrame) -> Tuple[List[str], List[str]]:
    """
    Return (numerical_cols, categorical_cols) excluding the target column.
    """
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    return num_cols, cat_cols


def build_preprocessor(num_cols: List[str], cat_cols: List[str], imputation_strategy: str = "mean", scaling: str = "none") -> ColumnTransformer:
    """
    Build a sklearn ColumnTransformer that:
      - Imputes + scales numerical columns.
      - Imputes + one-hot-encodes categorical columns.
    """
    numeric_steps = []
    if imputation_strategy != "drop":
        # simple imputer doesn't accept "drop", it's handled in pandas before this
        strat = imputation_strategy if imputation_strategy in ["mean", "median", "most_frequent"] else "mean"
        if imputation_strategy == "zero":
            numeric_steps.append(("imputer", SimpleImputer(strategy="constant", fill_value=0)))
        else:
            numeric_steps.append(("imputer", SimpleImputer(strategy=strat)))
            
    if scaling == "standard":
        numeric_steps.append(("scaler", StandardScaler()))
    elif scaling == "minmax":
        numeric_steps.append(("scaler", MinMaxScaler()))
        
    numeric_transformer = Pipeline(steps=numeric_steps) if numeric_steps else "passthrough"

    cat_strat = "most_frequent" if imputation_strategy != "zero" else "constant"
    cat_steps = []
    if imputation_strategy != "drop":
        cat_steps.append(("imputer", SimpleImputer(strategy=cat_strat, fill_value="missing" if cat_strat=="constant" else None)))
    cat_steps.append(("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)))
    
    categorical_transformer = Pipeline(steps=cat_steps)

    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, num_cols),
        ("cat", categorical_transformer, cat_cols),
    ])

    return preprocessor


def preprocess_dataframe(
    df: pd.DataFrame, 
    target_col: str, 
    features_to_drop: List[str] = None,
    imputation_strategy: str = "mean",
    scaling: str = "none"
):
    """
    Full preprocessing pipeline.

    Returns
    -------
    X_processed : np.ndarray
    y            : pd.Series  (raw target values)
    feature_names: list[str]  (column names after encoding)
    preprocessor : fitted ColumnTransformer
    label_encoder: fitted LabelEncoder | None  (only for classification targets)
    """
    df = df.copy()

    if features_to_drop:
        cols_to_drop = [c for c in features_to_drop if c in df.columns and c != target_col]
        df = df.drop(columns=cols_to_drop)

    if imputation_strategy == "drop":
        df = df.dropna()

    # Separate features / target
    X = df.drop(columns=[target_col])
    y = df[target_col]

    num_cols, cat_cols = get_column_types(X)

    preprocessor = build_preprocessor(num_cols, cat_cols, imputation_strategy, scaling)
    X_processed = preprocessor.fit_transform(X)

    # Build feature names after one-hot encoding
    ohe_feature_names = []
    if cat_cols:
        ohe: OneHotEncoder = preprocessor.named_transformers_["cat"]["onehot"]
        ohe_feature_names = ohe.get_feature_names_out(cat_cols).tolist()
    feature_names = num_cols + ohe_feature_names

    # Encode the target only for classification (non-numeric dtype)
    label_encoder = None
    if y.dtype == object or str(y.dtype) == "category":
        label_encoder = LabelEncoder()
        y = pd.Series(label_encoder.fit_transform(y), name=target_col)

    return X_processed, y, feature_names, preprocessor, label_encoder


def preprocess_for_preview(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """
    Return a DataFrame preview of the preprocessed data (for the /preprocess endpoint).
    """
    X_processed, y, feature_names, _, _ = preprocess_dataframe(df, target_col)
    processed_df = pd.DataFrame(X_processed, columns=feature_names)
    processed_df[target_col] = y.values
    return processed_df
