const { db } = require('./firebase'); // Import db from firebase.js
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar')
const axios = require('axios'); // Import axios for making HTTP requests
require('dotenv').config(); // Import dotenv to load environment variables

// Path to the file
const reviewFilePath = path.join(__dirname, 'analyzed_reviews.json');

// Get Google API key from the environment variable
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY; // Access from .env file

// Function to load reviews from the JSON file
async function loadReviews() {
  try {
    const data = await fs.readFile(reviewFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    if (!Array.isArray(parsedData)) {
      throw new Error('JSON data is not an array');
    }
    return parsedData;
  } catch (error) {
    console.error("Error reading the reviews file:", error);
    throw error;
  }
}

// Function to get latitude and longitude from an address (locationId)
async function getLatLngFromAddress(address) {
  if (!address || address.trim() === '') {
    throw new Error('Invalid address provided: Address is empty or undefined');
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: address,
        key: 'AIzaSyD4UwvRBbWIt6_VJYMKeBNz1e3TQIu7hNU',
      },
    });

    console.log('Geocoding response:', response.data);  // Log the full response for debugging

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.error('Geocoding API error:', response.data.status);
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error fetching latitude and longitude:', error.message);
    throw error;  // Rethrow the error to be handled by the calling function
  }
}

// Function to check and add the review to the corresponding location
async function checkLocation(locationId, reviewId) {
  try {
    const locationRef = db.collection('locations').doc(locationId);
    const locationDoc = await locationRef.get();

    if (locationDoc.exists) {
      // Location exists, add the reviewId to the reviewIds array
      const locationData = locationDoc.data();
      const updatedReviewIds = [...locationData.reviewIds, reviewId];

      await locationRef.update({
        reviewIds: updatedReviewIds,
      });
    } else {
      // Location does not exist, create a new document with the reviewId
      const { lat, lng } = await getLatLngFromAddress(locationId);  // Get lat/lng for the locationId

      await locationRef.set({
        locationId: locationId,
        reviewIds: [reviewId],
        coordinates: {
          lat: lat,
          lng: lng,
        },
      });
    }
  } catch (error) {
    console.error('Error checking or creating location:', error.message);
    throw new Error('Failed to check or create location');
  }
}

// Function to upload the reviews to Firestore
async function uploadReviews(ctx) {
  try {
    const reviewsJson = await loadReviews();
    const batchArray = [];
    let batch = db.batch();
    let operationCounter = 0;

    for (const review of reviewsJson) {
      const reviewRef = db.collection('reviews').doc(review.id);

      // Extract the first 30 characters for duplicate check
      const reviewContentPrefix = review.reviewContent.substring(0, 30);

      // Check for duplicate review based on reviewContentPrefix
      const duplicateCheckQuery = await db.collection('reviews')
        .where('reviewContentPrefix', '==', reviewContentPrefix)
        .get();

      if (!duplicateCheckQuery.empty) {
        console.log(`Duplicate review found with reviewContentPrefix: "${reviewContentPrefix}", skipping this entry.`);
        continue; // Skip this review if a duplicate is found
      }

      // Get latitude and longitude for locationId (address)
      let coordinates = null;
      try {
        coordinates = await getLatLngFromAddress(review.locationId);
      } catch (error) {
        console.warn(`Failed to fetch coordinates for ${review.locationId}:`, error.message);
        continue; // Skip this review if geocoding fails
      }

      // Prepare the review data with coordinates and reviewContentPrefix
      const reviewData = {
        userId: "",
        id: review.id,
        locationId: review.locationId,
        mobility: review.mobility || 0.0,
        vision: review.vision || 0.0,
        sensory: review.sensory || 0.0,
        language: review.language || 0.0,
        reviewContent: review.reviewContent || "",
        reviewContentPrefix: reviewContentPrefix, // Add the prefix field
        qualityReview: review.qualityReview || 0.0,
        overallAccessibleScore: review.overallAccessibleScore || 0.0,
        coordinates: coordinates // Add coordinates to the review
      };

      batch.set(reviewRef, reviewData);

      await checkLocation(review.locationId, review.id);

      operationCounter++;

      // Commit the batch every 500 operations or when the loop ends
      if (operationCounter === 500 || reviewsJson.indexOf(review) === reviewsJson.length - 1) {
        batchArray.push(batch.commit());
        batch = db.batch();
        operationCounter = 0;
      }
    }

    await Promise.all(batchArray);
    ctx.body = { message: 'Reviews uploaded successfully!' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to upload reviews', details: error.message };
    console.error("Error uploading reviews:", error);
  }
}


// Watch for changes to the analyzed_reviews.json file using chokidar
const watcher = chokidar.watch(reviewFilePath, {
  persistent: true,
  usePolling: true, // To force polling in case fs.watch is unreliable
  interval: 1000, // Check every 1 second
  binaryInterval: 2000 // Allow a longer check interval for binary files
});

watcher.on('change', (path) => {
  console.log(`File ${path} has been modified, uploading reviews...`);
  uploadReviews({ body: {} });  // Mocking Koa context for simplicity, replace with actual context in your app
});

module.exports = uploadReviews;
