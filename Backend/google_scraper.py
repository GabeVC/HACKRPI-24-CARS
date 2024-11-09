# google_scraper.py
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

def fetch_google_data(query, location):
    params = {
        "query": query,
        "location": location,
        "key": GOOGLE_PLACES_API_KEY
    }
    
    response = requests.get(GOOGLE_API_URL, params=params)
    response.raise_for_status()  # Raise an exception for HTTP errors
    data = response.json()
    return data['results']

# Usage example
if __name__ == "__main__":
    data = fetch_google_data("wheelchair accessible cafes", "40.712776,-74.005974")
    print(data)
