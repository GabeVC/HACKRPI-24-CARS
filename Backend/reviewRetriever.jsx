const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { PythonShell } = require("python-shell");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore();

async function populateReviewsFromPython() {
  try {
    const reviews = await callPythonScript();
    if (reviews && Array.isArray(reviews)) {
      await saveReviewsToFirestore(reviews);
      console.log("Reviews successfully saved to Firestore.");
    } else {
      console.log("No reviews received from Python script.");
    }
  } catch (error) {
    console.error("Error populating reviews:", error);
  }
}

function callPythonScript() {
  return new Promise((resolve, reject) => {
    const options = {
      mode: "json",
      pythonOptions: ["-u"],
      scriptPath: "path/to/your_script_folder",
    };

    PythonShell.run("your_script.py", options, (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results && results.length > 0) {
        resolve(results[0]);
      } else {
        resolve([]);
      }
    });
  });
}

async function saveReviewsToFirestore(reviews) {
  const batch = db.batch();

  reviews.forEach((review) => {
    const reviewRef = db.collection("reviews").doc(review.id);
    batch.set(reviewRef, {
      id: review.id,
      locationId: review.locationId,
      mobility: review.mobility || 0.0,
      accessibility: review.accessibility || 0.0,
      vision: review.vision || 0.0,
      sensory: review.sensory || 0.0,
      language: review.language || 0.0,
      reviewContent: review.reviewContent || "",
      qualityReview: review.qualityReview || 0.0,
      overallScore: review.overallScore || 0.0,
    });
  });

  await batch.commit();
}

// Call the function to populate reviews
populateReviewsFromPython();
