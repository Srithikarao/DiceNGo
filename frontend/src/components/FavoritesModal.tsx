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
      <div className="bg-arcade-card w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-arcade-pink tracking-widest uppercase">
            MY PERSONAL SCRAPBOOK
          </div>
          <h2 className="font-pixel text-base text-white mt-0.5">
            SAVED SPOTS ❤️
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Things you bookmarked to try later.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-gray-400">
            Opening your scrapbook... 📖
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="text-center py-12 bg-[#12111A] rounded-2xl border-2 border-black p-6">
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-heading font-bold text-sm text-white">Your scrapbook is empty.</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              "Save something before you forget it ❤️"
            </p>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="space-y-3">
            {favorites.map((fav: any) => (
              <div
                key={fav.id}
                className="p-3 bg-[#12111A] rounded-xl border-2 border-black shadow-retro flex items-center justify-between gap-3"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectDetail(fav.item_id, fav.item_type)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-gray-800 text-arcade-yellow rounded uppercase">
                      {fav.item_type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      📍 {fav.item?.area || "Warangal"}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-white mt-1 hover:text-arcade-yellow">
                    {fav.item?.name || "Saved Spot"}
                  </h4>

                  <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                    ★ {fav.item?.rating || "4.5"}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playStamp();
                      onConfirmVisit(fav.item_id, fav.item_type);
                    }}
                    className="p-2 bg-arcade-green hover:bg-emerald-400 text-black rounded-lg border border-black"
                    title="Mark Visited"
                  >
                    <CheckCircle2 size={15} />
                  </button>

                  <button
                    onClick={() => handleRemove(fav.item_type, fav.item_id)}
                    className="p-2 bg-gray-800 hover:bg-red-950 text-gray-400 hover:text-red-400 rounded-lg border border-black"
                    title="Remove from Scrapbook"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
