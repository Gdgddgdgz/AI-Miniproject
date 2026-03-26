"""
analyze.py – GET /analyze
Returns a statistical summary of the user's uploaded dataset.
"""

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends

from utils.helpers import get_session
from utils.auth import get_current_user

router = APIRouter()


@router.get("/analyze", summary="Analyze the uploaded dataset")
async def analyze_dataset(current_user: str = Depends(get_current_user)):
    """
    Analyse the currently uploaded dataset for the current user.

    Returns
    -------
    - shape: [n_rows, n_cols]
    - numerical_columns: list of numeric column names
    - categorical_columns: list of categorical column names
    - missing_values: {column: count_of_nulls}
    - unique_values: {column: count_of_unique}
    - statistics: pandas describe() as dict (numeric cols only)
    """
    session = get_session(current_user)
    df: pd.DataFrame = session.get("raw_df")

    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded. Please POST /upload first.",
        )

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    missing_values = {
        col: int(df[col].isnull().sum())
        for col in df.columns
        if df[col].isnull().sum() > 0
    }

    unique_values = {col: int(df[col].nunique()) for col in df.columns}

    describe_dict = {}
    if numeric_cols:
        stats = df[numeric_cols].describe().round(4)
        describe_dict = stats.to_dict()

    return {
        "shape": list(df.shape),
        "numerical_columns": numeric_cols,
        "categorical_columns": cat_cols,
        "missing_values": missing_values,
        "unique_values": unique_values,
        "statistics": describe_dict,
    }
