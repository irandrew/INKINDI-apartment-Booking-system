import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Apartment } from '../types';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FavoriteButton } from './FavoriteButton';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  apartments: Apartment[];
  height?: string;
  zoom?: number;
}

export default function MapComponent({ apartments, height = '600px', zoom = 13 }: MapComponentProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Average position of apartments or default to center of Kigali
  const center: [number, number] = apartments.length > 0 && apartments[0].lat && apartments[0].lng
    ? [apartments[0].lat, apartments[0].lng]
    : [-1.9441, 30.0619];

  return (
    <div style={{ height }} className={`w-full overflow-hidden rounded-[3rem] shadow-premium ${isDark ? 'ring-1 ring-white/10' : ''}`}>
      <MapContainer 
        key={theme}
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        {apartments.map((apt) => (
          apt.lat && apt.lng && (
            <Marker key={apt.id} position={[apt.lat, apt.lng]}>
              <Popup className="premium-popup">
                <div className="p-1 min-w-[180px]">
                  <div className="relative">
                    <img 
                      src={apt.images[0]} 
                      alt={apt.name} 
                      className="mb-3 h-28 w-full rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 z-10 scale-75 origin-top-left">
                      <FavoriteButton apartmentId={apt.id} />
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{apt.name}</h3>
                    <p className={`text-[10px] mb-3 italic font-serif ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{apt.location}</p>
                    <div className="flex items-center justify-between gap-4 mb-2">
                       <span className="text-xs font-black text-gold-600">${apt.pricePerNight}</span>
                       <Link 
                        to={`/apartments/${apt.id}`}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white hover:text-gold-500' : 'text-neutral-900 hover:text-gold-600'}`}
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
