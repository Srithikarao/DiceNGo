import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Heart, CheckCircle2, Clock, ExternalLink, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface PlaceDetailModalProps {
  id: number | null;
  type: 'food' | 'explore' | 'event' | null;
  onClose: () => void;
  onSaveFavorite: (id: number, type: 'food' | 'explore' | 'event') => void;
  onConfirmVisit: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  id,
  type,
  onClose,
  onSaveFavorite,
  onConfirmVisit
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    if (!id || !type) {
      setData(null);
      return;
    }

    setLoading(true);
    setVisited(false);

    let fetcher;
    if (type === 'food') fetcher = api.getFoodDetail(id);
    else if (type === 'explore') fetcher = api.getExploreDetail(id);
    else fetcher = api.getEvents().then(res => res.items.find((ev: any) => ev.id === id));

    fetcher
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, type]);

  if (!id || !type) return null;

  const handleVisit = () => {
    sound.playStamp();
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#F2E829', '#F2B949', '#F27430', '#EDD377']
    });
    setVisited(true);
    onConfirmVisit(id, type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-10 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-[#EDD377]">
            Loading details... 🧭
          </div>
        )}

        {!loading && data && (
          <div>
            {/* Header Image */}
            <div className="w-full h-44 rounded-xl border-2 border-black overflow-hidden mb-3 relative bg-gray-900">
              <img
                src={data.images || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"}
                alt={data.name || data.event_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#18130d]/90 text-[#F2E829] font-mono text-[10px] rounded border border-black font-bold">
                {data.category}
              </div>
            </div>

            {/* Place Title */}
            <h2 className="font-heading font-extrabold text-xl text-white">
              {data.name || data.event_name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-gray-300 font-mono mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[#F2B949]">
                <MapPin size={13} /> {data.area || "Warangal"}
              </span>
              {data.rating && <span className="text-[#F2E829] font-bold">• ★ {data.rating}</span>}
              {data.price_range && <span className="text-[#EDD377]">• {data.price_range}</span>}
              {data.entry_fee && <span className="text-[#EDD377]">• {data.entry_fee}</span>}
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {data.veg && (
                <span className="text-[10px] px-2 py-0.5 bg-[#EDD377]/20 text-[#EDD377] border border-[#EDD377]/50 rounded font-mono font-bold">
                  🌱 Veg Available
                </span>
              )}
              {data.non_veg && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F27430]/20 text-[#F27430] border border-[#F27430]/50 rounded font-mono font-bold">
                  🍗 Non-Veg
                </span>
              )}
              {data.parking && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F2B949]/20 text-[#F2B949] border border-[#F2B949]/50 rounded font-mono">
                  🅿️ Parking
                </span>
              )}
              {data.best_time && (
                <span className="text-[10px] px-2 py-0.5 bg-[#18130d] text-gray-300 border border-black rounded font-mono">
                  🕒 {data.best_time}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 font-heading leading-relaxed mb-3">
              {data.description || "A top-rated spot to experience the authentic vibe of Warangal, Hanamkonda & Kazipet."}
            </p>

            {/* Must Try or Highlights */}
            {data.best_known_for && (
              <div className="mb-3 p-2.5 bg-[#F2B949]/15 rounded-xl border border-[#F2B949]/40 text-xs font-heading">
                <span className="text-[#F2B949] font-extrabold">Must Try: </span>
                <span className="text-white font-medium">{data.best_known_for}</span>
              </div>
            )}

            {/* Timings & Address */}
            <div className="space-y-1.5 p-2.5 bg-[#18130d] rounded-xl border-2 border-black text-xs font-mono text-gray-300 mb-4">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#F2E829]" />
                <span>{data.opening_time || "10:00 AM"} - {data.closing_time || "11:00 PM"}</span>
              </div>
              <div className="text-[11px] text-gray-400 pl-4">
                {data.address || "Warangal Tri-City, Telangana"}
              </div>
            </div>

            {/* Action Buttons in Mango Popsicle Palette */}
            <div className="space-y-2">
              <a
                href={data.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((data.name || data.event_name) + " Warangal")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#F2E829] hover:bg-[#F2B949] text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation size={16} /> Open in Google Maps 📍
              </a>

              <button
                onClick={handleVisit}
                className={`w-full py-2.5 font-heading font-extrabold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors ${
                  visited
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#EDD377] hover:bg-[#F2B949] text-black'
                }`}
              >
                <CheckCircle2 size={15} />
                {visited ? "Logged in Adventure Diary!" : "Mark Visited & Add XP"}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onSaveFavorite(id, type);
                  onClose();
                }}
                className="w-full py-2 bg-[#18130d] hover:bg-[#302419] text-[#F27430] font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <Heart size={14} /> Save to Scrapbook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
