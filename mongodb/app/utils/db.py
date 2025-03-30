from pymongo import MongoClient
import os

def get_db_connection():
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable not set")
    
    client = MongoClient(mongo_uri)
    db_name = os.getenv("MONGODB_DB_NAME", "default_db")
    return client[db_name]