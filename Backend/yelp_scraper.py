import os
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Yelp API Key from .env file
YELP_API_KEY = os.getenv("YELP_API_KEY")
YELP_API_URL = "https://api.yelp.com/v3/businesses/search"
YELP_REVIEWS_URL = "https://api.yelp.com/v3/businesses/{id}/reviews"

def fetch_yelp_data(location="Troy, NY", term="accessible places"):
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    params = {
        "location": location,
        "term": term,
        "limit": 5  # Adjust as needed
    }

    response = requests.get(YELP_API_URL, headers=headers, params=params)
    response.raise_for_status()  # Raise an error for HTTP issues
    data = response.json()
    businesses = []

    for business in data['businesses']:
        business_data = {
            "id": business.get("id"),
            "name": business.get("name"),
            "rating": business.get("rating"),
            "review_count": business.get("review_count"),
            "phone": business.get("display_phone"),
            "address": ", ".join(business["location"].get("display_address", ["No address available"])),
            "latitude": business["coordinates"].get("latitude"),
            "longitude": business["coordinates"].get("longitude"),
            "categories": [category["title"] for category in business.get("categories", [])]
        }

        # Fetch reviews with error handling and delays
        business_data["reviews"] = fetch_yelp_reviews(business["id"])
        businesses.append(business_data)
    
    return businesses

def fetch_yelp_reviews(business_id, retries=3, delay=2):
    """Fetches reviews for a specific Yelp business ID with retry on rate limits."""
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    url = YELP_REVIEWS_URL.format(id=business_id)
    
    for attempt in range(retries):
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            # Successful response, log full JSON response for debugging
            reviews_data = response.json()
            print(f"Full response for business ID {business_id}:", reviews_data)
            return [review["text"] for review in reviews_data.get("reviews", [])]
        
        elif response.status_code == 429:
            print(f"Rate limit hit. Waiting {delay} seconds before retrying...")
            time.sleep(delay)  # Wait and retry after delay
        else:
            print(f"No reviews found for business ID: {business_id}. Response: {response.json()}")
            break  # For other errors, break out of the loop
    
    return []  # Return an empty list if all attempts fail

# Test function with a known business ID
def test_known_business_id():
    known_id = "yelp-san-francisco"  # Example business ID for testing
    reviews = fetch_yelp_reviews(known_id)
    print("Reviews for known business ID:", reviews)


def save_to_json(data, filename="yelp_data_with_reviews.json"):
    """Saves the data to a JSON file."""
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:

        test_known_business_id()
        # Fetch Yelp data with reviews for each business in Troy, NY
        data = fetch_yelp_data("Troy, NY", "accessible cafes")
        
        # Save the data to a JSON file with reviews included
        save_to_json(data, "yelp_data_with_reviews.json")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
