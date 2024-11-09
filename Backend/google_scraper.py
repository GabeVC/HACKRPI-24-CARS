import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

def fetch_google_places_data(query="accessible places", location="42.7284,-73.6918", radius=5000):
    """
    Fetches data from Google Places API based on query, location, and radius.
    
    Parameters:
    - query (str): The type of place or keywords to search for.
    - location (str): Latitude and longitude coordinates for the search center.
    - radius (int): Radius in meters around the location to search.

    Returns:
    - list: A list of places matching the query within the specified radius.
    """
    params = {
        "query": query,              # e.g., "accessible places"
        "location": location,         # Coordinates for Troy, NY
        "radius": radius,             # Search within a 5 km radius
        "key": GOOGLE_PLACES_API_KEY
    }
    
    # Send the GET request to Google Places API
    response = requests.get(GOOGLE_API_URL, params=params)
    
    # Raise an exception for HTTP errors
    response.raise_for_status()
    
    # Parse and return the data
    data = response.json()
    return data['results']

def save_to_json(data, filename="google_places_data.json"):
    """Saves the data to a JSON file."""
    import json
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

# Usage example
if __name__ == "__main__":
    try:
        # Fetch places data for Troy, NY with a relevant query term
        data = fetch_google_places_data(query="accessible cafes", location="42.7284,-73.6918", radius=5000)
        
        # Save data to JSON
        save_to_json(data, "google_places_troy.json")
        
        # Print a readable summary for each place
        for place in data:
            print("Name:", place.get("name"))
            print("Address:", place.get("formatted_address"))
            print("Rating:", place.get("rating", "N/A"))
            print("Types:", ", ".join(place.get("types", [])))
            print("-" * 40)
    
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
