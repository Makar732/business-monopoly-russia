// frontend/src/components/MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchCities } from '../api';

// Фикс иконок Leaflet в webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Кастомная иконка города
function createCityIcon(name) {
  return L.divIcon({
    className: 'city-marker',
    html: `<div class="city-marker-inner">🏙</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
}

export default function MapView({ onCityClick }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchCities().then(setCities).catch(console.error);
  }, []);

  // Центр карты — примерно центр европейской России
  const center = [56.0, 40.0];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* ============================
            Тайлы карты — OpenStreetMap (бесплатно!)
            ============================ */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ============================
            Маркеры городов
            ============================ */}
        {cities.map(city => (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={createCityIcon(city.name)}
            eventHandlers={{
              click: () => onCityClick(city.id)
            }}
          >
            <Popup>
              <div className="city-popup">
                <strong>🏙 {city.name}</strong>
                <p>{city.description}</p>
                <button
                  className="btn btn-small"
                  onClick={() => onCityClick(city.id)}
                >
                  Открыть город
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
