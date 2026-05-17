from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    # Avoid triggering broken bcrypt backend during context init.
    # We'll still fallback in hash_password() if needed.
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Passwords ─────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    # Passlib bcrypt backend can error with some bcrypt module builds.
    # Fallback: encode to bytes and use Passlib's pure-python builtin backend.
    try:
        # bcrypt limit: max 72 bytes
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode("utf-8", errors="ignore")
        return pwd_context.hash(password)
    except Exception:
        import os

        os.environ["PASSLIB_BUILTIN_BCRYPT"] = "1"
        # Retry with builtin backend enabled.
        return pwd_context.hash(password)




def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    exp = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": exp})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Auth dependencies ─────────────────────────────────────────────────────────

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Returns the authenticated user (any role)."""
    from db.database import get_db          # ✅ fixed import path
    from bson import ObjectId

    db = get_db()                           # ✅ use get_db() not raw db

    payload = _decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_admin(token: str = Depends(oauth2_scheme)):
    """Returns the authenticated user only if they are an admin."""
    user = await get_current_user(token)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
