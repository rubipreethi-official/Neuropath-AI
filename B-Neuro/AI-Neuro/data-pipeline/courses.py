import requests
from bs4 import BeautifulSoup
from db import rag_collection as knowledge

headers = {
    "User-Agent": "Mozilla/5.0"
}

docs = []

# -------------------------
# MIT OpenCourseWare
# -------------------------

try:

    url = "https://ocw.mit.edu/search/?q=computer"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    courses = soup.find_all("h3")

    for c in courses:

        name = c.get_text(strip=True)

        docs.append({
            "text": f"{name} free course from MIT OpenCourseWare",
            "type": "course",
            "metadata": {
                "name": name,
                "platform": "MIT OCW",
                "link": url
            }
        })

except:

    docs.append({
        "text": "MIT OpenCourseWare courses available",
        "type": "course",
        "metadata": {
            "platform": "MIT OCW",
            "link": "https://ocw.mit.edu"
        }
    })

# -------------------------
# Devpost Hackathons
# -------------------------

try:

    url = "https://devpost.com/hackathons"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    events = soup.select(".hackathon-tile")

    for e in events:

        title = e.select_one(".title")

        if not title:
            continue

        name = title.get_text(strip=True)

        docs.append({
            "text": f"{name} hackathon competition for developers",
            "type": "event",
            "metadata": {
                "name": name,
                "platform": "Devpost",
                "link": url
            }
        })

except:

    docs.append({
        "text": "Hackathons hosted on Devpost",
        "type": "event",
        "metadata": {
            "platform": "Devpost",
            "link": "https://devpost.com/hackathons"
        }
    })

# -------------------------
# Conference Alerts
# -------------------------

try:

    url = "https://conferencealerts.com"

    res = requests.get(url, headers=headers, timeout=20)

    soup = BeautifulSoup(res.text, "html.parser")

    events = soup.find_all("h2")

    for e in events[:20]:

        name = e.get_text(strip=True)

        docs.append({
            "text": f"{name} academic conference or seminar",
            "type": "event",
            "metadata": {
                "name": name,
                "platform": "ConferenceAlerts",
                "link": url
            }
        })

except:

    docs.append({
        "text": "Academic conferences listed on ConferenceAlerts",
        "type": "event",
        "metadata": {
            "platform": "ConferenceAlerts",
            "link": "https://conferencealerts.com"
        }
    })

# -------------------------
# Store reference platforms
# -------------------------

platforms = [

("Coursera","https://coursera.org"),
("Udemy","https://udemy.com"),
("SWAYAM","https://swayam.gov.in"),
("Kaggle Learn","https://kaggle.com/learn"),
("Unstop Competitions","https://unstop.com"),
("IEEE Events","https://ieee.org")

]

for p in platforms:

    docs.append({

        "text": f"Learning opportunities available on {p[0]} platform",

        "type": "platform",

        "metadata": {

            "platform": p[0],

            "link": p[1]

        }

    })


# -------------------------
# Insert to MongoDB
# -------------------------

if docs:

    knowledge.insert_many(docs)

print("Resources inserted:", len(docs))