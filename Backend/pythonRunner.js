const { PythonShell } = require("python-shell");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore();

async function reviewRetriever(address) {
  try {
    // 1. Search Firestore for the location with the given address
    const locationSnapshot = await db
      .collection("locations")
      .where("address", "===", address)
      .get();

    if (locationSnapshot.empty) {
      console.log("No matching location found for the provided address.");
      return;
    }

    // 2. Get review IDs from the matching location
    const locationData = locationSnapshot.docs[0].data();
    const reviewIds = locationData.reviewIds;

    if (!reviewIds || reviewIds.length === 0) {
      console.log("No reviews found for this location.");
      return;
    }

    // 3. Retrieve each review by ID
    const reviews = [];
    for (const reviewId of reviewIds) {
      const reviewSnapshot = await db.collection("reviews").doc(reviewId).get();
      if (reviewSnapshot.exists) {
        reviews.push(reviewSnapshot.data());
      }
    }

    callPythonScript(reviews);

  } catch (error) {
    console.error("Error retrieving reviews:", error);
  }
}

function callPythonScript(reviews) {
  const options = {
    mode: "json", // We’ll pass and receive JSON
    pythonOptions: ["-u"], // Unbuffered output for real-time interaction
    scriptPath: "path/to/your_script_folder", // Path to your Python script
    args: [JSON.stringify(reviews)], // Pass reviews as JSON string
  };

  PythonShell.run("your_script.py", options, (err, results) => {
    if (err) {
      console.error("Error in Python script:", err);
      return;
    }

    console.log("Python script output:", results);
  });
}

module.exports = { reviewRetriever };
