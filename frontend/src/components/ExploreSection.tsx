import React, { useState, useEffect } from 'react';
import { Compass, Heart, Navigation, CheckCircle2 } from 'lucide-react';
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
    api.getExplore({ category: category === "All" ? undefined : category, limit: 60 })
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
      {/* Retro Postcard Header in Mango Popsicle Palette */}
      <div className="bg-gradient-to-r from-[#F2B949]/35 via-[#F27430]/25 to-[#F2E829]/15 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-[#F2E829] uppercase tracking-widest">
              WARANGAL TRAVEL POSTCARD
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              EXPLORE 🌅
            </h2>
            <p className="text-xs text-[#EDD377] font-heading mt-0.5">
              108 Temples, sunset lakes, ruins, and breeze spots.
            </p>
          </div>
          <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">📸</span>
        </div>
      </div>

      {/* Category Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setCategory(cat); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-heading font-bold text-xs border-2 border-black transition-all ${
              category === cat
                ? 'bg-[#F2B949] text-black shadow-retro-sm font-extrabold translate-y-[-1px]'
                : 'bg-[#241b12] text-[#EDD377] hover:text-[#F2B949] hover:bg-[#302419]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 font-mono text-xs text-[#EDD377]">
          Unfolding city map... 🗺️
        </div>
      )}

      {!loading && places.length === 0 && (
        <div className="text-center py-10 bg-[#241b12] rounded-2xl border-3 border-black p-6 shadow-retro">
          <div className="text-4xl mb-2">🧭</div>
          <h3 className="font-heading font-bold text-sm text-white">No spots found for this filter</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Try another category to discover more landmarks.</p>
          <button
            onClick={() => setCategory("All")}
            className="mt-3 px-4 py-2 bg-[#F2B949] text-black font-heading font-extrabold text-xs rounded-xl retro-btn"
          >
            Show All 108 Explore Places
          </button>
        </div>
      )}

      {/* Explore Postcard Cards */}
      <div className="space-y-3">
        {places.map(p => (
          <div
            key={p.id}
            className="bg-[#241b12] rounded-2xl border-3 border-black shadow-retro p-3.5 hover:border-[#F2B949] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(p.id, 'explore')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18130d] text-[#F2B949] rounded border border-black font-bold">
                    {p.category}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono">
                    📍 {p.area}
                  </span>
                  {p.entry_fee && p.entry_fee.toLowerCase().includes("free") && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#EDD377] text-black border border-black rounded">
                      FREE ENTRY
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-[#F2B949] transition-colors">
                  {p.name}
                </h3>

                <p className="text-xs text-gray-300 font-heading line-clamp-2 mt-1">
                  {p.description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                  <span className="text-[#F2E829] font-bold">★ {p.rating} ({p.review_count || 50})</span>
                  <span className="text-[#EDD377]">🕒 {p.best_time || "Morning / Sunset"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(p.id, 'explore'); }}
                  className="p-2 bg-[#18130d] hover:bg-[#302419] text-[#F27430] rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Save to Scrapbook"
                >
                  <Heart size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onConfirmVisit(p.id, 'explore'); }}
                  className="p-2 bg-[#18130d] hover:bg-[#302419] text-[#EDD377] hover:text-[#F2E829] rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Mark Visited"
                >
                  <CheckCircle2 size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onSelectDetail(p.id, 'explore'); }}
                  className="p-2 bg-[#F2B949] text-black rounded-xl border-2 border-black shadow-retro-sm hover:bg-[#F2E829] transition-colors"
                  title="Details"
                >
                  <Navigation size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
