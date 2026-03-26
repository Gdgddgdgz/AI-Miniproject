"""
dashboard.py – GET /dashboard/models
Returns training history for the currently authenticated user.
"""

from fastapi import APIRouter, Depends

from utils.history import get_user_history
from utils.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/models", summary="Get user's model training history")
async def get_models_history(current_user: str = Depends(get_current_user)):
    """
    Returns a list of all models trained by the current user.
    Each entry contains model name, target, metrics, and timestamp.
    """
    history = get_user_history(current_user)
    return {"history": history, "count": len(history)}
