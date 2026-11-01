# AutoML Studio 🚀

> **Local prototype for tabular machine learning workflows**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Frontend: React + Vite + Tailwind](https://img.shields.io/badge/Frontend-React_19_%7C_Vite_%7C_Tailwind_v4-blue)](ml-platform/)
[![Backend: FastAPI + Scikit-Learn + SQLite](https://img.shields.io/badge/Backend-FastAPI_%7C_SQLAlchemy_%7C_SQLite-green)](backend/)
[![ML Engine: XGBoost + LightGBM + Joblib](https://img.shields.io/badge/ML_Engine-XGBoost_%7C_LightGBM_%7C_Joblib-purple)](#key-features)

---

## 🌟 Executive Summary

**AutoML Studio** provides a web interface for uploading tabular data, benchmarking baseline models, and reviewing predictions. It is a prototype and is not yet designed for multi-worker or production deployment.

The app combines leakage-conscious preprocessing inside model pipelines, cross-validated model comparison, a live inference form, and `.joblib` exports for trusted local use.

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
|   - Auth & Session Manager (OAuth2 form login / JWT / bcrypt)                     |
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
* **Machine Learning**: Scikit-Learn, XGBoost, LightGBM, NumPy, Pandas, Joblib.
* **Database & Persistence**: SQLite 3 (SQLAlchemy ORM models for Users & Training History).

---

## ⚡ Key Features

1. **Smart Dataset Upload & Guardrails**: Enforces 50MB file size limits, multi-encoding CSV parsing (`utf-8`, `latin1`), target column validation, and optional image thumbnails from image URL columns or a ZIP of one CSV plus local images.
2. **Zero-Data-Leakage Preprocessing**: Assembles unfitted `ColumnTransformer` pipelines that scale, impute, and encode features strictly on `X_train`.
3. **Multi-Model Benchmark Suite**: Automatically trains and ranks Logistic/Linear Regression, Decision Trees, Random Forest, KNN, **XGBoost**, and **LightGBM**.
4. **Interactive Inference Playground**: Test custom feature values live on the web UI and receive predictions with class probabilities when supported.
5. **Packaged Pipeline Export**: Download fitted Scikit-Learn `.joblib` archives containing preprocessors, estimators, feature names, and target label encoders.
6. **User Accounts & Training History**: Accounts and model history are stored in SQLite. Active datasets and fitted models are held in memory by one API process and are cleared when it restarts.

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

# Copy the example environment file (PowerShell)
Copy-Item .env.example .env
# Edit .env and set SECRET_KEY to a unique random secret before starting the API.

# Run FastAPI server with Uvicorn
python -m uvicorn main:app --reload --port 8000
```
Backend API live at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

### Dataset images

Include an `image`, `image_url`, `photo`, or similar image-named column in the CSV. Values can be browser-accessible image URLs or image filenames. For local photos, upload a ZIP containing exactly one CSV and the referenced image files. The CSV image column is retained for display and excluded from model training. The results page can show the highest predicted item for regression or numeric/ordered class labels; arbitrary text classes have no inherent ranking, so the app does not label one class as “best.”

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

Set `CORS_ORIGINS` to the deployed frontend origin when hosting the UI and API on separate domains. The API requires `SECRET_KEY` at startup.

---

## 🚢 Single-host Deployment (Docker Compose)

The repository includes a Docker Compose deployment with a React/Nginx frontend, FastAPI backend, PostgreSQL, and durable volumes for the database and uploaded/model data. The frontend proxies `/api` to the backend, so the browser uses one origin. Run it on a host with Docker Compose and put it behind an HTTPS reverse proxy or a hosting platform that provides TLS.

```bash
cp .env.deploy.example .env
```

Edit `.env` before starting. Set `SECRET_KEY` to at least 32 random bytes and `POSTGRES_PASSWORD` to a long URL-safe random password (letters, numbers, `_` and `-`). For example, generate each with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Keep `.env` private and out of source control.

```bash
docker compose up --build -d
docker compose ps
```

Open `http://<host>:8080` for a local smoke check. For a public service, configure HTTPS and your domain in the host or reverse proxy, restrict inbound traffic to that proxy, and set `CORS_ORIGINS` to the public frontend origin. The API runs one worker because live training state is kept in a per-user persisted session file on the shared application volume. This setup supports one host; multi-host scaling requires shared session/object storage and a shared database. Back up both named volumes (`postgres_data` and `app_storage`) and define a retention policy for uploaded datasets and trained models.

To stop without deleting data, run `docker compose down`. Do not use `docker compose down -v` unless you intend to permanently delete the database and uploaded/model data.

The API no longer creates a default demo account. Users register through the signup page. The deployment does not include managed TLS, backups, monitoring, or hosting-provider setup; configure those at your host before inviting public users.

### Vercel frontend + Render backend

For this split deployment, deploy the React app as a Vercel project with the project root set to `ml-platform`, build command `npm run build`, and output directory `dist`. Deploy `render.yaml` as a Render Blueprint. The Blueprint creates the Docker API service and PostgreSQL database in Singapore and attaches a persistent disk for uploaded datasets, trained models, and lakehouse files. The API service and disk use a paid Render plan; Render's free web services have ephemeral filesystems.

The Render Blueprint allows `https://ai-miniproject.vercel.app` as `CORS_ORIGINS`. If you use a different Vercel URL or add a custom frontend domain, update that value to the exact browser origin. After Render finishes deploying, set Vercel's `VITE_API_URL` to the API's HTTPS `onrender.com` URL and redeploy the frontend. Keep the Render service and database in the same region.

---

## 📡 API Reference Matrix

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/auth/signup` | `POST` | Public | Register a new user account |
| `/auth/login` | `POST` | Public | Authenticate user and receive JWT access token |
| `/upload` | `POST` | Bearer | Upload a CSV or ZIP with exactly one CSV (max 50MB) |
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
