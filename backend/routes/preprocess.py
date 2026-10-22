"""Detect a suggested task type for the selected target column."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from utils.helpers import get_session
from utils.auth import get_current_user
from ml.model_selector import detect_problem_type

router = APIRouter()


class PreprocessRequest(BaseModel):
    target_column: str


@router.post("/preprocess", summary="Detect the target task type")
async def preprocess_dataset(
    request: PreprocessRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Detect whether the target appears to be a classification or regression target.

    Returns
    -------
    - status: "success"
    - problem_type: "classification" | "regression"
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

    session["target_column"] = request.target_column
    session["problem_type"] = problem_type

    return {
        "status": "success",
        "problem_type": problem_type,
    }
