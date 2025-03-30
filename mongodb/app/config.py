from pymongo import MongoClient
import os

class Config:
    """Configuration settings for the application."""
    
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority")
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
    DEBUG = os.getenv("DEBUG", "True") == "True"