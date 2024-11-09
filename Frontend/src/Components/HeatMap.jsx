import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

function HeatLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    const heatData = data.map(({ lat, lng, rating }) => [lat, lng, rating / 5]);
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      maxZoom: 15,
      gradient: {
        0.2: 'red',
        0.5: 'orange',
        0.8: 'yellow',
        1.0: 'green'
      }
    });
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
}

function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
      map.setView(position, 13); // Adjust the zoom level if needed
    }, [position]);
    return null;
  }

function HeatMap() {
  const [position, setPosition] = useState([40.7128, -74.0060]); // Default to NYC
  const [data, setData] = useState([]);

  useEffect(() => {
    // Check if the browser supports Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const { latitude, longitude } = location.coords;
          setPosition([latitude, longitude]); // Update map center to user's location
        },
        (error) => {
          console.error("Error fetching location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Load heatmap data here, for example via an API
    fetch('/api/ratings')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '80vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <HeatLayer data={data} />
      <RecenterMap position={position} />
    </MapContainer>
  );
}

export default HeatMap;
