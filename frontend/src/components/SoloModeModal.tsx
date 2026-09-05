import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-md rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
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
            INTROVERT & SOLO OUTINGS
          </div>
          <h2 className="font-pixel text-base text-black mt-0.5 font-black">
            🧍 SOLO MODE 🥭
          </h2>
          <p className="text-xs text-black font-heading font-black">
            "WHY WAIT FOR EVERYONE? GO SOLO."
          </p>
        </div>

        {/* Cheeky DRY Repeat Warning */}
        {data && data.repeat_warning && (
          <div className="mb-4 bg-[#F2E829] border-2 border-black text-black p-3 rounded-xl text-xs font-heading font-medium flex items-start gap-2 shadow-retro-sm">
            <AlertCircle size={16} className="shrink-0 text-[#F27430] mt-0.5" />
            <span>{data.repeat_warning}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 font-mono text-xs text-black font-bold">
            Finding quiet sanctuaries in Warangal... ☕
          </div>
        )}

        {!loading && spotsList.length > 0 && (
          <div className="space-y-3">
            {spotsList.map((s: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onSelectDetail(s.id, s.type)}
                className="p-3 bg-[#F2B949] hover:bg-[#F2E829] rounded-xl border-2 border-black shadow-retro flex items-center justify-between cursor-pointer group transition-all text-black"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EDD377] text-black rounded border border-black font-black">
                      {s.solo_tag || s.vibe || "Chill Spot"}
                    </span>
                    <span className="text-[10px] text-black font-mono font-bold">
                      📍 {s.area}
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-sm text-black mt-1">
                    {s.name}
                  </h4>

                  <div className="text-xs text-black font-heading mt-0.5 font-medium">
                    {s.best_for || s.vibe || "Great spot for coffee & reading"}
                  </div>
                </div>

                <span className="text-black font-black text-xs">
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
