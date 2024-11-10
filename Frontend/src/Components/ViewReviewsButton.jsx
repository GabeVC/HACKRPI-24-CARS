import React, { useState } from 'react';
import './ViewReviewsButton.css';

function ViewReviewsButton({ fetchReviews }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgAccessibilityRating, setAvgAccessibilityRating] = useState(0);
  const [avgOverallRating, setAvgOverallRating] = useState(0);

  const handleViewReviews = async () => {
    if (fetchReviews) {
      const fetchedReviews = await fetchReviews();
      setReviews(fetchedReviews || []);
      
      if (fetchedReviews && fetchedReviews.length > 0) {
        const totalAccessibility = fetchedReviews.reduce((sum, review) => sum + review.accessibilityRating, 0);
        const totalOverall = fetchedReviews.reduce((sum, review) => sum + review.locationRating, 0);
        console.log("HI");
        
        setAvgAccessibilityRating(totalAccessibility / fetchedReviews.length);
        setAvgOverallRating(totalOverall / fetchedReviews.length);
      } else {
        setAvgAccessibilityRating(0);
        setAvgOverallRating(0);
      }
    }
    setIsModalOpen(true);
  };

  // Function to create shaded star display
  const renderShadedStars = (rating) => (
    <div className="star-rating">
      <div className="filled-stars" style={{ width: `${(rating / 5) * 100}%` }}>
        ★★★★★
      </div>
      ★★★★★
    </div>
  );

  return (
    <>
      <button className="view-reviews-button" onClick={handleViewReviews}>
        View Reviews
      </button>
      
      
    </>
  );
}

export default ViewReviewsButton;
