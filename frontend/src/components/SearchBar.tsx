import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Utensils, Compass, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface SearchBarProps {
  onSelectPlace: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectPlace }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ food: any[]; explore: any[]; events: any[] } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchAll(query.trim());
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="px-4 py-2 relative max-w-md mx-auto z-30">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results) setIsOpen(true); }}
          placeholder="Where do you wanna go? (Biryani, lake, cafe...)"
          className="w-full bg-[#F2E829] border-3 border-black focus:border-[#F27430] text-black pl-11 pr-10 py-3 rounded-xl font-heading font-medium text-sm outline-none shadow-retro placeholder:text-black/60 placeholder:italic transition-colors"
        />
        <Search className="absolute left-3.5 top-3.5 text-black" size={18} />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3.5 top-3.5 text-black hover:opacity-75"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown in Mango Popsicle Palette with Black Text */}
      {isOpen && results && (
        <div className="absolute left-4 right-4 top-14 bg-[#EDD377] rounded-xl border-3 border-black shadow-retro-xl p-3 max-h-80 overflow-y-auto z-40 text-black">
          {loading && (
            <div className="text-center py-4 text-xs font-mono text-black font-bold">
              Searching Warangal spots... 🔍
            </div>
          )}

          {!loading && results.food.length === 0 && results.explore.length === 0 && results.events.length === 0 && (
            <div className="text-center py-4 text-xs text-black font-mono font-medium">
              "We couldn't find that one. Try another keyword!"
            </div>
          )}

          {/* Food Results */}
          {results.food.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-pixel text-black mb-1 flex items-center gap-1 font-black">
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
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F2B949] flex items-center justify-between group transition-colors border border-black/20"
                  >
                    <div>
                      <div className="font-heading font-black text-xs text-black">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-black/80 font-mono font-medium">
                        {item.category} • {item.area}
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-black">★ {item.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explore Results */}
          {results.explore.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-pixel text-black mb-1 flex items-center gap-1 font-black">
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
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F2B949] flex items-center justify-between group transition-colors border border-black/20"
                  >
                    <div>
                      <div className="font-heading font-black text-xs text-black">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-black/80 font-mono font-medium">
                        {item.category} • {item.area}
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-black">★ {item.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {results.events.length > 0 && (
            <div>
              <div className="text-[11px] font-pixel text-black mb-1 flex items-center gap-1 font-black">
                <Calendar size={12} /> EVENTS & GIGS ({results.events.length})
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
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F2B949] flex items-center justify-between group transition-colors border border-black/20"
                  >
                    <div>
                      <div className="font-heading font-black text-xs text-black">
                        {item.event_name}
                      </div>
                      <div className="text-[10px] text-black/80 font-mono font-medium">
                        {item.venue} • {item.date}
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#F27430] text-black px-2 py-0.5 rounded font-mono font-black border border-black">
                      {item.fee}
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
