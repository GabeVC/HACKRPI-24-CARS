import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';




const firebaseConfig = {
  apiKey: "AIzaSyBOl6lqILDvoeHjmSd3XRlwsM4M0py5TBs",
  authDomain: "cars-9ac6c.firebaseapp.com",
  projectId: "cars-9ac6c",
  storageBucket: "cars-9ac6c.firebasestorage.app",
  messagingSenderId: "513353172440",
  appId: "1:513353172440:web:e412a98ca1e967b9a11ead",
  measurementId: "G-5Z26ZMPQ53"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const db = getFirestore(app);