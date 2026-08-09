# AutoML Studio 🚀

> **Enterprise-Grade No-Code Machine Learning & Predictive Intelligence Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Frontend: React + Vite + Tailwind](https://img.shields.io/badge/Frontend-React_19_%7C_Vite_%7C_Tailwind_v4-blue)](ml-platform/)
[![Backend: FastAPI + Scikit-Learn + SQLite](https://img.shields.io/badge/Backend-FastAPI_%7C_SQLAlchemy_%7C_SQLite-green)](backend/)
[![ML Engine: XGBoost + LightGBM + Joblib](https://img.shields.io/badge/ML_Engine-XGBoost_%7C_LightGBM_%7C_Joblib-purple)](#key-features)

---

## 🌟 Executive Summary

**AutoML Studio** democratizes machine learning by empowering users to transform raw tabular data into production-ready predictive models without writing code. 

By unifying **automated preprocessing (zero data leakage)**, **multi-model algorithm benchmarks (XGBoost, LightGBM, Random Forest)**, **live web inference playgrounds**, and **packaged `.joblib` pipeline exports**, AutoML Studio bridges the gap between raw data analysis and production AI deployment.

---

## 📐 System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 1. PRESENTATION TIER                              |
|   - Web Control Center (React 19 + Vite + Tailwind CSS v4)                       |
|   - Interactive Live Inference Playground                                         |
|   - Multi-Model Benchmarking & Evaluation Dashboard                               |
+----------------------------------------+------------------------------------------+
                                         | REST APIs (JWT Auth Bearer)
+----------------------------------------v------------------------------------------+
|                                2. BACKEND CORE TIER                               |
|   - API Gateway & Upload Validator (FastAPI Async ASGI)                           |
|   - Auth & Session Manager (OAuth2 / JWT / Argon2id / bcrypt)                      |
|   - Relational Storage: SQLite 3 via SQLAlchemy 2.0 ORM                           |
+----------------------------------------+------------------------------------------+
                                         | In-Memory Pipeline Assembly
+----------------------------------------v------------------------------------------+
|                                3. ML ENGINE & PIPELINE TIER                        |
|   - Data Leakage Prevention: Unfitted ColumnTransformers                          |
|   - Gradient Boosting: XGBoost + LightGBM + Scikit-Learn Ensembles                |
|   - Model Export: Full Scikit-Learn Pipeline Serialization via Joblib             |
+-----------------------------------------------------------------------------------+
```

---

## 💻 Tech Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS v4, Recharts, Axios, React Router v7.
* **Backend**: Python 3.11+, FastAPI 0.110, SQLAlchemy 2.0, Pydantic v2, PyJWT, Passlib.
* **Machine Learning**: Scikit-Learn, XGBoost, LightGBM, SHAP, NumPy, Pandas, Joblib.
* **Database & Persistence**: SQLite 3 (SQLAlchemy ORM models for Users & Training History).

---

## ⚡ Key Features

1. **Smart Dataset Upload & Guardrails**: Enforces 50MB file size limits, multi-encoding CSV parsing (`utf-8`, `latin1`), and target column validation.
2. **Zero-Data-Leakage Preprocessing**: Assembles unfitted `ColumnTransformer` pipelines that scale, impute, and encode features strictly on `X_train`.
3. **Multi-Model Benchmark Suite**: Automatically trains and ranks Logistic/Linear Regression, Decision Trees, Random Forest, KNN, **XGBoost**, and **LightGBM**.
4. **Interactive Inference Playground**: Test custom feature values live on the web UI and receive instant predictions with class probability distributions.
5. **Packaged Pipeline Export**: Download fitted Scikit-Learn `.joblib` archives containing preprocessors, estimators, feature names, and target label encoders.
6. **Thread-Safe History & User Accounts**: Persistent user authentication and training history logs stored in SQLite via SQLAlchemy.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js 18+** & `npm`
* **Python 3.11+** & `pip`

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server with Uvicorn
python -m uvicorn main:app --reload --port 8000
```
Backend API live at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to ml-platform
cd ml-platform

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend live at: `http://localhost:5173`

---

## 📡 API Reference Matrix

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/auth/signup` | `POST` | Public | Register a new user account |
| `/auth/login` | `POST` | Public | Authenticate user and receive JWT access token |
| `/upload` | `POST` | Bearer | Upload CSV dataset (max 50MB) |
| `/analyze` | `GET` | Bearer | Retrieve statistical summary of uploaded dataset |
| `/preprocess` | `POST` | Bearer | Preview preprocessed features and auto-detect problem type |
| `/train` | `POST` | Bearer | Train a specific ML model pipeline |
| `/compare` | `POST` | Bearer | Train and benchmark all applicable models |
| `/predict` | `POST` | Bearer | Run live inference on user-provided feature JSON |
| `/download-model` | `GET` | Bearer | Download full fitted pipeline as a `.joblib` file |
| `/dashboard/models`| `GET` | Bearer | Fetch user's training history from SQLite database |

---

## 📄 License
Licensed under the [MIT License](LICENSE).
