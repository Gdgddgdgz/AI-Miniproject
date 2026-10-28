"""
upload.py – POST /upload, POST /reset
Accepts a CSV file, reads it with pandas, stores it in the user's session,
and returns a preview with column metadata.
"""

import io
import os
import zipfile
import base64
import mimetypes
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from utils.helpers import get_session, reset_session, df_to_records, column_dtypes
from utils.auth import get_current_user
from ml.preprocessing import get_image_columns
from de.medallion import lakehouse
from de.quality import run_data_quality_checks

router = APIRouter()


MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB limit

@router.post("/upload", summary="Upload a CSV dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    """
    Upload a CSV file. Stores it in the user's isolated session with security checks.
    """
    filename = (file.filename or "").lower()
    is_archive = filename.endswith(".zip")
    if not (filename.endswith(".csv") or is_archive):
        raise HTTPException(status_code=400, detail="Upload a CSV or a ZIP containing one CSV and its image files.")

    chunks = []
    total_size = 0
    while chunk := await file.read(1024 * 1024):
        total_size += len(chunk)
        if total_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Uploaded file exceeds maximum limit of 50MB.")
        chunks.append(chunk)
    contents = b"".join(chunks)

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    archive_images = {}
    image_map = {}
    csv_bytes = contents
    if is_archive:
        try:
            with zipfile.ZipFile(io.BytesIO(contents)) as archive:
                files = [item for item in archive.infolist() if not item.is_dir()]
                csv_files = [item for item in files if item.filename.lower().endswith(".csv")]
                if len(csv_files) != 1:
                    raise HTTPException(status_code=400, detail="ZIP must contain exactly one CSV file.")
                if len(files) > 5000:
                    raise HTTPException(status_code=400, detail="ZIP contains too many files.")
                if csv_files[0].file_size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="The uncompressed CSV exceeds 50MB.")
                total_image_bytes = 0
                for item in files:
                    leaf = item.filename.replace("\\", "/").split("/")[-1]
                    ext = os.path.splitext(leaf)[1].lower()
                    if ext in {".png", ".jpg", ".jpeg", ".gif", ".webp"}:
                        if item.file_size > 5 * 1024 * 1024:
                            raise HTTPException(status_code=400, detail="Each image in the ZIP must be 5MB or smaller.")
                        total_image_bytes += item.file_size
                        if total_image_bytes > 20 * 1024 * 1024:
                            raise HTTPException(status_code=400, detail="Images in the ZIP must total 20MB or less.")
                        mime = mimetypes.guess_type(leaf)[0] or "application/octet-stream"
                        data_uri = f"data:{mime};base64," + base64.b64encode(archive.read(item)).decode("ascii")
                        archive_images[item.filename.replace("\\", "/")] = data_uri
                        archive_images.setdefault(leaf, data_uri)
                csv_bytes = archive.read(csv_files[0])
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="The uploaded ZIP file is invalid.")

    try:
        df = pd.read_csv(io.BytesIO(csv_bytes))
    except Exception:
        try:
            df = pd.read_csv(io.BytesIO(csv_bytes), encoding="latin1")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file contains no data rows.")

    if len(df.columns) < 2:
        raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns (features + target).")

    image_columns = get_image_columns(df)
    for column in image_columns:
        for value in df[column].dropna().astype(str).unique():
            normalized = value.replace("\\", "/")
            leaf = normalized.split("/")[-1]
            if normalized in archive_images:
                image_map[normalized] = archive_images[normalized]
            elif leaf in archive_images:
                image_map[normalized] = archive_images[leaf]

    reset_session(current_user)
    session = get_session(current_user)
    session["raw_df"] = df
    session["filename"] = file.filename
    session["image_columns"] = image_columns
    session["image_map"] = image_map

    # ── Medallion Lakehouse Tiers (Bronze & Silver) & Data Quality Gate ──────
    bronze_meta = lakehouse.save_bronze(current_user, contents, file.filename, df)
    silver_meta = lakehouse.promote_to_silver(current_user, df, bronze_meta=bronze_meta)
    quality_report = run_data_quality_checks(df)

    session["de_bronze_meta"] = bronze_meta
    session["de_silver_meta"] = silver_meta
    session["de_quality_report"] = quality_report

    return {
        "filename": file.filename,
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "dtypes": column_dtypes(df),
        "preview": df_to_records(df, max_rows=20),
        "image_columns": session["image_columns"],
        "image_map": image_map,
        "medallion": {
            "bronze": bronze_meta,
            "silver": silver_meta,
        },
        "quality_report": quality_report,
    }



@router.post("/reset", summary="Reset the current user's project session")
async def reset_project(current_user: str = Depends(get_current_user)):
    """Clear all session data for the current user."""
    reset_session(current_user)
    return {"status": "success", "message": "Session cleared successfully."}
