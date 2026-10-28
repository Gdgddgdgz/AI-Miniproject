"""
de_pipeline.py – Data Engineering Lakehouse & Data Quality API Routes.

Endpoints:
- GET  /de/quality-report     – Live data quality gate evaluation and contract scorecard
- GET  /de/lakehouse-metrics  – Telemetry across Bronze, Silver, and Gold tiers
- GET  /de/download/{tier}    – Stream compressed Apache Parquet dataset (silver or gold)
- POST /de/promote-silver     – Cleanse and promote dataset from Bronze to Silver tier
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from utils.helpers import get_session
from utils.auth import get_current_user
from de.quality import run_data_quality_checks
from de.medallion import lakehouse

router = APIRouter(prefix="/de", tags=["Data Engineering Pipeline"])


@router.get("/quality-report", summary="Evaluate data quality gate & schema contracts")
def get_quality_report(current_user: str = Depends(get_current_user)):
    """
    Evaluates dataset against 5 core data engineering quality dimensions:
    Completeness, Uniqueness, Schema Contracts, Outlier Anomaly Rate, and Promotion Verdict.
    """
    session = get_session(current_user)
    df = session.get("raw_df")
    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded in current session. Please upload a dataset first.",
        )

    # Cache report in session to avoid recomputing if unchanged
    report = run_data_quality_checks(df)
    session["de_quality_report"] = report
    return report


@router.get("/lakehouse-metrics", summary="Get Lakehouse Medallion tier storage metrics")
def get_lakehouse_metrics(current_user: str = Depends(get_current_user)):
    """
    Returns storage telemetry across Bronze, Silver, and Gold tiers:
    Raw bytes, Parquet compressed bytes, compression ratio (%), row counts, and pipeline lineage.
    """
    session = get_session(current_user)
    bronze_meta = session.get("de_bronze_meta")
    silver_meta = session.get("de_silver_meta")
    gold_meta = session.get("de_gold_meta")
    quality_report = session.get("de_quality_report")

    # If bronze metadata not generated yet but raw_df exists, generate it
    if not bronze_meta and session.get("raw_df") is not None:
        raw_df = session["raw_df"]
        bronze_meta = {
            "tier": "bronze",
            "filename": session.get("filename", "dataset.csv"),
            "rows": int(raw_df.shape[0]),
            "columns": int(raw_df.shape[1]),
            "raw_size_bytes": int(raw_df.memory_usage(deep=True).sum()),
            "format": "csv",
        }

    return {
        "bronze": bronze_meta,
        "silver": silver_meta,
        "gold": gold_meta,
        "quality_score": quality_report.get("score") if quality_report else None,
        "verdict": quality_report.get("verdict") if quality_report else None,
        "has_silver": silver_meta is not None,
        "has_gold": gold_meta is not None,
    }


@router.post("/promote-silver", summary="Promote raw dataset to Silver Parquet tier")
def promote_to_silver(current_user: str = Depends(get_current_user)):
    """
    Deduplicates, standardizes column schemas, and saves dataset to Silver tier as Snappy Parquet.
    """
    session = get_session(current_user)
    df = session.get("raw_df")
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded to promote.")

    bronze_meta = session.get("de_bronze_meta")
    silver_meta = lakehouse.promote_to_silver(current_user, df, bronze_meta=bronze_meta)
    session["de_silver_meta"] = silver_meta

    return {
        "status": "success",
        "message": "Dataset successfully cleansed and promoted to Silver tier.",
        "silver_meta": silver_meta,
    }


@router.get("/download/{tier}", summary="Download Parquet dataset from lakehouse tier")
def download_parquet_dataset(tier: str, current_user: str = Depends(get_current_user)):
    """
    Streams the Snappy-compressed Apache Parquet file for either 'silver' or 'gold' tier.
    """
    tier = tier.lower().strip()
    if tier not in ("silver", "gold"):
        raise HTTPException(status_code=400, detail="Tier must be either 'silver' or 'gold'.")

    buf = lakehouse.get_parquet_buffer(current_user, tier)
    if buf is None:
        # Fallback for silver: promote on-the-fly if raw_df exists
        session = get_session(current_user)
        if tier == "silver" and session.get("raw_df") is not None:
            lakehouse.promote_to_silver(current_user, session["raw_df"], session.get("de_bronze_meta"))
            buf = lakehouse.get_parquet_buffer(current_user, "silver")

    if buf is None:
        raise HTTPException(
            status_code=404,
            detail=f"Parquet dataset for '{tier}' tier not found. Please run preprocessing or feature extraction first.",
        )

    filename = f"{current_user}_{tier}_tier.parquet"
    return StreamingResponse(
        buf,
        media_type="application/vnd.apache.parquet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
