import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Yelp API Key from .env file
YELP_API_KEY = os.getenv("YELP_API_KEY")
YELP_API_URL = "https://api.yelp.com/v3/businesses/search"

def fetch_yelp_data(location="Troy, NY", term="accessible places"):
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    params = {
        "location": location,
        "term": term,
        "limit": 5  # You can adjust this as needed
    }

    response = requests.get(YELP_API_URL, headers=headers, params=params)
    response.raise_for_status()  # Raises an error for HTTP issues
    data = response.json()

    # Process data to include coordinates directly in each business
    businesses = []
    for business in data['businesses']:
        # Extract relevant fields, including coordinates
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
        businesses.append(business_data)
    
    return businesses

def save_to_json(data, filename="yelp_data_with_coordinates.json"):
    """Save data to a JSON file."""
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:
        # Fetch Yelp data with specific location and search term
        data = fetch_yelp_data("Troy, NY", "accessible cafes")
        
        # Save the data to a JSON file with latitude and longitude included
        save_to_json(data, "yelp_data_with_coordinates.json")

        # Print confirmation
        print("Data fetching and saving completed successfully.")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
    except ValueError as ve:
        print(ve)
