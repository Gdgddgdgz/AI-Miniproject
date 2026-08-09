"""
download.py – GET /download-model
Serialise the user's trained pipeline and metadata with joblib for safe model export.
"""

import io
import joblib
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from utils.helpers import get_session
from utils.auth import get_current_user

router = APIRouter()


@router.get("/download-model", summary="Download the trained model pipeline as a .joblib file")
def download_model(current_user: str = Depends(get_current_user)):
    """
    Download the currently trained full Scikit-Learn Pipeline as a .joblib file.
    Includes fitted preprocessor, model, feature columns, and target label encoder.
    """
    session = get_session(current_user)
    pipeline = session.get("trained_model")
    model_name = session.get("model_name", "model")

    if pipeline is None:
        raise HTTPException(
            status_code=400,
            detail="No trained model pipeline available. Please train a model first.",
        )

    export_package = {
        "pipeline": pipeline,
        "model_name": model_name,
        "target_column": session.get("target_column"),
        "problem_type": session.get("problem_type"),
        "raw_feature_columns": session.get("raw_feature_columns"),
        "label_encoder": session.get("label_encoder"),
    }

    buffer = io.BytesIO()
    joblib.dump(export_package, buffer)
    buffer.seek(0)

    safe_name = model_name.replace(" ", "_").lower()
    filename = f"{safe_name}_pipeline.joblib"

    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

