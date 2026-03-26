"""
preprocess.py – POST /preprocess
Applies preprocessing and returns a preview + problem type detection.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from utils.helpers import get_session
from utils.auth import get_current_user
from ml.preprocessing import preprocess_for_preview
from ml.model_selector import detect_problem_type

router = APIRouter()


class PreprocessRequest(BaseModel):
    target_column: str


@router.post("/preprocess", summary="Preprocess the uploaded dataset")
async def preprocess_dataset(
    request: PreprocessRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Apply preprocessing pipeline and detect problem type.

    Returns
    -------
    - status: "success"
    - problem_type: "classification" | "regression"
    - new_shape: [n_rows, n_cols]
    """
    session = get_session(current_user)
    df = session.get("raw_df")

    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Please POST /upload first.")

    if request.target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{request.target_column}' not found in dataset.",
        )

    problem_type = detect_problem_type(df, request.target_column)

    try:
        processed_df = preprocess_for_preview(df, request.target_column)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

    session["processed_df"] = processed_df
    session["target_column"] = request.target_column
    session["problem_type"] = problem_type

    return {
        "status": "success",
        "problem_type": problem_type,
        "new_shape": list(processed_df.shape),
    }
