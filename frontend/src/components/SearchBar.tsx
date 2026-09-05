import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Utensils, Compass, Ticket } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface SearchBarProps {
  onSelectPlace: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectPlace }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ food: any[]; explore: any[]; events: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchAll(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="px-4 py-2 max-w-md mx-auto relative z-30">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results) setIsOpen(true); }}
          placeholder="Where do you wanna go? (Biryani, sunset, cafe...)"
          className="w-full bg-[#1A1826] border-2 border-black focus:border-arcade-yellow text-white pl-11 pr-10 py-3 rounded-xl font-heading text-sm outline-none shadow-retro placeholder:text-gray-400 placeholder:italic"
        />
        <Search className="absolute left-3.5 top-3.5 text-arcade-yellow" size={18} />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results && (
        <div className="absolute left-4 right-4 top-14 bg-arcade-card rounded-xl border-3 border-black shadow-retro-xl p-3 max-h-80 overflow-y-auto z-40">
          {loading && (
            <div className="text-center py-4 text-xs font-mono text-gray-400">
              Searching Warangal... 🔍
            </div>
          )}

          {!loading && results.food.length === 0 && results.explore.length === 0 && results.events.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-400 font-mono">
              "We couldn't find that one. Try another keyword!"
            </div>
          )}

          {/* Food Results */}
          {results.food.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-pixel text-arcade-yellow mb-1 flex items-center gap-1">
                <Utensils size={12} /> FOOD & EATS ({results.food.length})
              </div>
              <div className="space-y-1">
                {results.food.map((item) => (
                  <button
                    key={`food-${item.id}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectPlace(item.id, 'food');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-800 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-heading font-bold text-xs text-white group-hover:text-arcade-yellow">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item.category} • {item.area}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400">★ {item.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explore Results */}
          {results.explore.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-pixel text-arcade-cyan mb-1 flex items-center gap-1">
                <Compass size={12} /> EXPLORE & SIGHTS ({results.explore.length})
              </div>
              <div className="space-y-1">
                {results.explore.map((item) => (
                  <button
                    key={`explore-${item.id}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectPlace(item.id, 'explore');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-800 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-heading font-bold text-xs text-white group-hover:text-arcade-cyan">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item.category} • {item.area}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400">★ {item.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {results.events.length > 0 && (
            <div>
              <div className="text-[11px] font-pixel text-arcade-pink mb-1 flex items-center gap-1">
                <Ticket size={12} /> EVENTS & WORKSHOPS ({results.events.length})
              </div>
              <div className="space-y-1">
                {results.events.map((item) => (
                  <button
                    key={`event-${item.id}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectPlace(item.id, 'event');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-800 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-heading font-bold text-xs text-white group-hover:text-arcade-pink">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item.venue} • {item.date}
                      </div>
                    </div>
                    <span className="text-[10px] bg-arcade-pink/30 text-arcade-pink px-2 py-0.5 rounded font-mono">
                      EVENT
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
