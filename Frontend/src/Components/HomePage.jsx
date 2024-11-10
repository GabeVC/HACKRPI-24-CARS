import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import HeatMap from './Heatmap';
import './HomePage.css';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [locationName, setLocationName] = useState('');
  const [data, setData] = useState([]);
  const [mode, setMode] = useState('Specific'); // Start in "Specific" mode
  const [radius, setRadius] = useState(4828); // Default radius for "General" mode circle in meters (3 miles)
  const autocompleteRef = useRef(null);
  const mapContainerRef = useRef(null);
  const reviewsContainerRef = useRef(null);
  const navigate = useNavigate();

  const fetchFilteredReviews = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/reviews-within-area', {
        center: { lat: center[0], lng: center[1] },
        radius: radius / 1609.34, // Convert radius from meters to miles
      });
      setData(response.data.reviews); // Update `data` with filtered reviews
    } catch (error) {
      console.error("Error fetching filtered reviews:", error);
    }
  };

  useEffect(() => {
    const loadAutocomplete = () => {
      if (window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          { types: ['geocode'] }
        );

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCenter([lat, lng]);
            setLocationName(place.formatted_address);
            setMode("Specific");

            const mapContainerTop = mapContainerRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: mapContainerTop - 100, behavior: 'smooth' });
          }
        });
      }
    };

    loadAutocomplete();
    fetchFilteredReviews();
  }, []);

  useEffect(() => {
    fetchFilteredReviews();
  }, [center, radius]);

  const handleSeeReviews = () => {
    if (locationName) {
      const reviewsContainerTop = reviewsContainerRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: reviewsContainerTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <header className="header">
        <h1 className="title">City Accessibility Rating System (CARS)</h1>
        <nav className="auth-links">
          {user ? (
            <>
              <button className="button profile-button" onClick={() => navigate('/profile')}>
                Profile
              </button>
              <button onClick={logout} className="button logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button login-button">Login</Link>
              <Link to="/register" className="button register-button">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">
        <section className="intro">
          <h2 className="subtitle">Explore Accessibility in Your City</h2>
          <p className="description">
            CARS helps you discover and evaluate the accessibility of locations throughout the city.
          </p>
        </section>

        <section className="search-map-section" ref={mapContainerRef}>
          <div className="location-search">
            <input
              type="text"
              ref={autocompleteRef}
              placeholder="Enter a location"
              className="location-input"
            />
            <button
              className="button see-reviews-button"
              onClick={handleSeeReviews}
              disabled={!locationName}
            >
              See Reviews
            </button>
          </div>
          <h2 className="map-title">City Accessibility Ratings Heat Map</h2>
          <HeatMap center={center} data={data} mode={mode} radius={radius} />
        </section>

        <section className="reviews-section" ref={reviewsContainerRef}>
          <h2>Reviews in this Area</h2>
          <div className="review-cards">
            {data.map((review) => (
              <div key={review.id} className="review-card">
                <h3>Quality Score: {review.qualityReview}</h3>
                <p>{review.reviewContent}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
