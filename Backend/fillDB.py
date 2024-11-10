from google_scraper import fetch_google_places_data
from google_scraper import save_to_json
from ratingReviewClass import load_json_data
from ratingReviewClass import convert_reviews_to_objects
from ratingReviewClass import export_reviews_to_json




if __name__ == "__main__":
    coordinates = [
        "42.7284,-73.6918",  # Troy, NY
        "43.0481,-76.1474",  # Syracuse, NY
        "42.8864,-78.8784",  # Buffalo, NY
        "42.6526,-73.7562",  # Albany, NY
        "43.1610,-77.6109",  # Rochester, NY
        "44.1970,-73.4396",  # Lake Placid, NY
        "42.4895,-76.5157",  # Ithaca, NY
        "43.2994,-74.2179",  # Adirondack, NY (region center)
        "43.9388,-75.9180",  # Watertown, NY
        "42.1041,-75.8800",  # Binghamton, NY
        "42.4072,-79.2408",  # Jamestown, NY
        "44.9358,-73.1627",  # Plattsburgh, NY
        "42.9917,-78.1811",  # Batavia, NY
        "42.0834,-77.0011",  # Elmira, NY
        "43.2128,-77.4301",  # Irondequoit, NY
        "42.4560,-76.4741",  # Cortland, NY
        "43.9700,-75.9119",  # Ogdensburg, NY
        "42.8070,-73.9453",  # Schenectady, NY
        "42.0930,-79.3227",  # Dunkirk, NY
        "42.4634,-75.0620",  # Oneonta, NY
        "42.8500,-73.7588",  # Clifton Park, NY
        "42.5298,-75.0876",  # Norwich, NY
        "43.0680,-75.2717",  # Rome, NY
        "42.8142,-75.5396",  # Hamilton, NY
        "42.6105,-74.0346",  # Catskill, NY
        "42.2654,-75.8964",  # Johnson City, NY
        "42.8605,-76.9820",  # Geneva, NY
        "42.9128,-73.6884",  # Saratoga Springs, NY
        "44.3363,-73.7754",  # Ticonderoga, NY
        "43.9856,-75.1585",  # Lowville, NY
        "42.3915,-74.0093",  # Cobleskill, NY
        "43.0846,-73.7846",  # Glens Falls, NY
        "42.0901,-76.8077",  # Horseheads, NY
        "43.0265,-74.2936",  # Amsterdam, NY
        "42.6863,-76.0626",  # Homer, NY
        "44.2306,-76.0207",  # Cape Vincent, NY
        "42.2262,-73.7903",  # Hudson, NY
        "42.3362,-77.3214",  # Bath, NY
        "42.2270,-75.9475",  # Endicott, NY
        "43.0489,-76.0999" # Liverpool, NY
    ]


    queries = ["resturants", "business", "parks","outtings", "schools", "post office", "cafe", "gym", "recreation center"]
    
    
    for c in coordinates:
        for q in queries:
            try:
                data = fetch_google_places_data(query= q, location= c, radius=5000)
                save_to_json(data, "google_places_with_reviews.json")
                
            except requests.exceptions.HTTPError as e:
                print(f"HTTP Error: {e}")
            
            data = load_json_data("google_places_with_reviews.json")
            review_objects = convert_reviews_to_objects(data)
            
            export_reviews_to_json(review_objects)
        
    