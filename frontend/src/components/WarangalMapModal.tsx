import React, { useEffect, useRef, useState } from 'react';
import { X, Layers, Filter } from 'lucide-react';
import L from 'leaflet';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface WarangalMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const WarangalMapModal: React.FC<WarangalMapModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Food' | 'Explore' | 'Events'>('All');
  const [places, setPlaces] = useState<{ food: any[]; explore: any[]; events: any[] }>({ food: [], explore: [], events: [] });

  useEffect(() => {
    if (!isOpen) return;

    // Fetch initial map data
    Promise.all([
      api.getFood({}),
      api.getExplore({}),
      api.getEvents()
    ]).then(([foodRes, expRes, evRes]) => {
      setPlaces({
        food: foodRes.items || [],
        explore: expRes.items || [],
        events: evRes.items || []
      });
    }).catch(console.error);
  }, [isOpen]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.0073, 79.5668], // Hanamkonda center
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update Pins when data or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const addMarker = (item: any, type: 'food' | 'explore' | 'event', iconEmoji: string, bgClass: string) => {
      if (!item.latitude || !item.longitude) return;

      const customIcon = L.divIcon({
        className: 'custom-retro-pin',
        html: `<div style="background-color: ${bgClass}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #000; box-shadow: 2px 2px 0px #000; font-size: 16px;">${iconEmoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Space Grotesk, sans-serif';
      popupContent.style.color = '#111';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 13px;">${item.name || item.event_name}</div>
        <div style="font-size: 11px; color: #555;">${item.category} • ${item.area}</div>
        <div style="font-size: 11px; color: #d97706; font-weight: bold; margin-top: 2px;">★ ${item.rating || '4.5'}</div>
        <button id="pin-btn-${item.id}" style="margin-top: 6px; width: 100%; background: #ffd027; border: 2px solid #000; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 6px; cursor: pointer;">
          View Details 📍
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`pin-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            sound.playClick();
            onSelectDetail(item.id, type);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    };

    if (activeFilter === 'All' || activeFilter === 'Food') {
      places.food.slice(0, 40).forEach(f => addMarker(f, 'food', '🍜', '#ffd027'));
    }
    if (activeFilter === 'All' || activeFilter === 'Explore') {
      places.explore.slice(0, 30).forEach(e => addMarker(e, 'explore', '🌅', '#00f0ff'));
    }
    if (activeFilter === 'All' || activeFilter === 'Events') {
      places.events.forEach(ev => addMarker(ev, 'event', '🎟️', '#ff3366'));
    }
  }, [places, activeFilter, onSelectDetail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="bg-arcade-card w-full max-w-lg rounded-2xl border-3 border-black shadow-retro-xl p-4 relative flex flex-col h-[88vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-20"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-2">
          <div className="text-[10px] font-pixel text-arcade-yellow tracking-widest uppercase">
            TRI-CITY EXPLORATION MAP
          </div>
          <h2 className="font-pixel text-sm sm:text-base text-white">
            🗺️ WARANGAL • HANAMKONDA • KAZIPET
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 z-10">
          {(['All', 'Food', 'Explore', 'Events'] as const).map(flt => (
            <button
              key={flt}
              onClick={() => { sound.playClick(); setActiveFilter(flt); }}
              className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border border-black transition-colors ${
                activeFilter === flt
                  ? 'bg-arcade-yellow text-black'
                  : 'bg-[#12111A] text-gray-300 hover:bg-gray-800'
              }`}
            >
              {flt === 'All' && '🌐 All Pins'}
              {flt === 'Food' && '🍜 Food'}
              {flt === 'Explore' && '🌅 Explore'}
              {flt === 'Events' && '🎟️ Events'}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full rounded-xl border-2 border-black overflow-hidden relative shadow-retro-sm">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
