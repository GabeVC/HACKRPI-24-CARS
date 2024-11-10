// src/Components/HeatMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import AddReviewButton from './AddReviewButton';
import ViewReviewsButton from './ViewReviewsButton';
import ReviewModal from './ReviewModal'; // Import the ReviewModal component

function HeatLayer({ data }) {
  const map = useMapEvents({});

  useEffect(() => {
    const heatData = data.map(({ lat, lng, rating }) => [lat, lng, rating / 5]);
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      maxZoom: 15,
      gradient: {
        0.2: 'green',
        0.5: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    });
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
}

function ClickableMap({ onMapClick, setZoomLevel, mode }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng, mode });
    },
    zoomend(e) {
      setZoomLevel(e.target.getZoom()); // Update zoom level on zoom end
    }
  });

  return null;
}

function fetchAddress(lat, lng, onMapClick) {
  if (!window.google || !window.google.maps) {
    console.error("Google Maps API is not loaded");
    return;
  }

  const geocoder = new window.google.maps.Geocoder();
  const location = { lat, lng };

  geocoder.geocode({ location }, (results, status) => {
    if (status === "OK" && results[0]) {
      const address = results[0].formatted_address;
      onMapClick({ lat, lng, address });
    } else {
      console.error("Geocoding failed:", status);
      onMapClick({ lat, lng, address: "Address not found" });
    }
  });
}

function RecenterMap({ center, zoomLevel }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoomLevel);
  }, [center, zoomLevel]);
  return null;
}

function HeatMap({ center, data, mode: initialMode = "General", radius: initialRadius = 4828 }) {
  const [zoomLevel, setZoomLevel] = useState(13);
  const [mode, setMode] = useState(initialMode);
  const [radius, setRadius] = useState(initialRadius);
  const [circlePosition, setCirclePosition] = useState(center);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [markerAddress, setMarkerAddress] = useState('');
  const [firebaseMarkers, setFirebaseMarkers] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null); // Store selected location data for the modal

  useEffect(() => {
    const fetchLocations = async () => {
      const locationsCollection = collection(db, "locations");
      const snapshot = await getDocs(locationsCollection);
      const locations = snapshot.docs.map(doc => doc.data());
      setFirebaseMarkers(locations);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (mode === "General") {
      setCirclePosition(center);
    } else if (mode === "Specific") {
      setMarkerPosition(null);
    }
  }, [center, mode]);

  const handleMapClick = ({ lat, lng, address }) => {
    setMarkerPosition([lat, lng]);
    setMarkerAddress(address);
    setSelectedLocation({ locationId: address, coordinates: { lat, lng } });
  };

  const openReviewModal = () => {
    setIsReviewModalOpen(true); // Open the modal when the Add Review button is clicked
  };

  const handleCloseModal = () => {
    setIsReviewModalOpen(false); // Close the modal without changing marker position
  };

  return (
    <MapContainer center={center} zoom={zoomLevel} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <HeatLayer data={data} />
      <ClickableMap onMapClick={handleMapClick} setZoomLevel={setZoomLevel} />

      {firebaseMarkers.map((marker, index) => (

      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '5px', borderRadius: '4px' }}>
        <label>Mode: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="Heatmap">Heatmap</option>
          <option value="Specific">Specific</option>
          <option value="General">General</option>
        </select>
        
        {mode === "General" && (
          <>
            <label style={{ marginLeft: '10px' }}>Radius (miles): </label>
            <input
              type="number"
              value={(radius / 1609.34).toFixed(2)}
              onChange={(e) => setRadius(e.target.value * 1609.34)}
              min="0.1"
              step="0.1"
              style={{ width: '60px' }}
            />
          </>
        )}
      </div>

      <RecenterMap center={center} zoomLevel={zoomLevel} />
      <ClickableMap onMapClick={handleMapClick} setZoomLevel={setZoomLevel} mode={mode} />

      {mode === "Specific" && firebaseMarkers.map((marker, index) => (
        marker.coordinates && marker.coordinates.lat !== undefined && marker.coordinates.lng !== undefined ? (
          <Marker 
            key={index} 
            position={[marker.coordinates.lat, marker.coordinates.lng]}
          >
            <Popup>
              <strong>{marker.locationId || "No address provided"}</strong> <br />
              Latitude: {marker.coordinates.lat}, Longitude: {marker.coordinates.lng} <br />
              <AddReviewButton selectedLocation={{ locationId: marker.locationId, coordinates: marker.coordinates }} openReviewModal={openReviewModal} />
              <ViewReviewsButton fetchReviews={() => Promise.resolve(["Sample review 1", "Sample review 2"])} />
            </Popup>
          </Marker>
        ) : null
      ))}

      {mode === "General" && circlePosition && (
        <Circle 
          center={circlePosition} 
          radius={radius}
          color="blue"
          fillOpacity={0.2}
        />
      )}

      {mode === "Specific" && markerPosition && (
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            <strong>Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}</strong> <br />
            <AddReviewButton
              selectedLocation={selectedLocation}
              openReviewModal={openReviewModal}
            />
            <ViewReviewsButton fetchReviews={() => Promise.resolve(["Sample review 1", "Sample review 2"])} />
          </Popup>
        </Marker>
      )}

      {/* Render the ReviewModal only when isReviewModalOpen is true */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseModal}
          selectedLocation={selectedLocation}
        />
      )}
    </MapContainer>
  );
}

export default HeatMap;
