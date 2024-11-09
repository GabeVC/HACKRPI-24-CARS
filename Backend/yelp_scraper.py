import requests
import os
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load the .env file from the Backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Yelp API Key from .env file
YELP_API_KEY = os.getenv("YELP_API_KEY")
YELP_API_URL = "https://api.yelp.com/v3/businesses/search"

def fetch_yelp_data(location="Troy, NY", term="accessibility"):
    # Check if the API key is loaded correctly
    if not YELP_API_KEY:
        raise ValueError("Yelp API key is missing. Make sure it's set in the .env file.")
    
    # Authorization header with the API key
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    
    # Parameters for the search
    params = {
        "location": location,
        "term": term,
        "limit": 5  # Number of results to return
    }

    # Print URL and headers for debugging
    print("Request URL:", YELP_API_URL)
    print("Headers:", headers)
    print("Params:", params)

    # Send the GET request with headers and parameters
    response = requests.get(YELP_API_URL, headers=headers, params=params)
    
    # Check if request was successful
    if response.status_code != 200:
        print("Error:", response.json())  # Print the error message from Yelp's response
        response.raise_for_status()  # Raises an exception for HTTP errors
    
    # Parse and return the data
    data = response.json()
    return data['businesses']

# Usage example
if __name__ == "__main__":
    try:
        # Fetch data for Troy, NY
        data = fetch_yelp_data("Troy, NY")
        
        # Print the output in a readable format
        for business in data:
            print("Name:", business["name"])
            print("Rating:", business.get("rating", "N/A"))
            print("Address:", ", ".join(business["location"]["display_address"]))
            print("Categories:", ", ".join([category["title"] for category in business["categories"]]))
            print("-" * 40)  # Separator for readability
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except ValueError as ve:
        print(ve)
