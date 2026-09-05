import React, { useState, useEffect } from 'react';
import { Utensils, Heart, Navigation, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface FoodSectionProps {
  onSelectDetail: (id: number, type: 'food') => void;
  onSaveFavorite: (id: number, type: 'food') => void;
  onConfirmVisit: (id: number, type: 'food') => void;
}

const CATEGORIES = [
  "All", "Biryani", "Cafes", "Tiffin", "Restaurants",
  "Drive-ins", "Fast Food", "Street Food", "Ice Cream", "Desserts"
];

export const FoodSection: React.FC<FoodSectionProps> = ({
  onSelectDetail,
  onSaveFavorite,
  onConfirmVisit
}) => {
  const [category, setCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getFood({ category: category === "All" ? undefined : category, veg_only: vegOnly || undefined, limit: 80 })
      .then(data => {
        if (isMounted) setFoods(data.items || []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [category, vegOnly]);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      {/* Retro Diner Header Banner with Mango Popsicle Styling */}
      <div className="bg-gradient-to-r from-[#F27430]/35 via-[#F2B949]/25 to-[#F2E829]/15 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-[#F2E829] uppercase tracking-widest">
              WARANGAL EATS & BITES
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              FOOD MODE 🍜
            </h2>
            <p className="text-xs text-[#EDD377] font-heading mt-0.5">
              315 Biryani, tiffins, street food & cafes across the city.
            </p>
          </div>
          <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🥭</span>
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setCategory(cat); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-heading font-bold text-xs border-2 border-black transition-all ${
              category === cat
                ? 'bg-[#F2E829] text-black shadow-retro-sm font-extrabold translate-y-[-1px]'
                : 'bg-[#241b12] text-[#EDD377] hover:text-[#F2E829] hover:bg-[#302419]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Veg Only Toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={e => { sound.playClick(); setVegOnly(e.target.checked); }}
            className="w-4 h-4 accent-[#F2B949] rounded cursor-pointer"
          />
          <span className="text-xs font-heading font-bold text-[#EDD377] flex items-center gap-1">
            🟢 Pure Veg Spots Only
          </span>
        </label>
        <span className="text-[11px] text-gray-400 font-mono">
          {foods.length} places available
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 font-mono text-xs text-[#EDD377]">
          Simmering fresh dishes... 🍜
        </div>
      )}

      {/* Empty state fallback */}
      {!loading && foods.length === 0 && (
        <div className="text-center py-10 bg-[#241b12] rounded-2xl border-3 border-black p-6 shadow-retro">
          <div className="text-4xl mb-2">🥭</div>
          <h3 className="font-heading font-bold text-sm text-white">No spots found for this filter</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Try selecting "All" or unchecking Pure Veg.</p>
          <button
            onClick={() => { setCategory("All"); setVegOnly(false); }}
            className="mt-3 px-4 py-2 bg-[#F2B949] text-black font-heading font-extrabold text-xs rounded-xl retro-btn"
          >
            Show All 315 Food Spots
          </button>
        </div>
      )}

      {/* Food Cards List */}
      <div className="space-y-3">
        {foods.map(f => (
          <div
            key={f.id}
            className="bg-[#241b12] rounded-2xl border-3 border-black shadow-retro p-3.5 hover:border-[#F2B949] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(f.id, 'food')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18130d] text-[#F2B949] rounded border border-black font-bold">
                    {f.category}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono">
                    📍 {f.area}
                  </span>
                  {f.is_new && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#F27430] text-black rounded">
                      NEW
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-[#F2E829] transition-colors">
                  {f.name}
                </h3>

                <div className="text-xs text-gray-300 font-heading mt-0.5">
                  <span className="text-[#F2B949] font-bold">Must Try: </span>
                  {f.best_known_for}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                  <span className="text-[#F2E829] font-bold">
                    ★ {f.rating} ({f.review_count || 120}+)
                  </span>
                  <span className="text-[#EDD377]">
                    {f.price_range}
                  </span>
                  <span className="text-gray-400">
                    🕒 {f.closing_time}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(f.id, 'food'); }}
                  className="p-2 bg-[#18130d] hover:bg-[#302419] text-[#F27430] rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Save to Scrapbook"
                >
                  <Heart size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onConfirmVisit(f.id, 'food'); }}
                  className="p-2 bg-[#18130d] hover:bg-[#302419] text-[#EDD377] hover:text-[#F2E829] rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Mark Visited"
                >
                  <CheckCircle2 size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onSelectDetail(f.id, 'food'); }}
                  className="p-2 bg-[#F2E829] text-black rounded-xl border-2 border-black shadow-retro-sm hover:bg-[#F2B949] transition-colors"
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
