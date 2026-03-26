"""
upload.py – POST /upload, POST /reset
Accepts a CSV file, reads it with pandas, stores it in the user's session,
and returns a preview with column metadata.
"""

import io
import os
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from utils.helpers import get_session, reset_session, df_to_records, column_dtypes
from utils.auth import get_current_user

router = APIRouter()


@router.post("/upload", summary="Upload a CSV dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    """
    Upload a CSV file. Stores it in the user's isolated session.

    Returns
    -------
    - filename
    - shape: [n_rows, n_cols]
    - columns: list of column names
    - dtypes: {column: dtype_string}
    - preview: first 20 rows as list of dicts
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file contains no data rows.")

    if len(df.columns) < 2:
        raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns.")

    # Persist in user-specific session
    session = get_session(current_user)
    session["raw_df"] = df
    session["processed_df"] = None
    session["trained_model"] = None
    session["target_column"] = None
    session["problem_type"] = None

    return {
        "filename": file.filename,
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "dtypes": column_dtypes(df),
        "preview": df_to_records(df, max_rows=20),
    }


@router.post("/reset", summary="Reset the current user's project session")
async def reset_project(current_user: str = Depends(get_current_user)):
    """Clear all session data for the current user."""
    reset_session(current_user)
    return {"status": "success", "message": "Session cleared successfully."}
