import requests
import os
from datetime import datetime

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
if not RAPIDAPI_KEY:
    raise ValueError("RAPIDAPI_KEY is not set in environment variables.")

headers = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
}

base_url = "https://api-football-v1.p.rapidapi.com/v3"
CURRENT_SEASON = 2025

def fetch_all_leagues():
    url = f"{base_url}/leagues?season={CURRENT_SEASON}"
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json().get("response", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching leagues: {e}")
        return []

def fetch_latest_fixtures():
    url = f"{base_url}/fixtures?next=50"
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json().get("response", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching fixtures: {e}")
        return []
