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
  const mapContainerRef = useRef(null); // Reference to the map container
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Maps autocomplete
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
            setCenter([lat, lng]); // Update center with selected location
            setLocationName(place.formatted_address);
            
            // Scroll to the map section to center it in the viewport
            mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    };

    loadAutocomplete();

    // Fetch data for the heatmap (dummy data for demonstration)
    fetch('/api/ratings')
      .then((res) => res.json())
      .then((data) => setData(data));
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
          <HeatMap center={center} data={data} onMapClick={handleMapClick} />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
