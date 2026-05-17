from fastapi import APIRouter, Query, Depends
from typing import Optional, List
from datetime import datetime, timezone

from schemas.tool import AIToolOut
from db.database import get_db

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


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
        "created_at": t.get("created_at", datetime.now(timezone.utc)),
    }


# ── Scoring helpers ────────────────────────────────────────────────────────────

# Maps quiz "budget" answer → which pricing tiers are acceptable (in priority order)
BUDGET_TIERS = {
    "Free":       ["Free"],
    "Freemium":   ["Free", "Freemium"],
    "Paid":       ["Free", "Freemium", "Paid"],
    "Enterprise": ["Free", "Freemium", "Paid", "Enterprise"],
}

# Maps quiz "level" answer → keywords that signal a good fit in tool metadata
LEVEL_KEYWORDS = {
    "beginner":     ["easy", "simple", "no-code", "beginner", "starter", "drag", "template"],
    "intermediate": ["workflow", "integration", "automate", "plugin", "flexible"],
    "advanced":     ["api", "sdk", "developer", "custom", "code", "cli", "open source"],
}

# Maps quiz "style" answer → keywords
STYLE_KEYWORDS = {
    "nocode":       ["no-code", "drag", "visual", "template", "click", "ui"],
    "code":         ["api", "sdk", "code", "developer", "cli", "python", "javascript"],
    "integrations": ["integration", "zapier", "slack", "notion", "connect", "plugin", "embed"],
    "mobile":       ["mobile", "ios", "android", "app", "phone"],
}

# Maps quiz "priority" answer → keywords
PRIORITY_KEYWORDS = {
    "speed":   ["fast", "instant", "real-time", "quick", "batch", "bulk"],
    "quality": ["accurate", "quality", "best", "powerful", "state-of-the-art", "advanced"],
    "privacy": ["private", "secure", "local", "on-premise", "gdpr", "encrypted", "data"],
    "collab":  ["team", "collaboration", "share", "multi-user", "workspace", "comment"],
}


def _keyword_score(tool: dict, keyword_map: dict, answer: Optional[str]) -> int:
    """
    Searches name, description, functions, keyFeatures, and tagline for
    keywords that match the user's quiz answer. Returns count of hits (0–5).
    """
    if not answer or answer not in keyword_map:
        return 0

    keywords = keyword_map[answer]
    searchable = " ".join([
        tool.get("name", ""),
        tool.get("description", ""),
        tool.get("tagline", "") or "",
        tool.get("definition", "") or "",
        tool.get("whoIsUsing", "") or "",
        " ".join(tool.get("functions", [])),
        " ".join(tool.get("keyFeatures", [])),
    ]).lower()

    return sum(1 for kw in keywords if kw in searchable)


def _score_tool(tool: dict, answers: dict) -> float:
    """
    Returns a composite relevance score for a tool given the quiz answers.

    Scoring breakdown (max ~20 points before popularity boost):
      • Category match      → 6 pts  (hard match is the strongest signal)
      • Budget fit          → 4 pts  (exact match > acceptable tier)
      • Level keywords      → 0–3 pts
      • Style keywords      → 0–3 pts
      • Priority keywords   → 0–3 pts
      • Popularity boost    → +0–1 pts (normalised saves/views)
    """
    score = 0.0

    # ── 1. Category (goal) ───────────────────────────────────────────────────
    goal = answers.get("goal", "")
    tool_category = tool.get("category", [])
    if isinstance(tool_category, str):
        tool_category = [tool_category] if tool_category else []
    tool_category = [cat.lower() for cat in tool_category]
    if goal and goal.lower() in tool_category:
        score += 6
    elif goal and any(goal.lower() in cat for cat in tool_category):
        score += 3  # partial match (e.g. "Writing" inside "Content Writing")

    # ── 2. Budget / pricing ──────────────────────────────────────────────────
    budget = answers.get("budget", "")
    tool_pricing = tool.get("pricing", "") or ""
    acceptable_tiers = BUDGET_TIERS.get(budget, [])
    if tool_pricing in acceptable_tiers:
        # Exact match scores higher than just "affordable"
        score += 4 if tool_pricing == budget else 2

    # ── 3. Experience level ──────────────────────────────────────────────────
    level = answers.get("level", "")
    score += min(_keyword_score(tool, LEVEL_KEYWORDS, level), 3)

    # ── 4. Working style ─────────────────────────────────────────────────────
    style = answers.get("style", "")
    score += min(_keyword_score(tool, STYLE_KEYWORDS, style), 3)

    # ── 5. Priority ──────────────────────────────────────────────────────────
    priority = answers.get("priority", "")
    score += min(_keyword_score(tool, PRIORITY_KEYWORDS, priority), 3)

    # ── 6. Popularity signal (light boost so popular tools break ties) ───────
    saves = tool.get("saves", 0) or 0
    views = tool.get("views", 0) or 0
    popularity = min((saves * 2 + views) / 2000, 1.0)  # normalised 0–1
    score += popularity

    return score


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.get("/results", response_model=List[AIToolOut])
async def quiz_results(
    goal:     Optional[str] = Query(None, description="User's main goal / category"),
    level:    Optional[str] = Query(None, description="beginner | intermediate | advanced"),
    budget:   Optional[str] = Query(None, description="Free | Freemium | Paid | Enterprise"),
    style:    Optional[str] = Query(None, description="nocode | code | integrations | mobile"),
    priority: Optional[str] = Query(None, description="speed | quality | privacy | collab"),
    limit:    int           = Query(4, ge=1, le=10),
    db=Depends(get_db),
):
    """
    Multi-dimensional quiz recommendation endpoint.

    Scores every tool in the DB across 5 quiz dimensions and returns the
    top `limit` matches, ordered by relevance score descending.

    Used by: Quiz.jsx  →  fetchResults()
    """
    answers = {
        "goal":     goal,
        "level":    level,
        "budget":   budget,
        "style":    style,
        "priority": priority,
    }

    # ── Build a broad pre-filter to avoid scoring thousands of docs ──────────
    # We only hard-filter on budget so we never show tools the user can't afford.
    query = {}
    acceptable_tiers = BUDGET_TIERS.get(budget, [])
    if acceptable_tiers:
        query["pricing"] = {"$in": acceptable_tiers}

    # Fetch a reasonably large candidate pool (top 200 by popularity)
    cursor = (
        db["tools"]
        .find(query)
        .sort([("saves", -1), ("views", -1)])
        .limit(200)
    )
    candidates = await cursor.to_list(length=200)

    # ── Score & rank ─────────────────────────────────────────────────────────
    scored = [
        (tool, _score_tool(tool, answers))
        for tool in candidates
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    top = [tool for tool, _ in scored[:limit]]

    # ── Fallback: if scoring returns nothing, serve popular tools globally ────
    if not top:
        fallback = await db["tools"].find({}).sort([("saves", -1), ("views", -1)]).limit(limit).to_list(length=limit)
        return [_serialize(t) for t in fallback]

    return [_serialize(t) for t in top]