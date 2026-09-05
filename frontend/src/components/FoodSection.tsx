import React, { useState, useEffect } from 'react';
import { Heart, Navigation, CheckCircle2 } from 'lucide-react';
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
    <div className="px-4 py-4 max-w-md mx-auto text-black">
      {/* Retro Diner Header Banner with Mango Popsicle Styling */}
      <div className="bg-[#F2B949] p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden text-black">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-black uppercase tracking-widest font-black">
              WARANGAL EATS & BITES
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-black mt-1 font-black">
              FOOD MODE 🍜
            </h2>
            <p className="text-xs text-black font-heading mt-0.5 font-bold">
              315 Biryani, tiffins, street food & cafes across the city.
            </p>
          </div>
          <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🥭</span>
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setCategory(cat); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-heading font-black text-xs border-2 border-black transition-all ${
              category === cat
                ? 'bg-[#F27430] text-black shadow-retro-sm translate-y-[-1px]'
                : 'bg-[#EDD377] text-black hover:bg-[#F2E829]'
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
            className="w-4 h-4 accent-[#F27430] rounded cursor-pointer"
          />
          <span className="text-xs font-heading font-black text-black flex items-center gap-1">
            🟢 Pure Veg Spots Only
          </span>
        </label>
        <span className="text-[11px] text-black font-mono font-bold">
          {foods.length} places available
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 font-mono text-xs text-black font-bold">
          Simmering fresh dishes... 🍜
        </div>
      )}

      {/* Empty state fallback */}
      {!loading && foods.length === 0 && (
        <div className="text-center py-10 bg-[#F2B949] rounded-2xl border-3 border-black p-6 shadow-retro text-black">
          <div className="text-4xl mb-2">🥭</div>
          <h3 className="font-heading font-black text-sm text-black">No spots found for this filter</h3>
          <p className="text-xs text-black font-mono mt-1 font-medium">Try selecting "All" or unchecking Pure Veg.</p>
          <button
            onClick={() => { setCategory("All"); setVegOnly(false); }}
            className="mt-3 px-4 py-2 bg-[#F27430] text-black font-heading font-black text-xs rounded-xl retro-btn"
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
            className="bg-[#F2B949] rounded-2xl border-3 border-black shadow-retro p-3.5 hover:bg-[#F2E829] transition-all text-black"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(f.id, 'food')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EDD377] text-black rounded border border-black font-black">
                    {f.category}
                  </span>
                  <span className="text-[10px] text-black font-mono font-bold">
                    📍 {f.area}
                  </span>
                  {f.is_new && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#F27430] text-black rounded border border-black">
                      NEW
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-black text-base text-black mt-1">
                  {f.name}
                </h3>

                <div className="text-xs text-black font-heading mt-0.5 font-medium">
                  <span className="font-black">Must Try: </span>
                  {f.best_known_for}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                  <span className="text-black font-black">
                    ★ {f.rating} ({f.review_count || 120}+)
                  </span>
                  <span className="text-black font-bold">
                    {f.price_range}
                  </span>
                  <span className="text-black font-medium">
                    🕒 {f.closing_time}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(f.id, 'food'); }}
                  className="p-2 bg-[#EDD377] hover:bg-[#F27430] text-black rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Save to Scrapbook"
                >
                  <Heart size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onConfirmVisit(f.id, 'food'); }}
                  className="p-2 bg-[#EDD377] hover:bg-[#F2E829] text-black rounded-xl border-2 border-black shadow-retro-sm transition-colors"
                  title="Mark Visited"
                >
                  <CheckCircle2 size={16} />
                </button>

                <button
                  onClick={() => { sound.playClick(); onSelectDetail(f.id, 'food'); }}
                  className="p-2 bg-[#F27430] text-black rounded-xl border-2 border-black shadow-retro-sm hover:bg-[#F2E829] transition-colors"
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
