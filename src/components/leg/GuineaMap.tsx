import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Club } from '../../data/legData';

interface GuineaMapProps {
  clubs: Club[];
  onClubClick: (club: Club) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

// Centre de la Guinée
const center = {
  lat: 10.5,
  lng: -11.5
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a1a' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8ec3b9' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1a1a1a' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#10b981' }, { lightness: -50 }]
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#2c2c2c' }]
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#3a3a3a' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f172a' }]
    }
  ]
};

export default function GuineaMap({ clubs, onClubClick }: GuineaMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<Club | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Clé API Google Maps - L'utilisateur doit créer sa propre clé
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBpGuAdDlxGc8rkGmpLi2gR5jrMy5c3gLs';

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={7}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {clubs.map((club) => (
            <Marker
              key={club.id}
              position={{
                lat: club.coordinates[0],
                lng: club.coordinates[1]
              }}
              onClick={() => {
                setSelectedMarker(club);
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: club.color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 12,
              }}
              animation={google.maps.Animation.DROP}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{
                lat: selectedMarker.coordinates[0],
                lng: selectedMarker.coordinates[1]
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="bg-gray-900 p-4 rounded-lg min-w-[250px]">
                <h3
                  className="text-xl font-black mb-2"
                  style={{ color: selectedMarker.color }}
                >
                  {selectedMarker.name}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {selectedMarker.city}, {selectedMarker.region}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-yellow-400 font-bold">{selectedMarker.stats.trophies}</p>
                    <p className="text-xs text-gray-400">Trophées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-bold">{selectedMarker.stats.winRate}%</p>
                    <p className="text-xs text-gray-400">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-400 font-bold">#{selectedMarker.stats.rank}</p>
                    <p className="text-xs text-gray-400">Rang</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClubClick(selectedMarker);
                    setSelectedMarker(null);
                  }}
                  className="w-full py-2 rounded-lg font-bold text-white text-sm transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${selectedMarker.color}, ${selectedMarker.color}cc)`
                  }}
                >
                  Voir le Profil Complet
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-green-500"
      >
        <p className="text-sm text-gray-300 mb-3 font-bold">
          🗺️ Cliquez sur un marqueur pour explorer le club
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {clubs.map(club => (
            <div
              key={club.id}
              className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onClubClick(club)}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: club.color }}
              ></div>
              <span className="text-xs text-gray-400 truncate">{club.city}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
