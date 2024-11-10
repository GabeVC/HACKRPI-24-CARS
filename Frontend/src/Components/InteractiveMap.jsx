import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const InteractiveMap = () => {
  const [mode, setMode] = useState('view'); // "view" or "add"
  const [markers, setMarkers] = useState([]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'view' ? 'add' : 'view'));
  };

  // Handle map click event to add markers when in 'add' mode
  const mapEvents = useMapEvents({
    click: (event) => {
      if (mode === 'add') {
        const newMarker = {
          id: new Date().getTime(), // Unique ID for the marker
          position: event.latlng,
        };
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      }
    },
  });

  return (
    <div>
      <button onClick={toggleMode}>
        Switch to {mode === 'view' ? 'Add Pin' : 'View'} Mode
      </button>

      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Displaying all markers on the map */}
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>New marker at {marker.position.lat}, {marker.position.lng}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
