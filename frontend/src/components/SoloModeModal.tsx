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

  const spotsList = Array.isArray(data) ? data : data?.spots || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
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
            INTROVERT & SOLO OUTINGS
          </div>
          <h2 className="font-pixel text-base text-[#F2E829] mt-0.5">
            🧍 SOLO MODE 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading font-extrabold">
            "WHY WAIT FOR EVERYONE? GO SOLO."
          </p>
        </div>

        {/* Cheeky DRY Repeat Warning */}
        {data && data.repeat_warning && (
          <div className="mb-4 bg-[#302419] border border-[#F2B949] text-[#EDD377] p-3 rounded-xl text-xs font-heading flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-[#F2B949] mt-0.5" />
            <span>{data.repeat_warning}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-[#EDD377]">
            Finding quiet sanctuaries in Warangal... ☕
          </div>
        )}

        {!loading && spotsList.length > 0 && (
          <div className="space-y-3">
            {spotsList.map((s: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onSelectDetail(s.id, s.type)}
                className="p-3 bg-[#18130d] hover:bg-[#302419] rounded-xl border-2 border-black shadow-retro flex items-center justify-between cursor-pointer group transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F27430]/20 text-[#F27430] rounded font-bold">
                      {s.solo_tag || s.vibe || "Chill Spot"}
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono">
                      📍 {s.area}
                    </span>
                  </div>

                  <h4 className="font-heading font-extrabold text-sm text-white mt-1 group-hover:text-[#F2E829] transition-colors">
                    {s.name}
                  </h4>

                  <div className="text-xs text-[#EDD377] font-heading mt-0.5">
                    {s.best_for || s.vibe || "Great spot for coffee & reading"}
                  </div>
                </div>

                <span className="text-[#F2E829] font-bold text-xs">
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
