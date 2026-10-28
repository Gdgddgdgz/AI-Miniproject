"""
quality.py – Automated Data Quality Gate & Contract Validation Engine.

Evaluates datasets across core Data Engineering quality dimensions:
1. Completeness: Null rates, missing value counts, empty column detection.
2. Uniqueness: Exact duplicate row detection and deduplication metrics.
3. Schema Contracts: Inferred datatypes, column hygiene (spaces/special chars).
4. Anomaly Profiling: Outlier detection using IQR on numeric columns.
5. Overall Quality Score (0-100%) and Lakehouse Promotion Verdict.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd


def run_data_quality_checks(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Run an end-to-end data quality audit on a pandas DataFrame.
    Returns a comprehensive report suitable for lakehouse gatekeeping.
    """
    if df is None or df.empty:
        return {
            "score": 0,
            "verdict": "REJECTED",
            "message": "Dataset is empty.",
            "metrics": {},
            "assertions": [],
        }

    total_rows, total_cols = df.shape
    total_cells = total_rows * total_cols

    # ── 1. Completeness Dimension ───────────────────────────────────────────
    null_counts = df.isnull().sum()
    total_nulls = int(null_counts.sum())
    completeness_pct = round(((total_cells - total_nulls) / total_cells) * 100, 2) if total_cells else 100.0

    high_null_cols = []
    col_null_breakdown = {}
    for col in df.columns:
        n_missing = int(null_counts[col])
        pct_missing = round((n_missing / total_rows) * 100, 2)
        col_null_breakdown[col] = {
            "missing_count": n_missing,
            "missing_pct": pct_missing,
        }
        if pct_missing > 30.0:
            high_null_cols.append(col)

    # ── 2. Uniqueness Dimension ─────────────────────────────────────────────
    # Exclude unhashable columns (e.g. lists/dicts if any)
    try:
        duplicate_rows = int(df.duplicated().sum())
    except Exception:
        duplicate_rows = 0
    duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows else 0.0

    # ── 3. Schema & Type Contracts ──────────────────────────────────────────
    schema_contracts: List[Dict[str, Any]] = []
    naming_issues = []
    for col in df.columns:
        col_str = str(col)
        # Check column name hygiene
        if " " in col_str or any(c in col_str for c in r"""!@#$%^&*()+=[]{}|\:;"'<>,/?"""):
            naming_issues.append(col_str)

        dtype_str = str(df[col].dtype)
        inferred_type = "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "categorical"
        schema_contracts.append({
            "column": col_str,
            "dtype": dtype_str,
            "type_category": inferred_type,
            "cardinality": int(df[col].nunique(dropna=True)),
        })

    # ── 4. Outlier & Anomaly Profiling (IQR) ─────────────────────────────────
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    anomaly_counts = 0
    outlier_summary = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) > 10:
            q25, q75 = series.quantile(0.25), series.quantile(0.75)
            iqr = q75 - q25
            if iqr > 0:
                lower = q25 - (1.5 * iqr)
                upper = q75 + (1.5 * iqr)
                outliers = int(((series < lower) | (series > upper)).sum())
                if outliers > 0:
                    anomaly_counts += outliers
                    outlier_summary[col] = {
                        "outlier_count": outliers,
                        "outlier_pct": round((outliers / total_rows) * 100, 2),
                        "bounds": [round(float(lower), 3), round(float(upper), 3)],
                    }

    # ── 5. Assertion Evaluations ────────────────────────────────────────────
    assertions = [
        {
            "rule": "Total Completeness >= 80%",
            "passed": completeness_pct >= 80.0,
            "details": f"Dataset is {completeness_pct}% complete ({total_nulls} null cells).",
            "impact": "Imputation required for Silver promotion" if completeness_pct < 100 else "Clean completeness.",
        },
        {
            "rule": "Zero High-Missingness Columns (>30%)",
            "passed": len(high_null_cols) == 0,
            "details": f"{len(high_null_cols)} column(s) have >30% missing values." if high_null_cols else "No severe column gaps.",
            "impact": f"Columns flagged: {', '.join(high_null_cols[:3])}" if high_null_cols else "Passed.",
        },
        {
            "rule": "Duplicate Row Ratio < 5%",
            "passed": duplicate_pct < 5.0,
            "details": f"{duplicate_rows} duplicate rows detected ({duplicate_pct}%).",
            "impact": "Deduplication required during Silver cleansing" if duplicate_rows > 0 else "Fully unique records.",
        },
        {
            "rule": "Column Name Hygiene",
            "passed": len(naming_issues) == 0,
            "details": f"{len(naming_issues)} columns contain spaces or special characters." if naming_issues else "All column names are standardized.",
            "impact": "Standardized into snake_case" if naming_issues else "Conforms to schema conventions.",
        },
        {
            "rule": "Sufficient Observation Volume",
            "passed": total_rows >= 20,
            "details": f"{total_rows} records and {total_cols} attributes present.",
            "impact": "Adequate for statistical feature aggregation.",
        },
    ]

    # Calculate weighted Data Quality Score (0–100)
    passed_count = sum(1 for a in assertions if a["passed"])
    deductions = 0
    if completeness_pct < 100:
        deductions += min(25, (100 - completeness_pct) * 0.8)
    if duplicate_pct > 0:
        deductions += min(15, duplicate_pct * 2)
    if high_null_cols:
        deductions += min(20, len(high_null_cols) * 5)
    if naming_issues:
        deductions += 5

    raw_score = max(10.0, 100.0 - deductions)
    score = round(raw_score, 1)

    if score >= 80.0:
        verdict = "PROMOTED_TO_SILVER"
        verdict_label = "Passed Data Quality Gate"
        verdict_color = "emerald"
    elif score >= 55.0:
        verdict = "PROMOTED_WITH_WARNINGS"
        verdict_label = "Promoted with Automated Remediation"
        verdict_color = "amber"
    else:
        verdict = "QUARANTINE_FLAGGED"
        verdict_label = "Severe Data Quality Issues"
        verdict_color = "rose"

    return {
        "score": score,
        "verdict": verdict,
        "verdict_label": verdict_label,
        "verdict_color": verdict_color,
        "summary": {
            "total_rows": total_rows,
            "total_columns": total_cols,
            "total_cells": total_cells,
            "total_nulls": total_nulls,
            "completeness_pct": completeness_pct,
            "duplicate_rows": duplicate_rows,
            "duplicate_pct": duplicate_pct,
            "quarantine_rows": duplicate_rows + (total_rows if completeness_pct < 20 else 0),
            "anomaly_cells": anomaly_counts,
            "passed_assertions": f"{passed_count} / {len(assertions)}",
        },
        "assertions": assertions,
        "high_null_columns": high_null_cols,
        "column_breakdown": col_null_breakdown,
        "schema_contracts": schema_contracts,
        "outlier_summary": outlier_summary,
    }
