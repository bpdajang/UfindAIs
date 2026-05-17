from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm
from schemas.auth import RegisterRequest, LoginRequest, TokenOut
from schemas.user import UserOut, UserUpdateRequest
from core.security import (
    hash_password, verify_password, create_access_token, get_current_user
)
from db.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _user_out(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "name": u.get("name", ""),
        "email": u["email"],
        "role": u.get("role", "user"),
        "verified": u.get("verified", False),
    }


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db=Depends(get_db)):
    """
    Register a new user account.
    Frontend: Register.jsx — collects name, email, password → redirects to /login
    """
    existing = await db["users"].find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(timezone.utc)
    doc = {
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "role": "user",
        "verified": False,
        "saved_tools": [],       # list of tool_ids for Dashboard saved collection
        "recent_tools": [],      # list of tool_ids for Dashboard recently viewed
        "created_at": now,
    }
    result = await db["users"].insert_one(doc)
    return {"message": "Account created. Please log in.", "user_id": str(result.inserted_id)}




@router.post("/login", response_model=TokenOut)
async def login(
    body: OAuth2PasswordRequestForm = Depends(),  # ✅ accepts form fields
    db=Depends(get_db)
):
    """
    Login with email + password. Returns JWT + user profile.
    Frontend: Login.jsx — on success navigates to /dashboard, stores role in AuthContext
    """
    user = await db["users"].find_one({"email": body.username})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user["_id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_out(user),
    }


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    """Return the current logged-in user's profile."""
    return _user_out(user)

@router.put("/me", response_model=UserOut)
async def update_me(
    body: UserUpdateRequest,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Update the current logged-in user's profile."""
    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.password is not None:
        update_data["password"] = hash_password(body.password)

    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    await db["users"].update_one({"_id": user["_id"]}, {"$set": update_data})
    updated_user = await db["users"].find_one({"_id": user["_id"]})
    return _user_out(updated_user)


@router.post("/logout")
async def logout():
    """
    Logout the current user. (Frontend can simply delete the token on client side)
    This endpoint is a placeholder in case we want to implement server-side token blacklisting in the future.
    """
    return {"message": "Logged out successfully"}

@router.get("/verify-email")
async def verify_email(token: str, db=Depends(get_db)):
    """
    Verify a user's email address using a token sent via email.
    This is a placeholder implementation. In a real app, you'd generate a unique token, send it via email, and verify it here.
    """
    # For demonstration, we'll just mark the user as verified if the token matches a specific value.
    if token != "dummy-verification-token":
        raise HTTPException(status_code=400, detail="Invalid verification token")

    # In a real implementation, you'd look up the user associated with the token and update their verified status.
    # For now, we'll just return a success message.
    return {"message": "Email verified successfully"}

@router.delete("/delete-account")
async def delete_account(user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Delete the current user's account. This will remove the user from the database.
    Frontend: AccountSettings.jsx — on success, logs out and redirects to home page
    """
    await db["users"].delete_one({"_id": user["_id"]})
    return {"message": "Account deleted successfully"}
