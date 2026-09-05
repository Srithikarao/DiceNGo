import React, { useState, useEffect } from 'react';
import { X, Navigation, Heart, CheckCircle2, MapPin, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface PlaceDetailModalProps {
  id: number | null;
  type: 'food' | 'explore' | 'event' | null;
  onClose: () => void;
  onSaveFavorite: (id: number, type: string) => void;
  onConfirmVisit: (id: number, type: string) => void;
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
    const fetchDetail = async () => {
      try {
        if (type === 'food') {
          const res = await api.getFoodDetail(id);
          setData(res);
          setVisited(res.is_visited);
        } else if (type === 'explore') {
          const res = await api.getExploreDetail(id);
          setData(res);
          setVisited(res.is_visited);
        } else {
          const res = await api.getEvents();
          const ev = (res.items || []).find((x: any) => x.id === id);
          setData(ev);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, type]);

  if (!id || !type) return null;

  const handleVisit = () => {
    sound.playStamp();
    confetti({ particleCount: 50, spread: 60 });
    setVisited(true);
    onConfirmVisit(id, type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-arcade-card w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-gray-400">
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
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-arcade-yellow font-mono text-[10px] rounded border border-arcade-yellow/40">
                {data.category}
              </div>
            </div>

            {/* Place Title */}
            <h2 className="font-heading font-extrabold text-xl text-white">
              {data.name || data.event_name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
              <MapPin size={13} className="text-arcade-cyan" />
              <span>{data.area || "Warangal"}</span>
              {data.rating && <span className="text-amber-400 font-bold">• ★ {data.rating}</span>}
              {data.price_range && <span>• {data.price_range}</span>}
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {data.veg && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono">
                  🌱 Veg
                </span>
              )}
              {data.non_veg && (
                <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded font-mono">
                  🍗 Non-Veg
                </span>
              )}
              {data.parking && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 border border-gray-700 rounded font-mono">
                  🅿️ Parking
                </span>
              )}
              {data.indoor_seating && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 border border-gray-700 rounded font-mono">
                  ❄️ AC Seating
                </span>
              )}
            </div>

            {/* Timings */}
            <div className="bg-[#12111A] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock size={13} /> {data.opening_time || "Morning"} - {data.closing_time || "Night"}
              </span>
              <span className={data.is_open_now ? "text-emerald-400 font-bold" : "text-gray-400"}>
                {data.is_open_now ? "Open Now" : "Standard Hours"}
              </span>
            </div>

            {/* Best known for */}
            {data.best_known_for && (
              <div className="mb-3 p-2.5 bg-arcade-yellow/10 rounded-xl border border-arcade-yellow/30 text-xs font-heading">
                <span className="text-arcade-yellow font-bold">Must Try: </span>
                <span className="text-gray-200">{data.best_known_for}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-gray-300 font-heading leading-relaxed mb-4">
              {data.description}
            </p>

            {/* Address */}
            <div className="text-[11px] text-gray-400 font-mono mb-5">
              <b className="text-gray-300">Address:</b> {data.address || `${data.area}, Warangal, Telangana`}
            </div>

            {/* Primary Action: LET'S GO */}
            <div className="space-y-2">
              <a
                href={data.maps_url || `https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-arcade-yellow hover:bg-yellow-400 text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2"
              >
                <Navigation size={16} /> LET'S GO 📍
              </a>

              {/* Visit Confirmation Button */}
              <button
                onClick={handleVisit}
                className={`w-full py-2.5 text-xs font-heading font-bold rounded-xl retro-btn flex items-center justify-center gap-1.5 transition-colors ${
                  visited
                    ? 'bg-emerald-600 text-white'
                    : 'bg-arcade-green hover:bg-emerald-400 text-black'
                }`}
              >
                <CheckCircle2 size={16} />
                {visited ? "✓ Visited! Recorded in Adventure Diary 🎉" : "✓ I Went Here (Confirm Visit)"}
              </button>

              <button
                onClick={() => { sound.playClick(); onSaveFavorite(id, type); }}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-arcade-pink font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5"
              >
                <Heart size={14} /> Save to Scrapbook ❤️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
