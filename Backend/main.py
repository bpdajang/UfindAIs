from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from db.database import connect_db, close_db, get_db, db
from core.config import settings
from core.security import hash_password
from routers import auth, users, tools, submissions, QuizRoute

app = FastAPI(
    title="UfindAIs API",
    description="Backend for UfindAIs — the AI tools discovery platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ufindais.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tools.router)
app.include_router(submissions.router)
app.include_router(QuizRoute.router)


@app.on_event("startup")
async def startup():
    await connect_db()
    # await seed_admin(get_db())
    


@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "UfindAIs API is running 🚀"}
