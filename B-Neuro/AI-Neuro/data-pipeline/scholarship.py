import requests
from bs4 import BeautifulSoup
from db import rag_collection

url = "https://scholarships.gov.in/"

res = requests.get(url, timeout=20)

soup = BeautifulSoup(res.text, "html.parser")

docs = []

links = soup.find_all("a")

for link in links:

    title = link.get_text(strip=True)

    if "scholarship" in title.lower():

        document = {
            "text": f"{title} scholarship available for students in India",
            "type": "scholarship",
            "metadata": {
                "title": title,
                "source": url
            }
        }

        docs.append(document)

if docs:
    rag_collection.insert_many(docs)

print("Scholarships inserted:", len(docs))