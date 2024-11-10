import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use your exact RapidAPI key here if not in a .env file
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")  # Make sure this is correct

# Base URL as specified on RapidAPI
BASE_URL = "https://real-time-tripadvisor-scraper-api.p.rapidapi.com"

# Headers with RapidAPI Key
headers = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "real-time-tripadvisor-scraper-api.p.rapidapi.com"  # Verify this matches exactly with RapidAPI
}

# Debug print to confirm configuration
print("Using RapidAPI Key:", RAPIDAPI_KEY)  # Confirm key is loaded
print("Headers:", headers)  # Confirm headers

def search_businesses(location="Troy, NY", business_type="all"):
    """Search for various types of businesses in a specific location."""
    url = f"{BASE_URL}/locations/search"
    params = {
        "query": location,
        "limit": "10",  # Number of results to return, adjust as needed
        "lang": "en_US"
    }
    response = requests.get(url, headers=headers, params=params)
    
    # Additional debug to print the full request URL and status
    print("Request URL:", response.url)
    print("Status Code:", response.status_code)
    
    # Check if request was successful
    if response.status_code == 403:
        print("Access forbidden. Please check your API key and subscription status.")
    response.raise_for_status()  # Raise an error for HTTP issues
    data = response.json()
    
    businesses = [
        {
            "name": item.get("name"),
            "location_id": item.get("location_id"),
            "category": item.get("category", "Unknown"),
            "address": item.get("address_obj", {}).get("address_string", "No address available"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude")
        }
        for item in data.get("data", []) if business_type == "all" or item.get("category") == business_type
    ]
    return businesses

# Usage example to test
if __name__ == "__main__":
    try:
        # Test function to search businesses
        data = search_businesses("Troy, NY", "all")
        print("Businesses Found:", data)
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
