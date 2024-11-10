const { spawn } = require("child_process");

// Function to retrieve reviews and pass them to a Python script
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
    const locationData = locationSnapshot.docs[0].data(); // Assuming one location per address
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

    // 4. Call the Python script with the list of reviews
    callPythonScript(reviews);

  } catch (error) {
    console.error("Error retrieving reviews:", error);
  }
}

// Function to call the Python script with the reviews as argument
function callPythonScript(reviews) {
  const pythonProcess = spawn("python3", ["path/to/your_script.py", JSON.stringify(reviews)]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}`);
  });
}

module.exports = { reviewRetriever };
