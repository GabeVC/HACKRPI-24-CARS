import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import your Firebase configuration
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

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

function ClickableMap({ onMapClick, setZoomLevel }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      fetchAddress(lat, lng, onMapClick);
    },
    zoomend(e) {
      setZoomLevel(e.target.getZoom()); // Update zoom level on zoom end
    }
  });

  return null;
}

// Helper function to fetch address using Google Maps Geocoder
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
    map.setView(center, zoomLevel); // Set view with current zoom level
  }, [center, zoomLevel]);
  return null;
}

function HeatMap({ center, data, onMapClick }) {
  const [zoomLevel, setZoomLevel] = useState(13);
  const [markerPosition, setMarkerPosition] = useState(null); // State for marker position
  const [markerAddress, setMarkerAddress] = useState(''); // State for marker address
  const [firebaseMarkers, setFirebaseMarkers] = useState([]); // State for markers from Firebase

  // Fetch locations from Firebase on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      const locationsCollection = collection(db, "locations");
      const snapshot = await getDocs(locationsCollection);
      const locations = snapshot.docs.map(doc => doc.data());
      setFirebaseMarkers(locations); // Set the markers from Firebase
    };

    fetchLocations();
  }, []);

  // Update marker position and address on map click
  const handleMapClick = ({ lat, lng, address }) => {
    setMarkerPosition([lat, lng]);
    setMarkerAddress(address);
    onMapClick({ lat, lng, address });
  };

  return (
    <MapContainer center={center} zoom={zoomLevel} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <HeatLayer data={data} />
      <RecenterMap center={center} zoomLevel={zoomLevel} />
      <ClickableMap onMapClick={handleMapClick} setZoomLevel={setZoomLevel} />
      
      {/* Render markers from Firebase */}
      {firebaseMarkers.map((marker, index) => (
        marker.coordinates && marker.coordinates.lat !== undefined && marker.coordinates.lng !== undefined ? (
          <Marker 
            key={index} 
            position={[marker.coordinates.lat, marker.coordinates.lng]} // Use coordinates field for lat and lng
          >
            <Popup>
              <strong>{marker.locationId || "No address provided"}</strong> <br />
              Latitude: {marker.coordinates.lat}, Longitude: {marker.coordinates.lng}
            </Popup>
          </Marker>
        ) : null
      ))}

      {/* Marker Component - only render if markerPosition is set */}
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            <strong>{markerAddress}</strong> <br />
            Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default HeatMap;
