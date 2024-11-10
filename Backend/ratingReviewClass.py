class ratingReviewParse:
    def __init__(self, id, locateId):
        self.id = id
        self.location = locateId
        self.mobility = 0.0
        self.vision = 0.0
        self.sensory = 0.0
        self.language = 0.0
        self.reviewContent = ""
        self.qualityReview = 0.0
        self.overallAccessibleScore = 0.0
        
        
    def setMobility(self, value):
        self.mobility = float(value)
        
    def setVision(self, value):
        self.vision = float(value)
    
    def setSensory(self, value):
        self.sensory = float(value)
    
    def setLang(self, value):
        self.language = float(value)
        
    def setContent(self, value):
        try:
            float(value)  # Try to convert to a float
        except ValueError:
            self.reviewContent = str(value)
    
    def calcOverall(self):
        sum = self.mobility + self.language + self.sensory + self.vision
        self.overallAccessibleScore = sum / 5.0
    
    def setQuality(self, value):
        self.qualityReview = float(value)
        



import json
import uuid
from ratingReviewClass import ratingReviewParse

# Generate a random UUID
unique_id = uuid.uuid4()

# Load JSON data from file
def load_json_data(filename="places_with_reviews.json"):
    with open(filename, "r") as f:
        return json.load(f)

# Convert each review to a ratingReviewParse object
def convert_reviews_to_objects(data):
    review_objects = []

    for place in data:
        place_id = place.get("address")  # Use the address as the location ID
        place_name = place.get("name")
        place_rating = place.get("rating")

        # Check if there are reviews to process
        for review_data in place.get("analyzed_reviews", []):
            review_obj = ratingReviewParse(str(uuid.uuid4()), place_id)
            
            # Set review content
            review_obj.setContent(review_data.get("review", ""))
            
            # Assign values to accessibility categories based on keywords
            accessibility_mentions = review_data.get("accessibility", {})
            if "mobility" in accessibility_mentions:
                review_obj.setMobility(1.0)  # Arbitrary value; you could use another metric
            if "vision" in accessibility_mentions:
                review_obj.setVision(1.0)
            if "sensory" in accessibility_mentions:
                review_obj.setSensory(1.0)
            if "language" in accessibility_mentions:
                review_obj.setLang(1.0)
            
            # Assign sentiment as quality score (1.0 for positive, 0.5 for neutral, 0.0 for negative)
            sentiment = review_data.get("sentiment")
            quality_score = 1.0 if sentiment == "positive" else 0.5 if sentiment == "neutral" else 0.0
            review_obj.setQuality(place_rating)
            
            # Calculate the overall score
            review_obj.calcOverall()
            
            # Convert to dict for Firestore
            review_dict = {
                "id": review_obj.id,
                "locationId": review_obj.location,
                "mobility": review_obj.mobility,
                "vision": review_obj.vision,
                "sensory": review_obj.sensory,
                "language": review_obj.language,
                "reviewContent": review_obj.reviewContent,
                "qualityReview": review_obj.qualityReview,
                "overallAccessibleScore": review_obj.overallScore,
            }
            review_objects.append(review_dict)
    
    return review_objects

# Export the review objects to a JSON file
def export_reviews_to_json(review_objects, filename="analyzed_reviews.json"):
    with open(filename, "w") as outfile:
        json.dump(review_objects, outfile, indent=4)

# Usage example
if __name__ == "__main__":
    data = load_json_data("google_places_with_reviews.json")
    review_objects = convert_reviews_to_objects(data)
    
    # Print a summary of the first few objects for verification
    for review in review_objects:
        print(vars(review))

            
