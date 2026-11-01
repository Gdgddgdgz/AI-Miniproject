"""
db.py - SQLAlchemy database manager for user accounts and training history.
"""

import os
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.abspath(os.getenv(
    "SQLITE_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "automl_studio.db")
))
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql+psycopg://", 1
    )
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

engine_options = {"pool_pre_ping": True}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite:"):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ModelHistoryRecord(Base):
    __tablename__ = "model_history"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    model_name = Column(String, nullable=False)
    target_column = Column(String, nullable=False)
    problem_type = Column(String, nullable=True)
    primary_score = Column(Float, nullable=True)
    metrics = Column(JSON, nullable=False)
    parameters = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db_session():
    return SessionLocal()


init_db()
