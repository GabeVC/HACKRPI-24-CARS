// src/Components/ViewReviewsButton.jsx
import React, { useState } from 'react';
import './ViewReviewsButton.css';

function ViewReviewsButton({ fetchReviews }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  const handleViewReviews = async () => {
    if (fetchReviews) {
      const fetchedReviews = await fetchReviews(); // Fetch reviews from parent component or API
      setReviews(fetchedReviews || []);
    }
    setIsModalOpen(true); // Open modal after fetching reviews
  };

  return (
    <>
      <button className="view-reviews-button" onClick={handleViewReviews}>
        View Reviews
      </button>
      
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reviews</h3>
            {reviews.length > 0 ? (
              <ul>
                {reviews.map((review, index) => (
                  <li key={index}>{review}</li>
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
