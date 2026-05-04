from pymongo import MongoClient
import os

MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)

db = client["rag-database"]

rag_collection = db["knowledge"]

print("MongoDB connected")