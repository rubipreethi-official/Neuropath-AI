from pymongo import MongoClient
import os

uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")

client = MongoClient(uri)

db = client["neuropath-rag"]

db.test.insert_one({"hello":"world"})

print("Inserted successfully")