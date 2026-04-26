from pymongo import MongoClient

uri = "mongodb+srv://rubipreethi:preethi04@cluster0.jpityqm.mongodb.net/?appName=Cluster0"

client = MongoClient(uri)

db = client["neuropath-rag"]

db.test.insert_one({"hello":"world"})

print("Inserted successfully")