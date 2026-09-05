import React, { useState, useEffect } from 'react';
import { X, Heart, Navigation, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
  onConfirmVisit: (id: number, type: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
  onConfirmVisit
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getFavorites()
      .then(data => setFavorites(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemove = async (itemType: string, itemId: number) => {
    sound.playClick();
    try {
      await api.removeFavorite(itemType, itemId);
      setFavorites(prev => prev.filter(f => !(f.item_id === itemId && f.item_type === itemType)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-10 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-[#F27430] tracking-widest uppercase font-bold">
            MY PERSONAL SCRAPBOOK
          </div>
          <h2 className="font-pixel text-base text-[#F2E829] mt-0.5">
            SAVED SPOTS ❤️ 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading">
            Things you bookmarked to try later.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-[#EDD377]">
            Opening your scrapbook... 📖
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="text-center py-12 bg-[#18130d] rounded-2xl border-2 border-black p-6">
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-heading font-bold text-sm text-white">Your scrapbook is empty.</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              "Save something before you forget it ❤️"
            </p>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="space-y-3">
            {favorites.map((fav: any) => {
              const spot = fav.place || fav.item || {};
              return (
                <div
                  key={fav.id}
                  className="p-3 bg-[#18130d] rounded-xl border-2 border-black shadow-retro flex items-center justify-between gap-3"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectDetail(fav.item_id, fav.item_type)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#F2B949] text-black rounded uppercase font-bold">
                        {fav.item_type}
                      </span>
                      <span className="text-[10px] text-gray-300 font-mono">
                        📍 {spot.area || "Warangal"}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-sm text-white mt-1 hover:text-[#F2E829] transition-colors">
                      {spot.name || spot.event_name || `Spot #${fav.item_id}`}
                    </h4>

                    <div className="text-xs text-[#F2E829] font-mono font-bold mt-0.5">
                      ★ {spot.rating || "4.5"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playStamp();
                        onConfirmVisit(fav.item_id, fav.item_type);
                      }}
                      className="p-2 bg-[#EDD377] hover:bg-[#F2B949] text-black rounded-lg border border-black shadow-retro-sm transition-colors"
                      title="Mark Visited"
                    >
                      <CheckCircle2 size={15} />
                    </button>

                    <button
                      onClick={() => handleRemove(fav.item_type, fav.item_id)}
                      className="p-2 bg-[#241b12] hover:bg-red-950 text-gray-400 hover:text-red-400 rounded-lg border border-black transition-colors"
                      title="Remove from Scrapbook"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
