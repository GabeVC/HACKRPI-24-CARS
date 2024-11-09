# yelp_scraper.py
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

YELP_API_KEY = os.getenv("YELP_API_KEY")
YELP_API_URL = "https://api.yelp.com/v3/businesses/search"

def fetch_yelp_data(location, term="accessibility"):
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    params = {
        "location": location,
        "term": term,
        "limit": 5  # Adjust as needed
    }
    
    response = requests.get(YELP_API_URL, headers=headers, params=params)
    response.raise_for_status()  # Raise an exception for HTTP errors
    data = response.json()
    return data['businesses']

# Usage example
if __name__ == "__main__":
    data = fetch_yelp_data("New York")
    print(data)
