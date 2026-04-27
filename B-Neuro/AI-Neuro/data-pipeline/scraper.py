"""
scraper.py — Neuropath Data Pipeline

Contains:
  1. Static NIRF ranking scraper (original — preserved)
  2. Dynamic scrape_for_field(field) — real-time scraper + LLM fallback
     that feeds MongoDB under collection "scraped_<field>"
"""

import os
import re
import json
import time
import requests
from bs4 import BeautifulSoup
from db import rag_collection as knowledge
from pymongo import MongoClient

# ─── Shared MongoDB client (reuse db.py mongo) ──────────────────────────────
_MONGO_URI = "mongodb+srv://rubipreethi2004_db_user:neuropath@cluster0.qjohmcm.mongodb.net/?appName=Cluster0"
_client = MongoClient(_MONGO_URI)
_scrape_db = _client["neuropath_db"]

# ─── NVIDIA Qwen API config ──────────────────────────────────────────────────
NVIDIA_API_KEY = os.environ.get(
    "NVIDIA_API_KEY_QWEN",
    "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"
)
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

SCRAPE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ════════════════════════════════════════════════════════════════════════════
# 1. ORIGINAL STATIC SCRAPER — NIRF Rankings (preserved exactly)
# ════════════════════════════════════════════════════════════════════════════

url = "https://www.nirfindia.org/Rankings/2025/CollegeRanking.html"

res = requests.get(url, timeout=20)
soup = BeautifulSoup(res.text, "html.parser")
rows = soup.select("tbody tr")

docs = []

for row in rows:
    cols = row.find_all("td")
    if len(cols) < 6:
        continue

    name  = cols[1].get_text(strip=True)
    state = cols[3].get_text(strip=True)
    score = cols[4].get_text(strip=True)
    rank  = cols[5].get_text(strip=True)

    document = {
        "text": f"{name} located in {state} ranked {rank} with score {score} in NIRF ranking",
        "type": "institution",
        "metadata": {
            "name":  name,
            "state": state,
            "rank":  rank,
            "score": score,
        },
    }
    docs.append(document)

if docs:
    knowledge.insert_many(docs)

print("Institutions stored:", len(docs))


# ════════════════════════════════════════════════════════════════════════════
# 2. DYNAMIC FIELD-BASED SCRAPER
# ════════════════════════════════════════════════════════════════════════════

def _collection_name(field: str) -> str:
    """Normalise field to a valid MongoDB collection name."""
    return "scraped_" + re.sub(r"[^a-z0-9]", "_", field.lower().strip())


