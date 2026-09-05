import React, { useState, useEffect } from 'react';
import { X, Sparkles, Award, MapPin, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface MonthlyRecapModalProps {
  month: string; // YYYY-MM
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const MonthlyRecapModal: React.FC<MonthlyRecapModalProps> = ({
  month,
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const [recap, setRecap] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getMonthlyRecap(month)
      .then(data => {
        setRecap(data);
        sound.playJackpot();
        confetti({ particleCount: 70, spread: 60 });
        api.markRecapSeen(month).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, month]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#12111A] w-full max-w-sm rounded-3xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-20"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-20 font-mono text-xs text-gray-400">
            Flipping photo album pages... 📸
          </div>
        )}

        {!loading && recap && (
          <div className="space-y-4">
            {/* Scrapbook Tape */}
            <div className="washi-tape"></div>

            {/* Header Stamp */}
            <div className="text-center pt-2">
              <div className="inline-block px-3 py-1 bg-arcade-pink text-white font-pixel text-[10px] rounded-lg border-2 border-black shadow-retro-sm uppercase">
                {recap.month_name} RECAP 🎉
              </div>
              <h2 className="font-heading font-extrabold text-xl text-arcade-yellow mt-2">
                "{recap.headline}"
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Warangal Adventure Log for {recap.user_name}
              </p>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-3 gap-2 bg-arcade-card p-3 rounded-2xl border-2 border-black shadow-retro text-center">
              <div>
                <div className="font-pixel text-lg text-arcade-yellow">
                  {recap.explored_days_count}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">Days Out</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-arcade-cyan">
                  {recap.total_places_count}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">Places</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-arcade-green">
                  {recap.new_discoveries_count}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">New Finds</div>
              </div>
            </div>

            {/* Where You Went */}
            {recap.places_visited.length > 0 && (
              <div className="bg-arcade-card p-4 rounded-2xl border-2 border-black shadow-retro">
                <h3 className="font-pixel text-xs text-arcade-yellow mb-2.5">
                  WHERE YOU WENT 📍
                </h3>
                <div className="space-y-2">
                  {recap.places_visited.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-heading font-bold text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {p.category} • {p.area}
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#12111A] text-arcade-cyan px-2 py-0.5 rounded border border-gray-800 font-mono">
                        {p.visits}x visits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Next for next month */}
            {recap.next_month_recommendations.length > 0 && (
              <div className="bg-arcade-card p-4 rounded-2xl border-2 border-black shadow-retro">
                <h3 className="font-pixel text-xs text-arcade-pink mb-2">
                  WHAT'S NEXT? 👀
                </h3>
                <p className="text-xs text-gray-400 font-heading mb-3">
                  Spots waiting for your gang next month:
                </p>
                <div className="space-y-2">
                  {recap.next_month_recommendations.map((n: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-[#12111A] rounded-xl border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="font-heading font-bold text-xs text-white">
                          {n.name}
                        </div>
                        <div className="text-[10px] text-arcade-yellow font-mono">
                          {n.tag} • {n.area}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-arcade-pink" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-arcade-yellow hover:bg-yellow-400 text-black font-pixel text-xs rounded-xl retro-btn uppercase tracking-wider"
            >
              CLOSE RECAP 🎲
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
