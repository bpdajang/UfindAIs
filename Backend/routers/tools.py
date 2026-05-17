from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from schemas.tool import AIToolCreate, AIToolUpdate, AIToolOut
from core.security import get_current_admin
from db.database import get_db

router = APIRouter(prefix="/api/tools", tags=["AI Tools"])


def _serialize(t: dict) -> dict:
    raw_category = t.get("category", [])
    # Normalize: old docs may store a single string
    if isinstance(raw_category, str):
        raw_category = [raw_category] if raw_category else []
        
    return {
        "id": str(t["_id"]),
        "name": t["name"],
        "description": t.get("description", ""),
        "category": raw_category,
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
        # Ensure created_at is always JSON-serializable
        "created_at": (
            t.get("created_at").isoformat()
            if isinstance(t.get("created_at"), datetime)
            else (datetime.now(timezone.utc).isoformat() if t.get("created_at") is None else str(t.get("created_at")))
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
#  PUBLIC ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[AIToolOut])
async def list_tools(
    search: Optional[str] = Query(None),
    category: Optional[List[str]] = Query(None),
    pricing: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    """
    List / search AI tools.
    Used by: Explore.jsx (search bar + category filter)
    """
    query = {}
    if category and category != ["All"]:
        query["category"] = {"$in": category}
    if pricing:
        query["pricing"] = {"$regex": f"^{pricing}$", "$options": "i"}
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"functions": {"$regex": search, "$options": "i"}},
            {"tagline": {"$regex": search, "$options": "i"}},
        ]

    cursor = db["tools"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    tools = await cursor.to_list(length=limit)
    return [_serialize(t) for t in tools]


@router.get("/categories", response_model=List[str])
async def list_categories(db=Depends(get_db)):
    """
    Return all unique categories.
    Used by: Explore.jsx category filter buttons
    """
    categories = await db["tools"].distinct("category")
    return sorted([c for c in categories if c])


@router.get("/stats")
async def get_stats(db=Depends(get_db)):
    """
    Aggregate stats for Admin dashboard.
    """
    total_tools = await db["tools"].count_documents({})
    total_users = await db["users"].count_documents({"role": "user"})
    categories = await db["tools"].distinct("category")
    pending_submissions = await db["submissions"].count_documents({"status": "pending"})
    return {
        "total_tools": total_tools,
        "total_users": total_users,
        "total_categories": len([c for c in categories if c]),
        "pending_submissions": pending_submissions,
    }


@router.get("/quiz/results", response_model=List[AIToolOut])
async def quiz_results(
    category: Optional[List[str]] = Query(None),
    pricing: Optional[str] = Query(None),
    limit: int = Query(4, ge=1, le=10),
    db=Depends(get_db),
):
    """
    Ranked tool matches for the quiz results page.
    Used by: Quiz.jsx
    Ranks by saves desc, then views desc within the filtered set.
    """
    query = {}
    if category and category != ["All"]:
        query["category"] = {"$in": category}
    if pricing:
        query["pricing"] = {"$regex": f"^{pricing}$", "$options": "i"}

    cursor = db["tools"].find(query).sort([("saves", -1), ("views", -1)]).limit(limit)
    tools = await cursor.to_list(length=limit)
    return [_serialize(t) for t in tools]


@router.get("/{tool_id}", response_model=AIToolOut)
async def get_tool(tool_id: str, db=Depends(get_db)):
    """
    Full detail for a single tool. Also increments click count.
    Used by: AIDetails.jsx
    """
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool = await db["tools"].find_one({"_id": ObjectId(tool_id)})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    await db["tools"].update_one({"_id": ObjectId(tool_id)}, {"$inc": {"clicks": 1}})
    tool["clicks"] = tool.get("clicks", 0) + 1
    return _serialize(tool)


@router.get("/{tool_id}/alternatives", response_model=List[AIToolOut])
async def get_alternatives(tool_id: str, db=Depends(get_db)):
    """
    Up to 4 tools in the same category, excluding the current one.
    Used by: AIDetails.jsx Alternatives section
    """
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool = await db["tools"].find_one({"_id": ObjectId(tool_id)})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    cursor = db["tools"].find({
        "_id": {"$ne": ObjectId(tool_id)},
        "category": tool.get("category"),
    }).sort("saves", -1).limit(4)
    alternatives = await cursor.to_list(length=4)
    return [_serialize(t) for t in alternatives]


@router.post("/{tool_id}/save")
async def toggle_save(tool_id: str, db=Depends(get_db)):
    """
    Increment save count for a tool (called on heart/save button click).
    Used by: AIDetails.jsx save button
    Note: for per-user save tracking, add JWT auth and a user_saves collection.
    """
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    result = await db["tools"].update_one(
        {"_id": ObjectId(tool_id)},
        {"$inc": {"saves": 1}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")

    updated = await db["tools"].find_one({"_id": ObjectId(tool_id)})
    return {"saves": updated.get("saves", 0)}


# ─────────────────────────────────────────────────────────────────────────────
#  ADMIN ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.post("", response_model=AIToolOut, status_code=201)
async def create_tool(body: AIToolCreate, admin=Depends(get_current_admin), db=Depends(get_db)):
    now = datetime.now(timezone.utc)
    doc = {**body.model_dump(), "views": 0, "clicks": 0, "saves": 0, "created_at": now, "updated_at": now}
    result = await db["tools"].insert_one(doc)
    created = await db["tools"].find_one({"_id": result.inserted_id})
    return _serialize(created)


@router.patch("/{tool_id}", response_model=AIToolOut)
async def update_tool(tool_id: str, body: AIToolUpdate, admin=Depends(get_current_admin), db=Depends(get_db)):
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc)
    result = await db["tools"].update_one({"_id": ObjectId(tool_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")

    updated = await db["tools"].find_one({"_id": ObjectId(tool_id)})
    return _serialize(updated)


@router.delete("/{tool_id}", status_code=204)
async def delete_tool(tool_id: str, admin=Depends(get_current_admin), db=Depends(get_db)):
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")

    result = await db["tools"].delete_one({"_id": ObjectId(tool_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")
