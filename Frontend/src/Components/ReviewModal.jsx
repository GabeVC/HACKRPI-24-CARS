// src/Components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, selectedLocation, onSubmit, existingReview }) => {
  const [review, setReview] = useState(existingReview?.reviewContent || '');
  const [accessibility, setAccessibility] = useState(existingReview?.accessibility || 0);
  const [vision, setVision] = useState(existingReview?.vision || 0);
  const [language, setLanguage] = useState(existingReview?.language || 0);
  const [mobility, setMobility] = useState(existingReview?.mobility || 0);
  const [sensory, setSensory] = useState(existingReview?.sensory || 0);

  useEffect(() => {
    if (existingReview) {
      setReview(existingReview.reviewContent);
      setAccessibility(existingReview.accessibility);
      setVision(existingReview.vision);
      setLanguage(existingReview.language);
      setMobility(existingReview.mobility);
      setSensory(existingReview.sensory);
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    const reviewId = existingReview ? existingReview.id : uuidv4();

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          latlng: `${selectedLocation?.coordinates?.lat},${selectedLocation?.coordinates?.lng}`,
          key: "AIzaSyDL_OrANFGeuN2P2OWpiqe2-1eZvhxVOAE", // Replace with actual API key
        },
      });

      const address = response.data.results[0]?.formatted_address || "Unknown location";
      const reviewData = {
        userId: "",
        id: reviewId,
        locationId: address,
        reviewContent: review,
        reviewContentPrefix: review.slice(0, 30),
        mobility,
        accessibility,
        vision,
        sensory,
        language,
        qualityReview: (accessibility + vision + language + mobility + sensory) / 5,
        overallScore: (accessibility + vision + language + mobility + sensory) / 5,
        coordinates: selectedLocation?.coordinates || { lat: 0, lng: 0 },
      };

      const locationRef = doc(db, 'locations', address);
      const locationDoc = await getDoc(locationRef);

      if (locationDoc.exists()) {
        const locationData = locationDoc.data();
        if (!locationData.reviewIds.includes(reviewId)) {
          const updatedReviewIds = [...locationData.reviewIds, reviewId];
          await updateDoc(locationRef, { reviewIds: updatedReviewIds });
        }
      } else {
        await setDoc(locationRef, {
          locationId: address,
          reviewIds: [reviewId],
          coordinates: selectedLocation?.coordinates,
        });
      }

      await setDoc(doc(db, "reviews", reviewId), reviewData);
      onSubmit(reviewData);
      onClose();
    } catch (error) {
      console.error("Error adding review to Firebase: ", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="review-modal-overlay" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}
    >
      <div 
        className="review-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          position: 'relative',
          padding: '20px',
          background: 'white',
          margin: 'auto',
          borderRadius: '8px',
          maxWidth: '500px',
          zIndex: 1000
        }}
      >
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{existingReview ? 'Edit Your Review' : 'Submit Your Review'}</h2>
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

        <button onClick={handleSubmit}>{existingReview ? 'Update Review' : 'Submit Review'}</button>
      </div>
    </div>
  );
};

export default ReviewModal;
