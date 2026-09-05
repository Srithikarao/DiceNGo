import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-sm rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-10 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-black tracking-widest uppercase font-black">
            MY PERSONAL SCRAPBOOK
          </div>
          <h2 className="font-pixel text-base text-black mt-0.5 font-black">
            SAVED SPOTS ❤️ 🥭
          </h2>
          <p className="text-xs text-black font-heading font-semibold">
            Things you bookmarked to try later.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-black font-bold">
            Opening your scrapbook... 📖
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="text-center py-12 bg-[#F2B949] rounded-2xl border-2 border-black p-6 text-black">
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-heading font-black text-sm text-black">Your scrapbook is empty.</h3>
            <p className="text-xs text-black font-mono mt-1 font-medium">
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
                  className="p-3 bg-[#F2B949] rounded-xl border-2 border-black shadow-retro flex items-center justify-between gap-3 text-black"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectDetail(fav.item_id, fav.item_type)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#F2E829] text-black rounded uppercase font-black border border-black">
                        {fav.item_type}
                      </span>
                      <span className="text-[10px] text-black font-mono font-bold">
                        📍 {spot.area || "Warangal"}
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-sm text-black mt-1">
                      {spot.name || spot.event_name || `Spot #${fav.item_id}`}
                    </h4>

                    <div className="text-xs text-black font-mono font-black mt-0.5">
                      ★ {spot.rating || "4.5"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playStamp();
                        onConfirmVisit(fav.item_id, fav.item_type);
                      }}
                      className="p-2 bg-[#F27430] hover:bg-[#F2E829] text-black rounded-lg border border-black shadow-retro-sm transition-colors"
                      title="Mark Visited"
                    >
                      <CheckCircle2 size={15} />
                    </button>

                    <button
                      onClick={() => handleRemove(fav.item_type, fav.item_id)}
                      className="p-2 bg-[#EDD377] hover:bg-[#F27430] text-black rounded-lg border border-black transition-colors"
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
