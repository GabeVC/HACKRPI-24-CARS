// firebase.js
const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./cars-9ac6c-firebase-adminsdk-2jsfm-f955074d21.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const db = firebaseAdmin.firestore();

module.exports = { db };
