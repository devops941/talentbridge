from pymongo import MongoClient, ASCENDING
from app.core.config import settings

client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=10000)
mongo_db = client[settings.MONGO_DB_NAME]

def init_mongo_indexes():
    """Ensure core collections have appropriate indexes."""
    try:
        mongo_db.users.create_index([("email", ASCENDING)], unique=True)
        mongo_db.candidates.create_index([("email", ASCENDING)], unique=True)
        mongo_db.skills.create_index([("canonical_name", ASCENDING)], unique=True)
        mongo_db.jobs.create_index([("status", ASCENDING)])
        mongo_db.applications.create_index([("job_id", ASCENDING)])
        mongo_db.resumes.create_index([("candidate_id", ASCENDING)])
    except Exception as e:
        print("Note on index initialization:", e)

def get_db():
    return mongo_db
