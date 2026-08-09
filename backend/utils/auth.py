"""
auth.py - Authentication utilities for AutoML Studio.

Handles JWT creation/decoding, password hashing, and user persistence.
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
from utils.db import get_db_session, User

SECRET_KEY = os.getenv("SECRET_KEY", "automl-studio-super-secret-key-9988")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def get_user(username: str) -> Optional[dict]:
    db = get_db_session()
    try:
        user_obj = db.query(User).filter(User.username == username).first()
        if not user_obj:
            return None
        return {
            "id": user_obj.id,
            "username": user_obj.username,
            "password": user_obj.hashed_password,
            "created_at": user_obj.created_at.isoformat() if user_obj.created_at else None,
        }
    finally:
        db.close()

def create_user(username: str, password: str) -> Optional[dict]:
    db = get_db_session()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            return None
        new_user = User(
            id=str(uuid.uuid4()),
            username=username,
            hashed_password=get_password_hash(password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "id": new_user.id,
            "username": new_user.username,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        }
    except Exception:
        db.rollback()
        return None
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    if get_user(username) is None:
        raise credentials_exception
    return username

