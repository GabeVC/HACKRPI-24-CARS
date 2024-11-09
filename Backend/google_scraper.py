import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

def fetch_google_places_data(query="", location="42.7284,-73.6918", radius=5000):
    params = {
        "query": query,
        "location": location,
        "radius": radius,
        "key": GOOGLE_PLACES_API_KEY
    }
    response = requests.get(GOOGLE_TEXTSEARCH_URL, params=params)
    response.raise_for_status()
    
    data = response.json()
    places = []
    
    for place in data['results']:
        place_data = {
            "id": place.get("place_id"),
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "latitude": place["geometry"]["location"]["lat"],
            "longitude": place["geometry"]["location"]["lng"],
            "rating": place.get("rating"),
            "reviews": fetch_google_reviews(place.get("place_id"))  # Fetch reviews for each place
        }
        places.append(place_data)
    
    return places

def fetch_google_reviews(place_id):
    """Fetches reviews for a specific Google Place ID."""
    params = {
        "place_id": place_id,
        "fields": "review",
        "key": GOOGLE_PLACES_API_KEY
    }
    response = requests.get(GOOGLE_DETAILS_URL, params=params)
    response.raise_for_status()
    
    details_data = response.json().get("result", {})
    reviews = [review["text"] for review in details_data.get("reviews", [])]
    return reviews

def save_to_json(data, filename="google_places_with_reviews.json"):
    """Save data to a JSON file."""
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:
        data = fetch_google_places_data(query="establishment", location="42.7284,-73.6918", radius=5000)
        save_to_json(data, "google_places_with_reviews.json")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
