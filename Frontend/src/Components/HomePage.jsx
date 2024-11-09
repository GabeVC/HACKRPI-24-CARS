import React, { useState, useEffect, useRef } from 'react';
import HeatMap from './Heatmap';

const HomePage = () => {
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default center (e.g., NYC)
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadAutocomplete = () => {
      if (window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          { types: ['geocode'] } // Specify address type suggestions
        );

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCenter([lat, lng]); // Update the map center with the selected location
          }
        });
      }
    };

    loadAutocomplete();
  }, []);

  return (
    <div className="landing-page">
      <header>
        <h1>CARS</h1>
      </header>
      <main>
        CAR LOGGED IN HOMEPAGE
      </main>
      <h1>City Accessibility Ratings Heat Map</h1>

      <div className="location-search">
        <input
          type="text"
          ref={autocompleteRef}
          placeholder="Enter a location"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
      </div>

      <HeatMap center={center} />
    </div>
  );
};

export default HomePage;
