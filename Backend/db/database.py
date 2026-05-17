from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    await db["users"].create_index("email", unique=True)
    await db["tools"].create_index("name")
    await db["tools"].create_index("category")
    await db["saves"].create_index([("user_id", 1), ("tool_id", 1)], unique=True)
    await db["views"].create_index([("user_id", 1), ("tool_id", 1)])
    await db["submissions"].create_index("status")
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db  # ✅ This is what routers should use as a dependency
        
