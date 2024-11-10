// src/Components/AddReviewButton.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
// import { v4 as uuidv4 } from 'uuid';
import AuthModal from './AuthModal';
import ReviewModal from './ReviewModal';

const AddReviewButton = ({ selectedLocation }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // Local state for review modal
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
      setUserId(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  const handleAddReviewClick = () => {
    if (isUserLoggedIn) {
      setIsReviewModalOpen(true); // Open review modal if logged in
    } else {
      setIsAuthModalOpen(true); // Open auth modal if not logged in
    }
  };

  const calculateOverallScore = (ratings) => {
    const { mobility, accessibility, language, sensory, vision } = ratings;
    return ((mobility + accessibility + language + sensory + vision) / 5.0).toFixed(1);
  };

  const handleReviewSubmit = async (reviewData) => {
    const reviewId = uuidv4();
    const overallScore = parseFloat(calculateOverallScore(reviewData.ratings));

    try {
      await addDoc(collection(db, 'reviews'), {
        id: reviewId,
        userId: userId,
        reviewContent: reviewData.review,
        ratings: reviewData.ratings,
        overallScore: overallScore,
        locationId: selectedLocation.locationId,
        coordinates: selectedLocation.coordinates,
      });
      console.log('Review successfully submitted to Firebase!');
    } catch (error) {
      console.error('Error adding review to Firestore:', error);
    }
    setIsReviewModalOpen(false); // Close the review modal after submission
  };

  return (
    <>
      <button className="add-review-button" onClick={handleAddReviewClick}>
        Add Review
      </button>

      {/* Auth modal for login if user is not authenticated */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Review modal only opens if user is authenticated */}
      {isUserLoggedIn && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)} // Local state to close only the review modal
          onSubmit={handleReviewSubmit}
          selectedLocation={selectedLocation}
        />
      )}
    </>
  );
};

export default AddReviewButton;
