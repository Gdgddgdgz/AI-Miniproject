"""
predict.py – POST /predict
Accepts input feature values in JSON format and runs live inference using the user's trained pipeline.
"""

import pandas as pd
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from utils.helpers import get_session
from utils.auth import get_current_user

router = APIRouter()


class PredictRequest(BaseModel):
    features: Dict[str, Any]


@router.post("/predict", summary="Run live prediction using the trained model pipeline")
def predict_single(
    body: PredictRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Accepts raw feature key-value pairs (e.g. {"age": 30, "salary": 50000}) and runs inference.
    Handles internal preprocessor scaling, encoding, and target label decoding automatically.
    """
    session = get_session(current_user)
    pipeline = session.get("trained_model")
    target_col = session.get("target_column")
    label_encoder = session.get("label_encoder")

    if pipeline is None:
        raise HTTPException(
            status_code=400,
            detail="No trained model pipeline available. Please train a model first.",
        )

    if not body.features:
        raise HTTPException(status_code=400, detail="Feature payload is empty.")

    try:
        raw_df = session.get("raw_df")
        expected_features = session.get("raw_feature_columns") or []
        if not expected_features:
            raise ValueError("The trained model feature schema is unavailable. Retrain the model.")
        normalized = {}
        for column in expected_features:
            value = body.features.get(column)
            if value == "":
                value = None
            if value is not None and raw_df is not None and pd.api.types.is_numeric_dtype(raw_df[column].dtype):
                parsed = pd.to_numeric(value, errors="coerce")
                if pd.isna(parsed):
                    raise ValueError(f"'{column}' must be a numeric value.")
                value = float(parsed)
            normalized[column] = value
        input_df = pd.DataFrame([normalized], columns=expected_features)
        raw_pred = pipeline.predict(input_df)[0]

        # If classification with label_encoder, decode numeric back to original target string
        decoded_pred = raw_pred
        if label_encoder is not None and hasattr(label_encoder, "inverse_transform"):
            try:
                decoded_pred = label_encoder.inverse_transform([int(raw_pred)])[0]
            except Exception:
                decoded_pred = str(raw_pred)

        # Probabilities if classification model supports predict_proba
        probabilities = None
        if hasattr(pipeline, "predict_proba"):
            try:
                probs = pipeline.predict_proba(input_df)[0]
                classes = getattr(label_encoder, "classes_", range(len(probs)))
                probabilities = {str(cls): round(float(p), 4) for cls, p in zip(classes, probs)}
            except Exception:
                probabilities = None

        return {
            "prediction": str(decoded_pred),
            "raw_prediction": float(raw_pred) if isinstance(raw_pred, (float, int)) else str(raw_pred),
            "target_column": target_col,
            "probabilities": probabilities,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference failed: {str(e)}")
