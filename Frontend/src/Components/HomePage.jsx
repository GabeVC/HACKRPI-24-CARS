import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import HeatMap from './Heatmap';
import './HomePage.css';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [locationName, setLocationName] = useState('');
  const [data, setData] = useState([]);
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Maps autocomplete and handle potential errors
    const loadAutocomplete = () => {
      if (window.google) {
        try {
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
            } else {
              console.error("No geometry data available for the selected place.");
            }
          });
        } catch (error) {
          console.error("Error initializing Google Maps Autocomplete:", error);
        }
      } else {
        console.error("Google Maps API is not available.");
      }
    };

    loadAutocomplete();

    // Fetch data with error handling
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ratings');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching ratings data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSeeReviews = () => {
    if (locationName) {
      navigate(`/reviews/${encodeURIComponent(locationName)}`);
    }
  };

  const handleMapClick = ({ lat, lng, address }) => {
    console.log(`Clicked location: ${address} (Latitude: ${lat}, Longitude: ${lng})`);
    setCenter([lat, lng]);
  };

  return (
    <div className="landing-page">
      <header className="header">
        <h1 className="title">City Accessibility Rating System (CARS)</h1>
        {!user ? (
          <nav className="auth-links">
            <Link to="/login" className="button login-button">Login</Link>
            <Link to="/register" className="button register-button">Register</Link>
          </nav>
        ) : (
          <button onClick={logout} className="button logout-button">Logout</button>
        )}
      </header>

      <main className="main-content">
        <section className="intro">
          <h2 className="subtitle">Explore Accessibility in Your City</h2>
          <p className="description">
            CARS helps you discover and evaluate the accessibility of locations throughout the city.
          </p>
        </section>

        <section className="search-map-section">
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
              style={{
                backgroundColor: locationName ? '#4CAF50' : '#ddd',
                cursor: locationName ? 'pointer' : 'not-allowed',
                color: locationName ? 'white' : '#888',
              }}
            >
              See Reviews
            </button>
          </div>
          <h2 className="map-title">City Accessibility Ratings Heat Map</h2>
          <HeatMap center={center} data={data} onMapClick={handleMapClick} />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
