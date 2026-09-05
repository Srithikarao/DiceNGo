import React, { useEffect, useRef, useState } from 'react';
import { X, Navigation, LocateFixed } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  // Quick jump locations in Tri-City
  const JUMP_POINTS = [
    { label: 'Hanamkonda', lat: 18.0073, lng: 79.5668, zoom: 14 },
    { label: 'Warangal Fort', lat: 17.9576, lng: 79.6166, zoom: 15 },
    { label: 'Kazipet', lat: 17.9784, lng: 79.5160, zoom: 14 },
    { label: 'Bhadrakali Lake', lat: 17.9942, lng: 79.5746, zoom: 15 },
  ];

  // Fetch data
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([
      api.getFood({ limit: 60 }),
      api.getExplore({ limit: 40 }),
      api.getEvents()
    ]).then(([foodRes, expRes, evRes]) => {
      setPlaces({
        food: foodRes.items || [],
        explore: expRes.items || [],
        events: evRes.items || []
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [isOpen]);

  // Initialize and resize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.0073, 79.5668], // Hanamkonda center
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Force resize calculation after modal animation
    const timer1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 400);

    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      if (!isOpen && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update Pins when data or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const addMarker = (item: any, type: 'food' | 'explore' | 'event', iconEmoji: string, bgHex: string) => {
      if (!item.latitude || !item.longitude) return;

      const customIcon = L.divIcon({
        className: 'custom-mango-pin',
        html: `<div style="background-color: ${bgHex}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #000; box-shadow: 2px 2px 0px #000; font-size: 16px; cursor: pointer; transform: translateZ(0);">${iconEmoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Space Grotesk, sans-serif';
      popupContent.style.color = '#111';
      popupContent.style.minWidth = '170px';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 13px; color: #18130d; margin-bottom: 2px;">${item.name || item.event_name}</div>
        <div style="font-size: 11px; color: #665; margin-bottom: 4px;">${item.category} • ${item.area}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 6px;">
          <span style="color: #F27430; font-weight: bold;">★ ${item.rating || '4.5'}</span>
          <span style="background: #EDD377; color: #18130d; font-weight: bold; padding: 1px 6px; border-radius: 4px; font-size: 10px;">${item.price_range || item.entry_fee || 'Warangal'}</span>
        </div>
        <button id="pin-btn-${type}-${item.id}" style="width: 100%; background: #F2B949; color: #000; border: 2px solid #000; font-weight: 800; font-size: 11px; padding: 6px 8px; border-radius: 6px; cursor: pointer; box-shadow: 2px 2px 0px #000; transition: transform 0.1s;">
          View Details 📍
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`pin-btn-${type}-${item.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            sound.playClick();
            onSelectDetail(item.id, type);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    };

    // Use mango popsicle colors:
    // Food: #F2E829 (Vibrant Yellow)
    // Explore: #F2B949 (Mango Gold)
    // Events: #F27430 (Juicy Orange)
    if (activeFilter === 'All' || activeFilter === 'Food') {
      places.food.forEach(f => addMarker(f, 'food', '🍜', '#F2E829'));
    }
    if (activeFilter === 'All' || activeFilter === 'Explore') {
      places.explore.forEach(e => addMarker(e, 'explore', '🌅', '#F2B949'));
    }
    if (activeFilter === 'All' || activeFilter === 'Events') {
      places.events.forEach(ev => addMarker(ev, 'event', '🎟️', '#F27430'));
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
  }, [places, activeFilter, onSelectDetail]);

  const handleJump = (lat: number, lng: number, zoom: number) => {
    sound.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  };

  const handleRecenter = () => {
    sound.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.0073, 79.5668], 13, { duration: 0.8 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#241b12] w-full max-w-lg rounded-2xl border-3 border-black shadow-retro-xl p-3 sm:p-4 relative flex flex-col h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[#18130d] text-gray-300 hover:text-white p-2 rounded-full z-30 border border-black shadow-retro-sm"
          aria-label="Close Map"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-2 pr-10">
          <div className="text-[10px] font-pixel text-[#F2E829] tracking-widest uppercase flex items-center gap-1.5">
            <span>🥭</span> MANGO POPSICLE EXPLORATION MAP
          </div>
          <h2 className="font-pixel text-xs sm:text-sm text-white mt-0.5 truncate">
            🗺️ WARANGAL • HANAMKONDA • KAZIPET
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 z-10 no-scrollbar">
          {(['All', 'Food', 'Explore', 'Events'] as const).map(flt => (
            <button
              key={flt}
              onClick={() => { sound.playClick(); setActiveFilter(flt); }}
              className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all shadow-retro-sm whitespace-nowrap ${
                activeFilter === flt
                  ? 'bg-[#F2E829] text-black font-extrabold translate-y-[-1px]'
                  : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
              }`}
            >
              {flt === 'All' && `🌐 All (${places.food.length + places.explore.length + places.events.length})`}
              {flt === 'Food' && `🍜 Food (${places.food.length})`}
              {flt === 'Explore' && `🌅 Explore (${places.explore.length})`}
              {flt === 'Events' && `🎟️ Events (${places.events.length})`}
            </button>
          ))}
        </div>

        {/* Quick Jump Area Chips */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-[11px] font-heading z-10 no-scrollbar">
          <span className="text-[#EDD377] text-[10px] font-mono flex items-center gap-0.5 whitespace-nowrap">
            <Navigation size={11} className="text-[#F27430]" /> Jump:
          </span>
          {JUMP_POINTS.map(pt => (
            <button
              key={pt.label}
              onClick={() => handleJump(pt.lat, pt.lng, pt.zoom)}
              className="px-2 py-0.5 bg-[#302419] hover:bg-[#F2B949] hover:text-black text-gray-200 border border-black rounded-md whitespace-nowrap transition-colors"
            >
              {pt.label}
            </button>
          ))}
          <button
            onClick={handleRecenter}
            className="p-1 bg-[#F27430] text-black rounded-md border border-black hover:bg-[#F2B949] ml-auto flex items-center justify-center"
            title="Recenter Map"
          >
            <LocateFixed size={12} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full rounded-xl border-3 border-black overflow-hidden relative shadow-retro-sm bg-[#18130d]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '280px' }} />
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <div className="font-pixel text-xs text-[#F2E829] animate-pulse">
                PINNING WARANGAL GEMS... 🥭
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-heading text-gray-300 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2E829] border border-black inline-block"></span> Food
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2B949] border border-black inline-block"></span> Explore
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F27430] border border-black inline-block"></span> Events
            </span>
          </div>
          <span className="text-[#EDD377] font-mono">Tap any pin for details</span>
        </div>
      </div>
    </div>
  );
};
