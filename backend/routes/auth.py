"""
auth.py - Authentication routes: /auth/signup and /auth/login
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, field_validator
from datetime import timedelta

from utils.auth import (
    get_user,
    create_user,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if len(v) > 30:
            raise ValueError("Username must be at most 30 characters.")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may contain letters, numbers, underscores, and hyphens only.")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters.")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes.")
        return v


@router.post("/signup", summary="Register a new user account")
async def signup(user: UserCreate):
    if get_user(user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered. Please choose a different one.",
        )
    new_user = create_user(user.username, user.password)
    if new_user is None:
        raise HTTPException(status_code=500, detail="Failed to create user.")
    return {"status": "success", "username": user.username}


@router.post("/login", summary="Authenticate and get a JWT token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username.strip())
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}