def _call_qwen_llm(system_prompt: str, user_message: str) -> str:
    """Call NVIDIA Qwen API and return the assistant reply string."""
    payload = {
        "model": "qwen/qwen2.5-72b-instruct",
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": user_message},
        ],
        "temperature": 0.4,
        "max_tokens": 2048,
    }
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    response = requests.post(NVIDIA_BASE_URL, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _llm_data_for_field(field: str) -> dict:
    """
    Ask the LLM to generate courses, scholarships, and institutions
    for the given field. Returns a dict with keys:
      courses, scholarships, institutions
    """
    system = (
        "You are an expert career data assistant for Neuropath. "
        "Return ONLY valid JSON — no markdown, no explanation."
    )
    user = f"""Field: {field}

Return JSON exactly like this:
{{
  "courses": [
    {{"name": "...", "platform": "...", "link": "https://...", "mode": "online"}}
  ],
  "scholarships": [
    {{"title": "...", "source": "...", "description": "...", "amount": "...", "deadline": "..."}}
  ],
  "institutions": [
    {{"name": "...", "location": "...", "type": "university/institute"}}
  ]
}}

Provide 5 courses, 4 scholarships (real ones relevant to {field} in India or global), and 6 institutions.
Use real, verifiable names where possible."""

    try:
        raw = _call_qwen_llm(system, user)
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        print(f"[LLM fallback] Failed for field '{field}': {e}")
        return {"courses": [], "scholarships": [], "institutions": []}


def _scrape_courses_realtime(field: str) -> list:
    """Real-time scrape of NPTEL, Swayam, MIT OCW for the given field."""
    results = []
    kw = field.lower()

    # NPTEL
    try:
        r = requests.get("https://nptel.ac.in/courses", headers=SCRAPE_HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup.find_all("h3"):
            text = tag.get_text(strip=True)
            if kw in text.lower():
                a = tag.find_parent("a")
                link = a["href"] if a and a.get("href") else "https://nptel.ac.in/courses"
                results.append({
                    "name": text, "platform": "NPTEL",
                    "link": link if link.startswith("http") else f"https://nptel.ac.in{link}",
                    "mode": "online",
                })
                if len(results) >= 3:
                    break
    except Exception as e:
        print(f"[NPTEL scrape] {e}")

    # Swayam
    try:
        r = requests.get("https://swayam.gov.in/explorer", headers=SCRAPE_HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup.find_all(["h3", "h4"]):
            text = tag.get_text(strip=True)
            if kw in text.lower():
                a = tag.find_parent("a")
                link = a["href"] if a and a.get("href") else "https://swayam.gov.in"
                results.append({
                    "name": text, "platform": "Swayam",
                    "link": link if link.startswith("http") else f"https://swayam.gov.in{link}",
                    "mode": "online",
                })
                if len(results) >= 5:
                    break
    except Exception as e:
        print(f"[Swayam scrape] {e}")

    # MIT OCW
    try:
        r = requests.get(
            f"https://ocw.mit.edu/search/?q={requests.utils.quote(field)}",
            headers=SCRAPE_HEADERS, timeout=10
        )
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup.find_all("h3"):
            text = tag.get_text(strip=True)
            a = tag.find_parent("a")
            href = a["href"] if a and a.get("href") else ""
            if text:
                results.append({
                    "name": text, "platform": "MIT OpenCourseWare",
                    "link": href if href.startswith("http") else f"https://ocw.mit.edu{href}",
                    "mode": "online",
                })
                if len(results) >= 8:
                    break
    except Exception as e:
        print(f"[MIT OCW scrape] {e}")

    return results[:8]


def _scrape_scholarships_realtime(field: str) -> list:
    """Real-time scrape of scholarships.gov.in."""
    results = []
    try:
        r = requests.get("https://scholarships.gov.in/", headers=SCRAPE_HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all("a"):
            text = a.get_text(strip=True)
            if "scholarship" in text.lower() and len(text) > 15:
                results.append({
                    "title": text,
                    "source": "National Scholarship Portal",
                    "description": f"Government scholarship — see portal for {field} details",
                    "amount": "Varies",
                    "deadline": "Check portal",
                })
                if len(results) >= 4:
                    break
    except Exception as e:
        print(f"[Scholarships scrape] {e}")
    return results


def _scrape_training_realtime(field: str) -> list:
    """Real-time scrape of Unstop and Devpost."""
    results = []
    kw = field.lower()

    try:
        r = requests.get("https://unstop.com/competitions", headers=SCRAPE_HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup.find_all(["h2", "h3"]):
            text = tag.get_text(strip=True)
            if kw in text.lower():
                a = tag.find_parent("a")
                href = a["href"] if a and a.get("href") else "https://unstop.com"
                results.append({
                    "title": text, "provider": "Unstop",
                    "type": "online", "duration": "Varies",
                    "link": href if href.startswith("http") else f"https://unstop.com{href}",
                })
                if len(results) >= 3:
                    break
    except Exception as e:
        print(f"[Unstop scrape] {e}")

    try:
        r = requests.get("https://devpost.com/hackathons", headers=SCRAPE_HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup.find_all(["h2", "h3"]):
            text = tag.get_text(strip=True)
            if text:
                a = tag.find_parent("a")
                href = a["href"] if a and a.get("href") else "https://devpost.com"
                results.append({
                    "title": text, "provider": "Devpost",
                    "type": "online", "duration": "Hackathon",
                    "link": href if href.startswith("http") else f"https://devpost.com{href}",
                })
                if len(results) >= 6:
                    break
    except Exception as e:
        print(f"[Devpost scrape] {e}")

    return results[:6]


def scrape_for_field(field: str) -> dict:
    """
    Real-time scraper + LLM fallback for a given career field.

    Strategy:
      1. Scrape courses, scholarships, training in real time.
      2. If any category has < 3 results, call NVIDIA Qwen to generate
         fresh LLM-based data and merge it with scraped results.
      3. Store everything under MongoDB collection "scraped_<field>".
      4. Return the combined dict.

    Returns:
      {
        "courses":      [...],
        "scholarships": [...],
        "institutions": [...],
        "training":     [...],
        "source":       "scrape" | "scrape+llm" | "llm"
      }
    """
    print(f"\n[scrape_for_field] Starting real-time scrape for field='{field}'")
    coll = _scrape_db[_collection_name(field)]

    # ── Step 1: Real-time scraping ─────────────────────────────────────────
    courses      = _scrape_courses_realtime(field)
    scholarships = _scrape_scholarships_realtime(field)
    training     = _scrape_training_realtime(field)

    print(f"  Scraped: {len(courses)} courses, {len(scholarships)} scholarships, {len(training)} programs")

    # ── Step 2: LLM fallback if insufficient ──────────────────────────────
    used_llm = False
    if len(courses) < 3 or len(scholarships) < 2:
        print("  Insufficient scrape results — calling Qwen LLM for supplemental data…")
        llm_data = _llm_data_for_field(field)
        used_llm = True

        # Merge courses
        llm_courses = llm_data.get("courses", [])
        for lc in llm_courses:
            if not any(c["name"].lower() == lc["name"].lower() for c in courses):
                courses.append(lc)
            if len(courses) >= 8:
                break

        # Merge scholarships
        llm_scholarships = llm_data.get("scholarships", [])
        for ls in llm_scholarships:
            if not any(s["title"].lower() == ls["title"].lower() for s in scholarships):
                scholarships.append(ls)
            if len(scholarships) >= 6:
                break

    # ── Step 3: LLM institutions (always good to have) ────────────────────
    institutions = []
    if used_llm:
        institutions = _llm_data_for_field(field).get("institutions", [])
    else:
        # Try a lightweight LLM call just for institutions
        try:
            raw = _call_qwen_llm(
                "Return ONLY valid JSON, no markdown.",
                f'List 6 top institutions for "{field}" in India or globally. JSON: {{"institutions":[{{"name":"...","location":"...","type":"..."}}]}}'
            )
            raw = raw.replace("```json", "").replace("```", "").strip()
            institutions = json.loads(raw).get("institutions", [])
        except Exception:
            institutions = []

    source = "scrape+llm" if used_llm else "scrape"

    result = {
        "field":        field,
        "courses":      courses[:8],
        "scholarships": scholarships[:6],
        "institutions": institutions[:6],
        "training":     training[:6],
        "source":       source,
        "scraped_at":   time.time(),
    }

    # ── Step 4: Store in MongoDB ───────────────────────────────────────────
    try:
        coll.delete_many({})          # refresh data
        coll.insert_one(result)
        print(f"  Stored in MongoDB collection '{_collection_name(field)}'")
    except Exception as e:
        print(f"  [MongoDB store] Failed: {e}")

    print(f"  Done. Source: {source}")
    return result