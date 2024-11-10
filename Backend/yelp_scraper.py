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
    print("Fetching business data...")
    response = requests.get(YELP_API_URL, headers=headers, params=params)
    response.raise_for_status()  # Raise an error for HTTP issues
    data = response.json()
    businesses = []
    
    for business in data.get("businesses", []):
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
        print(f"Fetching reviews for business ID: {business_data['id']} ({business_data['name']})")
        business_data["reviews"] = fetch_yelp_reviews(business["id"])
        businesses.append(business_data)
    
    return businesses

def fetch_yelp_reviews(business_id, retries=3, delay=2):
    """Fetches up to 3 reviews for a specific Yelp business ID with retry on rate limits."""
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    url = YELP_REVIEWS_URL.format(id=business_id)
    
    for attempt in range(1, retries + 1):
        print(f"Attempt {attempt} to fetch reviews for business ID: {business_id}")
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise HTTP errors
            
            # If response is successful, extract reviews
            reviews_data = response.json()
            reviews = [review["text"] for review in reviews_data.get("reviews", [])]
            
            print(f"Fetched {len(reviews)} reviews for business ID: {business_id}")
            return reviews  # Return reviews if found
        
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"Rate limit hit on attempt {attempt}. Waiting {delay} seconds before retrying...")
                time.sleep(delay)  # Wait and retry after delay
            elif response.status_code == 404:
                print(f"Business ID {business_id} not found. Skipping...")
                break  # Break loop for 404 Not Found
            else:
                print(f"Error fetching reviews for business ID: {business_id}. Status code: {response.status_code}, Error: {e}")
                break  # Break for other errors
    
    print(f"Failed to fetch reviews for business ID: {business_id} after {retries} attempts.")
    return []  # Return an empty list if all attempts fail

def save_to_json(data, filename="yelp_data_with_reviews.json"):
    """Saves the data to a JSON file."""
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:
        # Fetch Yelp data with reviews for each business in Troy, NY
        data = fetch_yelp_data("Troy, NY", "accessible cafes")
        
        # Save the data to a JSON file with reviews included
        save_to_json(data, "yelp_data_with_reviews.json")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
