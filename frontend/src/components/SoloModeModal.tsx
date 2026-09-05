import React, { useState, useEffect } from 'react';
import { X, Navigation, Heart, AlertCircle, Coffee, Compass } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface SoloModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const SoloModeModal: React.FC<SoloModeModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getSoloRecommendations()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-arcade-card w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-arcade-pink tracking-widest uppercase">
            INTROVERT & SOLO OUTINGS
          </div>
          <h2 className="font-pixel text-base text-white mt-0.5">
            🧍 SOLO MODE
          </h2>
          <p className="text-xs text-arcade-yellow font-heading font-bold">
            "WHY WAIT FOR EVERYONE? GO SOLO."
          </p>
        </div>

        {/* Cheeky DRY Repeat Warning */}
        {data && data.repeat_warning && (
          <div className="mb-4 bg-amber-950/60 border border-amber-500 text-amber-300 p-3 rounded-xl text-xs font-heading flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <span>{data.repeat_warning}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-gray-400">
            Finding quiet sanctuaries in Warangal... ☕
          </div>
        )}

        {!loading && data && (
          <div className="space-y-3">
            {data.spots.map((s: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onSelectDetail(s.id, s.type)}
                className="p-3 bg-[#12111A] hover:bg-gray-800 rounded-xl border-2 border-black shadow-retro flex items-center justify-between cursor-pointer group transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-arcade-pink/20 text-arcade-pink rounded">
                      {s.solo_tag}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      📍 {s.area}
                    </span>
                  </div>

                  <h4 className="font-heading font-extrabold text-sm text-white mt-1 group-hover:text-arcade-yellow transition-colors">
                    {s.name}
                  </h4>

                  <div className="text-xs text-gray-400 font-heading mt-0.5">
                    {s.best_for}
                  </div>
                </div>

                <span className="text-amber-400 font-bold text-xs">
                  ★ {s.rating}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
