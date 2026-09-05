import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Heart, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-sm rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[90vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-10 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-black font-bold">
            Loading details... 🧭
          </div>
        )}

        {!loading && data && (
          <div>
            {/* Header Image */}
            <div className="w-full h-44 rounded-xl border-2 border-black overflow-hidden mb-3 relative bg-[#F2B949]">
              <img
                src={data.images || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"}
                alt={data.name || data.event_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#F2E829] text-black font-mono text-[10px] rounded border border-black font-black">
                {data.category}
              </div>
            </div>

            {/* Place Title */}
            <h2 className="font-heading font-black text-xl text-black">
              {data.name || data.event_name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-black font-mono mt-1 flex-wrap font-bold">
              <span className="flex items-center gap-1 text-black">
                <MapPin size={13} /> {data.area || "Warangal"}
              </span>
              {data.rating && <span>• ★ {data.rating}</span>}
              {data.price_range && <span>• {data.price_range}</span>}
              {data.entry_fee && <span>• {data.entry_fee}</span>}
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {data.veg && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F2E829] text-black border border-black rounded font-mono font-black">
                  🌱 Veg Available
                </span>
              )}
              {data.non_veg && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F27430] text-black border border-black rounded font-mono font-black">
                  🍗 Non-Veg
                </span>
              )}
              {data.parking && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F2B949] text-black border border-black rounded font-mono font-bold">
                  🅿️ Parking
                </span>
              )}
              {data.best_time && (
                <span className="text-[10px] px-2 py-0.5 bg-[#EDD377] text-black border border-black rounded font-mono font-medium">
                  🕒 {data.best_time}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-black font-heading leading-relaxed mb-3 font-medium">
              {data.description || "A top-rated spot to experience the authentic vibe of Warangal, Hanamkonda & Kazipet."}
            </p>

            {/* Must Try or Highlights */}
            {data.best_known_for && (
              <div className="mb-3 p-2.5 bg-[#F2E829] rounded-xl border-2 border-black text-xs font-heading text-black">
                <span className="font-black">Must Try: </span>
                <span className="font-medium">{data.best_known_for}</span>
              </div>
            )}

            {/* Timings & Address */}
            <div className="space-y-1.5 p-2.5 bg-[#F2B949] rounded-xl border-2 border-black text-xs font-mono text-black mb-4 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span className="font-bold">{data.opening_time || "10:00 AM"} - {data.closing_time || "11:00 PM"}</span>
              </div>
              <div className="text-[11px] text-black/80 pl-4 font-semibold">
                {data.address || "Warangal Tri-City, Telangana"}
              </div>
            </div>

            {/* Action Buttons in Mango Popsicle Palette with Black Text */}
            <div className="space-y-2">
              <a
                href={data.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((data.name || data.event_name) + " Warangal")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation size={16} /> Open in Google Maps 📍
              </a>

              <button
                onClick={handleVisit}
                className={`w-full py-2.5 font-heading font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors ${
                  visited
                    ? 'bg-[#F2E829] text-black'
                    : 'bg-[#F2B949] hover:bg-[#F2E829] text-black'
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
                className="w-full py-2 bg-[#EDD377] hover:bg-[#F2B949] text-black font-heading font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
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
