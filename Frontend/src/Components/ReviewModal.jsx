// src/Components/ReviewModal.jsx
import React, { useState } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, selectedLocation, onSubmit }) => {
  const [review, setReview] = useState('');
  const [accessibility, setAccessibility] = useState(0);
  const [vision, setVision] = useState(0);
  const [language, setLanguage] = useState(0);
  const [mobility, setMobility] = useState(0);
  const [sensory, setSensory] = useState(0);

  const handleSubmit = () => {
    onSubmit({
      review,
      ratings: {
        accessibility,
        vision,
        language,
        mobility,
        sensory,
      },
    });
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null; // Only render the modal if it is open

  return (
    <div className="review-modal">
      <div className="review-modal-content">
        <button className="close-button" onClick={onClose}>×</button> {/* Close the review modal */}
        <h2>Submit Your Review</h2>
        <textarea
          placeholder="Write your review here..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        
        <div className="slider-group">
          <label>Accessibility: {accessibility}</label>
          <input type="range" min="0" max="5" value={accessibility} onChange={(e) => setAccessibility(parseInt(e.target.value))} />
          
          <label>Vision: {vision}</label>
          <input type="range" min="0" max="5" value={vision} onChange={(e) => setVision(parseInt(e.target.value))} />
          
          <label>Language: {language}</label>
          <input type="range" min="0" max="5" value={language} onChange={(e) => setLanguage(parseInt(e.target.value))} />
          
          <label>Mobility: {mobility}</label>
          <input type="range" min="0" max="5" value={mobility} onChange={(e) => setMobility(parseInt(e.target.value))} />
          
          <label>Sensory: {sensory}</label>
          <input type="range" min="0" max="5" value={sensory} onChange={(e) => setSensory(parseInt(e.target.value))} />
        </div>

        <h3>Location Information</h3>
        <p><strong>Address:</strong> {selectedLocation?.locationId}</p>
        <p><strong>Latitude:</strong> {selectedLocation?.coordinates?.lat}</p>
        <p><strong>Longitude:</strong> {selectedLocation?.coordinates?.lng}</p>

        <button onClick={handleSubmit}>Submit Review</button>
      </div>
    </div>
  );
};

export default ReviewModal;
