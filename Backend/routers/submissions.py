from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime,timezone
from bson import ObjectId

from schemas.submission import SubmissionCreate, SubmissionOut
from core.security import get_current_admin
from db.database import get_db

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


def _serialize(s: dict) -> dict:
    return {
        "id": str(s["_id"]),
        "name": s["name"],
        "category": s["category"],
        "description": s["description"],
        "submitted_by_email": s.get("submitted_by_email"),
        "status": s.get("status", "pending"),
        "created_at": s["created_at"],
    }


# ─────────────────────────────────────────────────────────────────────────────
#  PUBLIC — anyone can suggest a tool
# ─────────────────────────────────────────────────────────────────────────────

@router.post("", response_model=SubmissionOut, status_code=201)
async def submit_tool(body: SubmissionCreate, db=Depends(get_db)):
    """
    Anyone can suggest an AI tool for review.
    Frontend: SubmitAI.jsx — Submit for Review form
    Fields: name, category, description (+ optional email)
    """
    doc = {
        **body.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db["submissions"].insert_one(doc)
    created = await db["submissions"].find_one({"_id": result.inserted_id})
    return _serialize(created)


# ─────────────────────────────────────────────────────────────────────────────
#  ADMIN — review queue
# ─────────────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[SubmissionOut])
async def list_submissions(
    status: Optional[str] = Query("pending", description="pending | approved | rejected"),
    skip: int = 0,
    limit: int = 20,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    """
    [Admin] View the submissions queue.
    Frontend: Admin.jsx — pending submissions section
    """
    query = {}
    if status:
        query["status"] = status

    cursor = db["submissions"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    subs = await cursor.to_list(length=limit)
    return [_serialize(s) for s in subs]


@router.post("/{submission_id}/approve", status_code=201)
async def approve_submission(submission_id: str, admin=Depends(get_current_admin), db=Depends(get_db)):
    """
    [Admin] Approve a submission — auto-publishes it as a live tool.
    Frontend: Admin.jsx — Approve button in submissions queue
    """
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    sub = await db["submissions"].find_one({"_id": ObjectId(submission_id)})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub["status"] != "pending":
        raise HTTPException(status_code=409, detail=f"Already '{sub['status']}'")

    # Promote to live tools collection
    now = datetime.now(timezone.utc)
    tool_doc = {
        "name": sub["name"],
        "description": sub["description"],
        "category": sub["category"],
        "logo": None,
        "link": "",
        "tagline": None,
        "pricing": "Freemium",
        "pricingDetail": None,
        "functions": [],
        "definition": None,
        "keyFeatures": [],
        "whoIsUsing": None,
        "whatMakesUnique": None,
        "summary": None,
        "featured": False,
        "views": 0,
        "clicks": 0,
        "saves": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = await db["tools"].insert_one(tool_doc)

    await db["submissions"].update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {"status": "approved", "promoted_tool_id": str(result.inserted_id)}}
    )

    return {
        "message": "Submission approved and published as a tool",
        "tool_id": str(result.inserted_id),
    }


@router.post("/{submission_id}/reject")
async def reject_submission(submission_id: str, admin=Depends(get_current_admin), db=Depends(get_db)):
    """[Admin] Reject a pending submission."""
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = await db["submissions"].update_one(
        {"_id": ObjectId(submission_id), "status": "pending"},
        {"$set": {"status": "rejected"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pending submission not found")
    return {"message": "Submission rejected"}


@router.delete("/{submission_id}", status_code=204)
async def delete_submission(submission_id: str, admin=Depends(get_current_admin), db=Depends(get_db)):
    """[Admin] Delete a submission permanently."""
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = await db["submissions"].delete_one({"_id": ObjectId(submission_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
