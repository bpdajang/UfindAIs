from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone


from schemas.user import UserOut, UserUpdateRequest
from core.security import get_current_user
from db.database import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])


def _user_out(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "name": u.get("name", ""),
        "email": u["email"],
        "role": u.get("role", "user"),
        "verified": u.get("verified", False),
    }


def _tool_serializer(t: dict) -> dict:
    return {
        "id": str(t["_id"]),
        "name": t["name"],
        "description": t.get("description", ""),
        "category": t.get("category", ""),
        "logo": t.get("logo"),
        "link": t.get("link", ""),
        "tagline": t.get("tagline"),
        "pricing": t.get("pricing"),
        "pricingDetail": t.get("pricingDetail"),
        "functions": t.get("functions", []),
        "definition": t.get("definition"),
        "keyFeatures": t.get("keyFeatures", []),
        "whoIsUsing": t.get("whoIsUsing"),
        "whatMakesUnique": t.get("whatMakesUnique"),
        "summary": t.get("summary"),
        "featured": t.get("featured", False),
        "views": t.get("views", 0),
        "clicks": t.get("clicks", 0),
        "saves": t.get("saves", 0),
        "created_at": t.get("created_at", datetime.now(timezone.utc)),
    }


# ── Profile ───────────────────────────────────────────────────────────────────

@router.patch("/me", response_model=UserOut)
async def update_profile(body: UserUpdateRequest, user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Update name and/or email.
    Frontend: Dashboard.jsx → Update Profile form
    """
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "email" in updates:
        existing = await db["users"].find_one({"email": updates["email"]})
        if existing and str(existing["_id"]) != str(user["_id"]):
            raise HTTPException(status_code=409, detail="Email already in use")

    await db["users"].update_one({"_id": user["_id"]}, {"$set": updates})
    updated = await db["users"].find_one({"_id": user["_id"]})
    return _user_out(updated)


@router.post("/me/verify")
async def verify_account(user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Mark user account as verified.
    Frontend: Dashboard.jsx → Verify Email button
    """
    await db["users"].update_one({"_id": user["_id"]}, {"$set": {"verified": True}})
    return {"message": "Account verified successfully"}


@router.delete("/me")
async def delete_account(user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Permanently delete the user's account.
    Frontend: Dashboard.jsx → Delete Account button
    """
    await db["users"].delete_one({"_id": user["_id"]})
    # Also clean up their saves
    await db["saves"].delete_many({"user_id": str(user["_id"])})
    return {"message": "Account deleted"}


# ── Saved Tools ───────────────────────────────────────────────────────────────

@router.get("/me/saved")
async def get_saved_tools(user: dict = Depends(get_current_user), db=Depends(get_db)):

    """
    Return the user's saved AI tools.
    Frontend: Dashboard.jsx → Saved AI Tools section
    """
    saved_ids = user.get("saved_tools", [])
    if not saved_ids:
        return []

    object_ids = [ObjectId(i) for i in saved_ids if ObjectId.is_valid(i)]
    cursor = db["tools"].find({"_id": {"$in": object_ids}})
    tools = await cursor.to_list(length=100)
    return [_tool_serializer(t) for t in tools]


@router.post("/me/saved/{tool_id}", status_code=201)
async def save_tool(tool_id: str, user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Save an AI tool to the user's collection.
    Frontend: AICard.jsx + AIDetails.jsx → heart/save button
    """
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool = await db["tools"].find_one({"_id": ObjectId(tool_id)})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    saved_tools = user.get("saved_tools", [])
    if tool_id in saved_tools:
        raise HTTPException(status_code=409, detail="Tool already saved")

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"saved_tools": tool_id}}
    )
    # Increment saves counter on the tool
    await db["tools"].update_one({"_id": ObjectId(tool_id)}, {"$inc": {"saves": 1}})
    return {"message": "Tool saved"}


@router.delete("/me/saved/{tool_id}")
async def unsave_tool(tool_id: str, user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Remove a tool from the user's saved collection."""

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$pull": {"saved_tools": tool_id}}
    )
    await db["tools"].update_one(
        {"_id": ObjectId(tool_id)},
        {"$inc": {"saves": -1}}
    )
    return {"message": "Tool removed from saved"}


# ── Recently Viewed ───────────────────────────────────────────────────────────

@router.get("/me/recent")
async def get_recent_tools(user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Return the user's recently viewed tools (last 6).
    Frontend: Dashboard.jsx → Recently Viewed section
    """
    recent_ids = user.get("recent_tools", [])
    if not recent_ids:
        return []

    object_ids = [ObjectId(i) for i in recent_ids if ObjectId.is_valid(i)]
    cursor = db["tools"].find({"_id": {"$in": object_ids}})
    tools = await cursor.to_list(length=6)
    return [_tool_serializer(t) for t in tools]


@router.post("/me/recent/{tool_id}", status_code=201)
async def track_view(tool_id: str, user: dict = Depends(get_current_user), db=Depends(get_db)):
    """
    Track that a user viewed a tool. Keeps the last 6 unique tool IDs.
    Frontend: Call this when user lands on AIDetails.jsx
    """
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    recent = user.get("recent_tools", [])
    # Remove if already exists then prepend (keep order, deduplicate)
    recent = [i for i in recent if i != tool_id]
    recent.insert(0, tool_id)
    recent = recent[:6]  # keep only last 6

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"recent_tools": recent}}
    )
    # Increment views on the tool
    await db["tools"].update_one({"_id": ObjectId(tool_id)}, {"$inc": {"views": 1}})
    return {"message": "View tracked"}
