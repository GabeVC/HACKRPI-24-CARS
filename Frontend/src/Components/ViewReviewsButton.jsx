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
      
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reviews</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <p>Average Overall Rating: {renderShadedStars(avgOverallRating)}</p>
              <p>Average Accessibility Rating: {renderShadedStars(avgAccessibilityRating)}</p>
            </div>

            {reviews.length > 0 ? (
              <ul>
                {reviews.map((review, index) => (
                  <li key={index}>{review.text}</li>
                ))}
              </ul>
            ) : (
              <p>No reviews available.</p>
            )}

            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewReviewsButton;
