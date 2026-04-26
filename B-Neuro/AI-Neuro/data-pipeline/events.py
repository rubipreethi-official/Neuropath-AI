import requests
from bs4 import BeautifulSoup
from db import knowledge

docs = []

headers = {
    "User-Agent": "Mozilla/5.0"
}

# -------------------------
# 1 NPTEL COURSES
# -------------------------

try:
    url = "https://nptel.ac.in/courses"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    titles = soup.find_all("h3")

    for t in titles:

        name = t.get_text(strip=True)

        if len(name) < 5:
            continue

        docs.append({
            "text": f"{name} online course available on NPTEL platform",
            "type": "course",
            "metadata": {
                "name": name,
                "platform": "NPTEL",
                "mode": "online"
            }
        })

except:
    print("NPTEL scraping failed")


# -------------------------
# 2 SWAYAM COURSES
# -------------------------

try:
    url = "https://swayam.gov.in/explorer"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    titles = soup.find_all("h4")

    for t in titles:

        name = t.get_text(strip=True)

        if len(name) < 5:
            continue

        docs.append({
            "text": f"{name} online certification course on SWAYAM platform",
            "type": "course",
            "metadata": {
                "name": name,
                "platform": "SWAYAM",
                "mode": "online"
            }
        })

except:
    print("SWAYAM scraping failed")


# -------------------------
# 3 MIT OPENCOURSEWARE
# -------------------------

try:

    url = "https://ocw.mit.edu/search/?q=computer"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    titles = soup.find_all("h3")

    for t in titles:

        name = t.get_text(strip=True)

        if len(name) < 5:
            continue

        docs.append({
            "text": f"{name} free course from MIT OpenCourseWare",
            "type": "course",
            "metadata": {
                "name": name,
                "platform": "MIT OCW",
                "mode": "online"
            }
        })

except:
    print("MIT OCW scraping failed")


# -------------------------
# 4 KAGGLE LEARN
# -------------------------

try:

    url = "https://www.kaggle.com/learn"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    titles = soup.find_all("h3")

    for t in titles:

        name = t.get_text(strip=True)

        if len(name) < 5:
            continue

        docs.append({
            "text": f"{name} micro course from Kaggle Learn",
            "type": "course",
            "metadata": {
                "name": name,
                "platform": "Kaggle",
                "mode": "online"
            }
        })

except:
    print("Kaggle scraping failed")


# -------------------------
# INSERT INTO MONGODB
# -------------------------

if docs:
    knowledge.insert_many(docs)

print("Courses inserted:", len(docs))