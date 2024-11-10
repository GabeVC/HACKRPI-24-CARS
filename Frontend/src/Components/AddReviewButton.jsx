// src/Components/AddReviewButton.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import AuthModal from './AuthModal';
import ReviewModal from './ReviewModal';

const AddReviewButton = ({ selectedLocation }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [buttonText, setButtonText] = useState("Add Review");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsUserLoggedIn(!!user);
      setUserId(user ? user.uid : null);

      if (user) {
        await loadExistingReview(user.uid);
      }
    });
    return unsubscribe;
  }, [selectedLocation]);

  const loadExistingReview = async (userId) => {
    try {
      const reviewRef = doc(db, 'reviews', `${selectedLocation.locationId}-${userId}`);
      const reviewDoc = await getDoc(reviewRef);

      if (reviewDoc.exists()) {
        setExistingReview(reviewDoc.data());
        setButtonText("Edit Review");
      } else {
        setExistingReview(null);
        setButtonText("Add Review");
      }
    } catch (error) {
      console.error("Error loading existing review:", error);
    }
  };

  const handleAddReviewClick = () => {
    if (isUserLoggedIn) {
      setIsReviewModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const calculateOverallScore = (ratings = {}) => {
    const { mobility = 0, accessibility = 0, language = 0, sensory = 0, vision = 0 } = ratings;
    return ((mobility + accessibility + language + sensory + vision) / 5.0).toFixed(1);
  };

  const handleReviewSubmit = async (reviewData) => {
    const reviewId = `${selectedLocation.locationId}-${userId}`;
    const overallScore = parseFloat(calculateOverallScore(reviewData.ratings));
  
    try {
      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        userId: userId || "",  // Fallback to empty string if userId is undefined
        reviewContent: reviewData.review || "",  // Ensure reviewContent is not undefined
        accessibility: reviewData.accessibility || 0,
        vision: reviewData.vision || 0,
        language: reviewData.language || 0,
        mobility: reviewData.mobility || 0,
        sensory: reviewData.sensory || 0,
        overallScore: overallScore || 0,  // Fallback to 0 if overallScore is undefined
        locationId: selectedLocation.locationId || "Unknown Location",
        coordinates: selectedLocation.coordinates || { lat: 0, lng: 0 },  // Fallback coordinates if missing
      });
      console.log('Review successfully submitted to Firebase!');
      setExistingReview(reviewData);
      setButtonText("Edit Review");
    } catch (error) {
      console.error('Error adding review to Firestore:', error);
    }
    setIsReviewModalOpen(false);
  };

  return (
    <>
      <button className="add-review-button" onClick={handleAddReviewClick}>
        {buttonText}
      </button>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {isUserLoggedIn && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          selectedLocation={selectedLocation}
          existingReview={existingReview}
        />
      )}
    </>
  );
};

export default AddReviewButton;
