import React, { useState, useEffect } from 'react';
import { Utensils, Heart, Navigation, CheckCircle2, Clock } from 'lucide-react';
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
    api.getFood({ category: category === "All" ? undefined : category, veg_only: vegOnly || undefined })
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
      {/* Retro Diner Header Banner */}
      <div className="bg-gradient-to-r from-arcade-diner/30 to-amber-900/30 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-arcade-yellow uppercase tracking-widest">
              WARANGAL EATS & BITES
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              FOOD MODE 🍜
            </h2>
            <p className="text-xs text-gray-300 font-heading mt-0.5">
              Biryani, tiffins, street food & cafes across the city.
            </p>
          </div>
          <span className="text-4xl">🌶️</span>
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setCategory(cat); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-heading font-bold text-xs border-2 border-black transition-colors ${
              category === cat
                ? 'bg-arcade-yellow text-black shadow-retro-sm'
                : 'bg-arcade-card text-gray-300 hover:text-white'
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
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
          <span className="text-xs font-heading font-bold text-emerald-400 flex items-center gap-1">
            🟢 Pure Veg Spots Only
          </span>
        </label>
        <span className="text-[11px] text-gray-400 font-mono">
          {foods.length} places available
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 font-mono text-xs text-gray-400">
          Simmering fresh dishes... 🍜
        </div>
      )}

      {/* Empty state */}
      {!loading && foods.length === 0 && (
        <div className="text-center py-10 bg-arcade-card rounded-2xl border-2 border-black p-6">
          <div className="text-4xl mb-2">🍽️</div>
          <h3 className="font-heading font-bold text-sm text-white">The fridge is empty!</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Try selecting another category or unchecking Pure Veg.</p>
        </div>
      )}

      {/* Food Cards List */}
      <div className="space-y-3">
        {foods.map(f => (
          <div
            key={f.id}
            className="bg-arcade-card rounded-2xl border-2 border-black shadow-retro p-3.5 hover:border-arcade-yellow transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(f.id, 'food')}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#12111A] text-arcade-yellow rounded border border-gray-800">
                    {f.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    📍 {f.area}
                  </span>
                  {f.is_new && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-arcade-pink text-white rounded">
                      NEW
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-arcade-yellow transition-colors">
                  {f.name}
                </h3>

                <div className="text-xs text-gray-300 font-heading mt-0.5">
                  <span className="text-arcade-cyan font-bold">Best known for:</span> {f.best_known_for}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-mono">
                  <span className="text-amber-400 font-bold">★ {f.rating} ({f.review_count})</span>
                  <span>{f.price_range}</span>
                  <span className={`flex items-center gap-1 ${f.is_open_now ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <Clock size={11} /> {f.is_open_now ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 items-end">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(f.id, 'food'); }}
                  className={`p-2 rounded-xl border border-black shadow-retro-sm transition-colors ${
                    f.is_favorite ? 'bg-arcade-pink text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  title="Save to Scrapbook"
                >
                  <Heart size={15} fill={f.is_favorite ? "currentColor" : "none"} />
                </button>

                <a
                  href={f.maps_url || `https://maps.google.com/?q=${f.latitude},${f.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-arcade-yellow text-black rounded-xl border border-black shadow-retro-sm hover:bg-yellow-400"
                  title="Navigate"
                >
                  <Navigation size={15} />
                </a>

                <button
                  onClick={() => { sound.playStamp(); onConfirmVisit(f.id, 'food'); }}
                  className={`px-2 py-1 text-[10px] font-heading font-bold rounded-lg border border-black shadow-retro-sm flex items-center gap-1 ${
                    f.is_visited ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-arcade-green hover:bg-gray-700'
                  }`}
                  title="Confirm Visit"
                >
                  <CheckCircle2 size={12} />
                  {f.is_visited ? `Went (${f.visit_count})` : 'Went?'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
