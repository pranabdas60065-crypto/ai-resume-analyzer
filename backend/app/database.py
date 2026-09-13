"""
MongoDB connection layer using Motor (async PyMongo driver).
Reads connection details from environment variables so the same code
works against local MongoDB and MongoDB Atlas.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "resume_analyzer")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
reports_collection = db["reports"]


async def ping_database() -> bool:
    """Used by the /health endpoint to confirm MongoDB is reachable."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False
