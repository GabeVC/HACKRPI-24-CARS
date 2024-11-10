const { db } = require('./firebase');

// Helper function to convert miles to degrees of latitude/longitude
function milesToDegrees(miles) {
  const latitudeDegrees = miles / 69.0; // approx. 1 degree latitude = 69 miles
  const longitudeDegrees = miles / 69.172; // approx. 1 degree longitude varies slightly based on latitude
  return { latitudeDegrees, longitudeDegrees };
}

// Main function to get reviews within a bounding box
async function getReviewsWithinArea(center, radius) {
  const { latitudeDegrees, longitudeDegrees } = milesToDegrees(radius);

  // Define the bounding box
  const minLat = center.lat - latitudeDegrees;
  const maxLat = center.lat + latitudeDegrees;
  const minLng = center.lng - longitudeDegrees;
  const maxLng = center.lng + longitudeDegrees;

  try {
    // Query Firestore for reviews within the bounding box using coordinates.lat and coordinates.lng
    const reviewsRef = db.collection('reviews');
    const querySnapshot = await reviewsRef
      .where("coordinates.lat", ">=", minLat)
      .where("coordinates.lat", "<=", maxLat)
      .where("coordinates.lng", ">=", minLng)
      .where("coordinates.lng", "<=", maxLng)
      .get();

    // Map query results to an array of review objects
    const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return reviews;

  } catch (error) {
    console.error("Error fetching reviews within area:", error);
    throw new Error("Failed to fetch reviews within area");
  }
}

module.exports = getReviewsWithinArea;
