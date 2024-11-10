import React from 'react';

function ReviewList({ reviews }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '½' : '';
    return '★'.repeat(fullStars) + halfStar + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderTop: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
      {reviews.map((review, index) => (
        <div key={index} style={{ marginBottom: '15px' }}>
          <strong>{review.username}</strong><br />
          Overall Location Rating: {renderStars(review.locationRating)}<br />
          {review.text}<br />
          Accessibility Rating: {renderStars(review.accessibilityRating)}<br />
          Mobility Rating: {renderStars(review.mobilityRating)}<br />
          Vision Rating: {renderStars(review.visionRating)}<br />
          Sensory Rating: {renderStars(review.sensoryRating)}<br />
          Language Rating: {renderStars(review.languageRating)}<br />
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
