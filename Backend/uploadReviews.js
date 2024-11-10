const { db } = require('./firebase'); // Import db from firebase.js
const fs = require('fs').promises;
const path = require('path');

// Read reviews from the external JSON file
async function loadReviews() {
  try {
    const filePath = path.join(__dirname, 'analyzed_reviews.json'); // Adjust the file path if needed
    const data = await fs.readFile(filePath, 'utf-8');
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

// Define the route to upload reviews
async function uploadReviews(ctx) {
  try {
    const reviewsJson = await loadReviews();
    const batchArray = [];
    let batch = db.batch();
    let operationCounter = 0;

    reviewsJson.forEach((review, index) => {
      const reviewRef = db.collection("reviews").doc(review.id);

      // Adjusted fields based on new JSON format
      batch.set(reviewRef, {
        id: review.id,
        locationId: review.locationId,  // Use the new locationId field
        mobility: review.mobility || 0.0,
        accessibility: review.accessibility || 0.0,
        vision: review.vision || 0.0,
        sensory: review.sensory || 0.0,
        language: review.language || 0.0,
        reviewContent: review.reviewContent || "",  // Use the new reviewContent field
        qualityReview: review.qualityReview || 0.0,
        overallScore: review.overallScore || 0.0,  // Corrected to use overallScore field
      });

      operationCounter++;

      // Commit the batch every 500 operations or when the loop ends
      if (operationCounter === 500 || index === reviewsJson.length - 1) {
        batchArray.push(batch.commit());
        batch = db.batch();
        operationCounter = 0;
      }
    });

    await Promise.all(batchArray);
    ctx.body = { message: 'Reviews uploaded successfully!' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to upload reviews', details: error.message };
    console.error("Error uploading reviews:", error);
  }
}

module.exports = uploadReviews;
