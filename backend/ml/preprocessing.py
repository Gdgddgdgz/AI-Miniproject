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
    Build an unfitted sklearn ColumnTransformer that:
      - Imputes + scales numerical columns.
      - Imputes + one-hot-encodes categorical columns.
    """
    transformers = []
    
    if num_cols:
        numeric_steps = []
        if imputation_strategy != "drop":
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
        transformers.append(("num", numeric_transformer, num_cols))

    if cat_cols:
        cat_strat = "most_frequent" if imputation_strategy != "zero" else "constant"
        cat_steps = []
        if imputation_strategy != "drop":
            cat_steps.append(("imputer", SimpleImputer(strategy=cat_strat, fill_value="missing" if cat_strat == "constant" else None)))
        cat_steps.append(("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)))
        categorical_transformer = Pipeline(steps=cat_steps)
        transformers.append(("cat", categorical_transformer, cat_cols))

    if not transformers:
        raise ValueError("Dataset has no numerical or categorical feature columns.")

    return ColumnTransformer(transformers=transformers)


def get_feature_names_from_preprocessor(preprocessor: ColumnTransformer, num_cols: List[str], cat_cols: List[str]) -> List[str]:
    """Extract feature names after fitting ColumnTransformer."""
    feature_names = []
    if num_cols and "num" in preprocessor.named_transformers_:
        feature_names.extend(num_cols)
    if cat_cols and "cat" in preprocessor.named_transformers_:
        try:
            cat_trans = preprocessor.named_transformers_["cat"]
            ohe = cat_trans.named_steps["onehot"] if isinstance(cat_trans, Pipeline) else cat_trans
            cat_names = ohe.get_feature_names_out(cat_cols).tolist()
            feature_names.extend(cat_names)
        except Exception:
            feature_names.extend([f"{c}_encoded" for c in cat_cols])
    return feature_names


def prepare_features_and_target(
    df: pd.DataFrame, 
    target_col: str, 
    features_to_drop: List[str] = None,
    imputation_strategy: str = "mean",
):
    """
    Extract X (raw features dataframe) and y (processed target series), plus column dtypes.
    Performs dropna if imputation_strategy is 'drop'.
    """
    df = df.copy()

    if features_to_drop:
        cols_to_drop = [c for c in features_to_drop if c in df.columns and c != target_col]
        df = df.drop(columns=cols_to_drop)

    # Drop target nulls
    df = df.dropna(subset=[target_col])

    if imputation_strategy == "drop":
        df = df.dropna()

    X = df.drop(columns=[target_col])
    y = df[target_col]

    # Encode non-numeric targets for classification
    label_encoder = None
    if y.dtype == object or str(y.dtype) == "category" or not np.issubdtype(y.dtype, np.number):
        label_encoder = LabelEncoder()
        y = pd.Series(label_encoder.fit_transform(y.astype(str)), name=target_col, index=X.index)

    num_cols, cat_cols = get_column_types(X)
    return X, y, num_cols, cat_cols, label_encoder


def preprocess_for_preview(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """
    Return a preview of the preprocessed data (for the /preprocess endpoint) by fitting on sample data.
    """
    X, y, num_cols, cat_cols, _ = prepare_features_and_target(df, target_col)
    preprocessor = build_preprocessor(num_cols, cat_cols)
    X_processed = preprocessor.fit_transform(X)
    feature_names = get_feature_names_from_preprocessor(preprocessor, num_cols, cat_cols)
    
    processed_df = pd.DataFrame(X_processed, columns=feature_names, index=X.index)
    processed_df[target_col] = y.values
    return processed_df

