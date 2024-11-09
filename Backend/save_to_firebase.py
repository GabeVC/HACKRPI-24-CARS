# save_to_firebase.py
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def save_data_to_firebase(collection_name, data):
    collection_ref = db.collection(collection_name)
    for item in data:
        doc_ref = collection_ref.document()  # Automatically generate a document ID
        doc_ref.set(item)

# Example usage
if __name__ == "__main__":
    sample_data = [{"name": "Sample Business", "rating": 4.5, "location": "New York"}]
    save_data_to_firebase("yelp_reviews", sample_data)
