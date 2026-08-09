"""
db.py - SQLAlchemy database manager for user accounts and training history.
"""

import os
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "automl_studio.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
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
