import os
import requests
import json
import time
import re
from dotenv import load_dotenv
from textblob import TextBlob

# Load environment variables
load_dotenv()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# Define keywords related to accessibility features
ACCESSIBILITY_KEYWORDS = {
    "mobility": ["wheelchair", "ramps", "elevator", "accessible"],
    "vision": ["braille", "signage", "contrast", "audio assistance"],
    "sensory": ["quiet", "noise", "lights", "overwhelming"],
    "language": ["sign language", "interpreter", "translated materials"]
}

def analyze_sentiment(text):
    """Returns sentiment polarity (-1.0 to 1.0) where negative is < 0, neutral is 0, and positive is > 0."""
    blob = TextBlob(text)
    return blob.sentiment.polarity

def check_accessibility_mentions(review):
    """Checks for mentions of accessibility-related keywords and classifies them."""
    mentions = {}
    for category, keywords in ACCESSIBILITY_KEYWORDS.items():
        found_keywords = [word for word in keywords if re.search(rf"\b{word}\b", review, re.IGNORECASE)]
        if found_keywords:
            mentions[category] = found_keywords
    return mentions

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

def fetch_and_analyze_reviews(place_id):
    """Fetches reviews and analyzes for accessibility and sentiment."""
    reviews = fetch_google_reviews(place_id)
    analyzed_reviews = []

    for review in reviews:
        sentiment_score = analyze_sentiment(review)
        sentiment = "positive" if sentiment_score > 0 else "negative" if sentiment_score < 0 else "neutral"
        accessibility_mentions = check_accessibility_mentions(review)
        
        if accessibility_mentions:  # Only include if accessibility keywords are mentioned
            analyzed_reviews.append({
                "review": review,
                "sentiment": sentiment,
                "accessibility": accessibility_mentions
            })
    return analyzed_reviews

def fetch_google_places_data(query="", location="42.7284,-73.6918", radius=5000, types=""):
    params = {
        "query": query,
        "location": location,
        "radius": radius,
        "key": GOOGLE_PLACES_API_KEY
    }
    if types:
        params["type"] = types

    places = []
    while True:
        response = requests.get(GOOGLE_TEXTSEARCH_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        places.extend([
            {
                "id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "latitude": place["geometry"]["location"]["lat"],
                "longitude": place["geometry"]["location"]["lng"],
                "rating": place.get("rating"),
                "analyzed_reviews": fetch_and_analyze_reviews(place.get("place_id"))  # Analyze reviews for each place
            } for place in data.get('results', [])
        ])
        
        # Check if there's a next page; if so, set the pagetoken for the next request
        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break  # No more pages, exit loop
        
        # Update params with the next page token
        params["pagetoken"] = next_page_token
        
        # Google requires a short delay before using the next page token
        time.sleep(2)

    return places

def save_to_json(data, filename="google_places_with_reviews.json"):
    """Save data to a JSON file."""
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:
        data = fetch_google_places_data(query="restaurants businesses cafes gym", location="42.7284,-73.6918", radius=5000)
        save_to_json(data, "google_places_with_reviews.json")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
