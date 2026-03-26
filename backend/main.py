"""
main.py – FastAPI application entry point.

Mounts all route modules and configures CORS so the React frontend
(running on http://localhost:5173 in dev) can reach the API.

Auth is enforced inside each route via Depends(get_current_user).
The /auth/* endpoints are intentionally public.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import upload, analyze, preprocess, train, download, dashboard, auth

app = FastAPI(
    title="AutoML Studio API",
    description=(
        "No-Code Machine Learning Platform. "
        "Upload a CSV, configure ML settings, train & compare models, "
        "download trained models, and track your history."
    ),
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy external deployment (e.g. Vercel -> Render)
    allow_credentials=False, # Must be False when origin is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# Auth is public; all other routes enforce auth within their own handlers.
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(upload.router,     tags=["Dataset"])
app.include_router(analyze.router,    tags=["Dataset"])
app.include_router(preprocess.router, tags=["Preprocessing"])
app.include_router(train.router,      tags=["Training"])
app.include_router(download.router,   tags=["Export"])
app.include_router(dashboard.router,  tags=["Dashboard"])


@app.get("/", tags=["Health"])
def root():
    """Health check – confirms the API is running."""
    return {"status": "ok", "message": "AutoML Studio API v2.0 is running."}
