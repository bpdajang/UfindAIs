from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

from db.database import connect_db, close_db, get_db, db
from core.config import settings
from core.security import hash_password
from routers import auth, users, tools, submissions, QuizRoute

app = FastAPI(
    title="UfindAIs API",
    description="Backend for UfindAIs — the AI tools discovery platform.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production replace "*" with your frontend domain e.g. "https://ufindais.com"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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




# ── Seed admin ────────────────────────────────────────────────────────────────
# async def seed_admin(db):
#     existing = await db["users"].find_one({"email": settings.ADMIN_EMAIL})
#     if not existing:
#         await db["users"].insert_one({
#             "name": "Admin",
#             "email": settings.ADMIN_EMAIL,
#             "password": hash_password(settings.ADMIN_PASSWORD),
#             "role": "admin",
#             "verified": True,
#             "saved_tools": [],
#             "recent_tools": [],
#             "created_at": datetime.now(timezone.utc),
#         })
#         print(f"🌱 Admin seeded: {settings.ADMIN_EMAIL}")

# ── Lifecycle ─────────────────────────────────────────────────────────────────


@app.on_event("startup")
async def startup():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await connect_db()
    # await seed_admin(get_db())
    


@app.on_event("shutdown")
async def shutdown():
    await close_db()


# ── Seed sample tools (mirrors sampleData.js so your frontend works immediately)
# async def seed_sample_tools():
#     count = await db["tools"].count_documents({})
#     if count > 1:
#         return  # already seeded

#     now = datetime.now(timezone.utc)
#     sample_tools = [
#         {
#             "name": "ChatGPT",
#             "category": "Writing",
#             "description": "Advanced AI assistant for writing, coding, research and problem solving.",
#             "link": "https://chat.openai.com",
#             "logo": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
#             "featured": True,
#             "views": 1200, "clicks": 860, "saves": 245,
#             "pricing": "Freemium",
#             "pricingDetail": "Free: Limited access, Plus: $20/mo, Team: $25/user/mo",
#             "functions": ["writing generators", "coding assistant", "research tool", "problem solving"],
#             "definition": "ChatGPT is an advanced AI language model developed by OpenAI that can understand and generate human-like text.",
#             "keyFeatures": ["Natural language understanding", "Code generation and debugging", "Multi-language support", "Context-aware responses", "Continuous learning"],
#             "whoIsUsing": "Developers, writers, students, researchers, businesses, and anyone needing AI assistance for productivity tasks.",
#             "whatMakesUnique": "Its ability to understand context and generate coherent, contextually appropriate responses across a wide range of topics.",
#             "summary": "ChatGPT is a powerful AI assistant that revolutionizes how people interact with technology.",
#             "created_at": now, "updated_at": now,
#         },
#         {
#             "name": "Midjourney",
#             "category": "Design",
#             "description": "AI-powered image generation tool for creating stunning artwork.",
#             "link": "https://www.midjourney.com",
#             "logo": "https://logos-world.net/wp-content/uploads/2024/11/Midjourney-Symbol.png",
#             "featured": True,
#             "views": 980, "clicks": 720, "saves": 189,
#             "pricing": "Paid",
#             "pricingDetail": "Basic: $10/mo, Standard: $30/mo, Pro: $60/mo",
#             "functions": ["image generation", "art creation", "design tool", "creative assistant"],
#             "definition": "Midjourney is an AI-powered image generation tool that creates stunning artwork from text descriptions.",
#             "keyFeatures": ["Text-to-image generation", "High-quality outputs", "Various artistic styles", "Iterative refinement", "Community showcase"],
#             "whoIsUsing": "Digital artists, graphic designers, concept artists, marketers, and creative enthusiasts.",
#             "whatMakesUnique": "Midjourney's distinctive artistic style and ability to generate highly detailed, aesthetically pleasing images.",
#             "summary": "Midjourney empowers creators to generate professional-quality artwork through simple text prompts.",
#             "created_at": now, "updated_at": now,
#         },
#         {
#             "name": "GitHub Copilot",
#             "category": "Coding",
#             "description": "AI coding assistant that helps you write code faster inside your IDE.",
#             "link": "https://github.com/features/copilot",
#             "logo": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
#             "featured": False,
#             "views": 760, "clicks": 540, "saves": 156,
#             "pricing": "Freemium",
#             "pricingDetail": "Free for students, $10/mo for individuals",
#             "functions": ["code completion", "programming assistant", "bug detection", "refactoring"],
#             "definition": "GitHub Copilot is an AI pair programmer that suggests code and entire functions in real-time.",
#             "keyFeatures": ["Real-time code suggestions", "Multi-language support", "Context-aware completions", "Bug detection", "Code refactoring"],
#             "whoIsUsing": "Software developers, programmers, students learning to code, and development teams.",
#             "whatMakesUnique": "Unlike simple autocomplete, Copilot understands the entire context of your code.",
#             "summary": "GitHub Copilot accelerates development workflows by providing intelligent code suggestions.",
#             "created_at": now, "updated_at": now,
#         },
#         {
#             "name": "Runway",
#             "category": "Video",
#             "description": "Creative AI tools for video editing and generation.",
#             "link": "https://runwayml.com",
#             "logo": "https://seeklogo.com/images/R/runway-logo-1A1E0C1E8F-seeklogo.com.png",
#             "featured": False,
#             "views": 640, "clicks": 430, "saves": 98,
#             "pricing": "Freemium",
#             "pricingDetail": "Free: Limited credits, Standard: $15/mo, Pro: $35/mo",
#             "functions": ["video editing", "video generation", "effects", "content creation"],
#             "definition": "Runway is a creative AI platform that provides powerful video editing and generation tools.",
#             "keyFeatures": ["AI-powered video editing", "Text-to-video generation", "Video effects and filters", "Green screen removal", "Collaboration tools"],
#             "whoIsUsing": "Video creators, content creators, filmmakers, marketers, and creative professionals.",
#             "whatMakesUnique": "Runway offers a comprehensive suite of AI tools specifically designed for video production.",
#             "summary": "Runway transforms video creation with AI, offering powerful editing and generation tools.",
#             "created_at": now, "updated_at": now,
#         },
#         {
#             "name": "Notion AI",
#             "category": "Productivity",
#             "description": "AI assistant inside Notion for smarter writing and organization.",
#             "link": "https://www.notion.so/product/ai",
#             "logo": "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
#             "featured": True,
#             "views": 890, "clicks": 610, "saves": 312,
#             "pricing": "Paid",
#             "pricingDetail": "Included in Plus: $10/mo, Business: $18/user/mo",
#             "functions": ["writing generators", "project management", "personal assistant", "note taking"],
#             "definition": "Notion AI is an AI-powered writing assistant integrated into Notion.",
#             "keyFeatures": ["AI writing assistance", "Brainstorming tools", "Summarization", "Auto-editing", "Idea generation"],
#             "whoIsUsing": "Professionals, teams, students, writers, and anyone using Notion for productivity.",
#             "whatMakesUnique": "Its seamless integration into the Notion workspace makes AI assistance available directly where users already work.",
#             "summary": "Notion AI enhances productivity by bringing AI-powered writing and organization tools directly into your workspace.",
#             "created_at": now, "updated_at": now,
#         },
#     ]
#     await db["tools"].insert_many(sample_tools)
#     print(f"🌱 Seeded {len(sample_tools)} sample AI tools")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "UfindAIs API is running 🚀"}
