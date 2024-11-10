import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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

function ClickableMap({ onMapClick, setZoomLevel, mode }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng, mode });
    },
    zoomend(e) {
      setZoomLevel(e.target.getZoom());
    }
  });

  return null;
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
  const [firebaseMarkers, setFirebaseMarkers] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [circlePosition, setCirclePosition] = useState(center);

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

  const handleMapClick = ({ lat, lng, mode }) => {
    if (mode === "Specific") {
      setMarkerPosition([lat, lng]);
    } else if (mode === "General") {
      setCirclePosition([lat, lng]);
    }
  };

  return (
    <MapContainer center={center} zoom={zoomLevel} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

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
              Latitude: {marker.coordinates.lat}, Longitude: {marker.coordinates.lng}
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
        <Marker position={markerPosition}>
          <Popup>
            <strong>Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}</strong>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default HeatMap;
