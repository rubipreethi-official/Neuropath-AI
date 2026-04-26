import requests
from bs4 import BeautifulSoup
from db import rag_collection as knowledge

url = "https://www.nirfindia.org/Rankings/2025/CollegeRanking.html"

res = requests.get(url, timeout=20)

soup = BeautifulSoup(res.text, "html.parser")

rows = soup.select("tbody tr")

docs = []

for row in rows:

    cols = row.find_all("td")

    if len(cols) < 6:
        continue

    name = cols[1].get_text(strip=True)
    state = cols[3].get_text(strip=True)
    score = cols[4].get_text(strip=True)
    rank = cols[5].get_text(strip=True)

    document = {
        "text": f"{name} located in {state} ranked {rank} with score {score} in NIRF ranking",
        "type": "institution",
        "metadata": {
            "name": name,
            "state": state,
            "rank": rank,
            "score": score
        }
    }

    docs.append(document)

if docs:
    knowledge.insert_many(docs)

print("Institutions stored:", len(docs))