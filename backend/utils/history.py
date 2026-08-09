"""
history.py - Model training history tracker.
Persists model results per user in SQLite database.
"""

import uuid
from typing import List, Dict, Any
from utils.db import get_db_session, ModelHistoryRecord


def get_user_history(username: str) -> List[Dict[str, Any]]:
    """Return history records for a specific user from SQLite."""
    db = get_db_session()
    try:
        records = (
            db.query(ModelHistoryRecord)
            .filter(ModelHistoryRecord.username == username)
            .order_by(ModelHistoryRecord.timestamp.desc())
            .all()
        )
        return [
            {
                "id": rec.id,
                "timestamp": rec.timestamp.isoformat() if rec.timestamp else "",
                "username": rec.username,
                "model_name": rec.model_name,
                "target_column": rec.target_column,
                "problem_type": rec.problem_type,
                "metrics": rec.metrics,
                "parameters": rec.parameters,
            }
            for rec in records
        ]
    finally:
        db.close()


def save_model_to_history(
    model_name: str,
    target: str,
    metrics: dict,
    params: dict,
    username: str = "anonymous",
    problem_type: str = "unknown",
) -> dict:
    """Append a new training record to SQLite."""
    db = get_db_session()
    try:
        rec_id = str(uuid.uuid4())
        primary_score = metrics.get("f1_score") if "f1_score" in metrics else metrics.get("r2", 0.0)
        
        record = ModelHistoryRecord(
            id=rec_id,
            username=username,
            model_name=model_name,
            target_column=target,
            problem_type=problem_type,
            primary_score=float(primary_score) if primary_score is not None else 0.0,
            metrics=metrics,
            parameters=params,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        
        return {
            "id": record.id,
            "timestamp": record.timestamp.isoformat() if record.timestamp else "",
            "username": record.username,
            "model_name": record.model_name,
            "target_column": record.target_column,
            "metrics": record.metrics,
            "parameters": record.parameters,
        }
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to save model history to database: {e}")
        return {}
    finally:
        db.close()

