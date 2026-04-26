from pymongo import MongoClient

MONGO_URI = "mongodb+srv://rubipreethi:preethi04@cluster0.jpityqm.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["rag-database"]

rag_collection = db["knowledge"]

print("MongoDB connected")