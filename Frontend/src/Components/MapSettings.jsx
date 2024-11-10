import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const MapSettings = () => {
  const [markerSize, setMarkerSize] = useState(30); // Default size

  const handleSizeChange = (event) => {
    setMarkerSize(event.target.value);
  };

  return (
    <div>
      <div>
        <label>Marker Size: </label>
        <input
          type="range"
          min="10"
          max="50"
          value={markerSize}
          onChange={handleSizeChange}
        />
        <span>{markerSize}px</span>
      </div>

      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <Marker
          position={[51.505, -0.09]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="width: ${markerSize}px; height: ${markerSize}px; background-color: red; border-radius: 50%;"></div>`,
          })}
        >
          <Popup>Marker size: {markerSize}px</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapSettings;
