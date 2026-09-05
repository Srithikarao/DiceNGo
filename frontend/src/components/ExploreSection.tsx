import React, { useState, useEffect } from 'react';
import { Compass, Heart, Navigation, CheckCircle2, Clock, Camera } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface ExploreSectionProps {
  onSelectDetail: (id: number, type: 'explore') => void;
  onSaveFavorite: (id: number, type: 'explore') => void;
  onConfirmVisit: (id: number, type: 'explore') => void;
}

const CATEGORIES = [
  "All", "Temples", "Lakes", "Sunset Spots", "Scenic",
  "Parks", "Malls", "Go-Karting", "Photography", "Hidden Gems"
];

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onSelectDetail,
  onSaveFavorite,
  onConfirmVisit
}) => {
  const [category, setCategory] = useState("All");
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getExplore({ category: category === "All" ? undefined : category })
      .then(data => {
        if (isMounted) setPlaces(data.items || []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [category]);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      {/* Retro Postcard Header */}
      <div className="bg-gradient-to-r from-arcade-cyan/30 to-purple-900/30 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-arcade-cyan uppercase tracking-widest">
              WARANGAL TRAVEL POSTCARD
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              EXPLORE 🌅
            </h2>
            <p className="text-xs text-gray-300 font-heading mt-0.5">
              Temples, sunset lakes, ruins, and breeze spots.
            </p>
          </div>
          <span className="text-4xl">📸</span>
        </div>
      </div>

      {/* Category Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setCategory(cat); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-heading font-bold text-xs border-2 border-black transition-colors ${
              category === cat
                ? 'bg-arcade-cyan text-black shadow-retro-sm'
                : 'bg-arcade-card text-gray-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 font-mono text-xs text-gray-400">
          Unfolding city map... 🗺️
        </div>
      )}

      {!loading && places.length === 0 && (
        <div className="text-center py-10 bg-arcade-card rounded-2xl border-2 border-black p-6">
          <div className="text-4xl mb-2">🧭</div>
          <h3 className="font-heading font-bold text-sm text-white">The city is hiding something!</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Try another category to discover more landmarks.</p>
        </div>
      )}

      {/* Explore Postcard Cards */}
      <div className="space-y-3">
        {places.map(p => (
          <div
            key={p.id}
            className="bg-arcade-card rounded-2xl border-2 border-black shadow-retro p-3.5 hover:border-arcade-cyan transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(p.id, 'explore')}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#12111A] text-arcade-cyan rounded border border-gray-800">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    📍 {p.area}
                  </span>
                  {p.entry_fee && p.entry_fee.toLowerCase().includes("free") && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                      FREE ENTRY
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-arcade-cyan transition-colors">
                  {p.name}
                </h3>

                <p className="text-xs text-gray-300 font-heading line-clamp-2 mt-1">
                  {p.description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-mono">
                  <span className="text-amber-400 font-bold">★ {p.rating} ({p.review_count})</span>
                  <span>{p.best_time || "Morning / Sunset"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 items-end">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(p.id, 'explore'); }}
                  className={`p-2 rounded-xl border border-black shadow-retro-sm transition-colors ${
                    p.is_favorite ? 'bg-arcade-pink text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  title="Save to Scrapbook"
                >
                  <Heart size={15} fill={p.is_favorite ? "currentColor" : "none"} />
                </button>

                <a
                  href={p.maps_url || `https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-arcade-cyan text-black rounded-xl border border-black shadow-retro-sm hover:bg-cyan-300"
                  title="Navigate"
                >
                  <Navigation size={15} />
                </a>

                <button
                  onClick={() => { sound.playStamp(); onConfirmVisit(p.id, 'explore'); }}
                  className={`px-2 py-1 text-[10px] font-heading font-bold rounded-lg border border-black shadow-retro-sm flex items-center gap-1 ${
                    p.is_visited ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-arcade-green hover:bg-gray-700'
                  }`}
                  title="Confirm Visit"
                >
                  <CheckCircle2 size={12} />
                  {p.is_visited ? `Went (${p.visit_count})` : 'Went?'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
