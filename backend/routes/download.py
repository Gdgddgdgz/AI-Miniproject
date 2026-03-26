"""
download.py – GET /download-model
Serialise the user's trained model with pickle and return as a file download.
"""

import io
import pickle
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from utils.helpers import get_session
from utils.auth import get_current_user

router = APIRouter()


@router.get("/download-model", summary="Download the trained model as a .pkl file")
def download_model(current_user: str = Depends(get_current_user)):
    """
    Download the currently trained model as a .pkl file.
    """
    session = get_session(current_user)
    model = session.get("trained_model")
    model_name = session.get("model_name", "model")

    if model is None:
        raise HTTPException(
            status_code=400,
            detail="No trained model available. Please train a model first.",
        )

    buffer = io.BytesIO()
    pickle.dump(model, buffer)
    buffer.seek(0)

    safe_name = model_name.replace(" ", "_").lower()
    filename = f"{safe_name}.pkl"

    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
