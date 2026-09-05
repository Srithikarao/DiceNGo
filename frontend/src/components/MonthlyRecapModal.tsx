import React, { useState, useEffect } from 'react';
import { X, Sparkles, Navigation, Award, Calendar, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface MonthlyRecapModalProps {
  month: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore') => void;
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
    sound.playJackpot();
    confetti({
      particleCount: 80,
      spread: 70,
      colors: ['#F2E829', '#F2B949', '#F27430', '#EDD377']
    });

    api.getMonthlyRecap(month)
      .then(res => setRecap(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, month]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-sm rounded-3xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-10 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-20 font-mono text-xs text-[#EDD377]">
            Developing your monthly film roll... 🎞️
          </div>
        )}

        {!loading && recap && (
          <div className="space-y-4">
            {/* Header Stamp */}
            <div className="text-center pt-2">
              <div className="inline-block px-3 py-1 bg-[#F27430] text-black font-pixel text-[10px] rounded-lg border-2 border-black shadow-retro-sm uppercase font-bold">
                {recap.month || month} RECAP 🎉
              </div>
              <h2 className="font-heading font-extrabold text-xl text-[#F2E829] mt-2">
                "Warangal Adventure Master"
              </h2>
              <p className="text-xs text-[#EDD377] font-mono">
                Badge: {recap.badge_awarded || "Mango Popsicle Adventurer 🥭"}
              </p>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#18130d] p-3 rounded-2xl border-2 border-black shadow-retro text-center">
              <div>
                <div className="font-pixel text-lg text-[#F2E829]">
                  {recap.days_active || 1}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">Days Out</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-[#F2B949]">
                  {recap.total_discoveries || 3}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">Spots Visited</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-[#EDD377]">
                  +250
                </div>
                <div className="text-[10px] text-gray-400 font-mono">XP Gained</div>
              </div>
            </div>

            {/* Favorite Category */}
            <div className="bg-[#18130d] p-4 rounded-2xl border-2 border-[#F2B949] shadow-retro">
              <h3 className="font-pixel text-xs text-[#F2E829] mb-1">
                TOP SPOT OF THE MONTH 🥭
              </h3>
              <p className="text-sm font-heading font-extrabold text-white">
                {recap.top_spot || "Kakatiya Deluxe Mess"}
              </p>
              <div className="text-[11px] text-[#EDD377] font-mono mt-1">
                Category: {recap.top_category || "Biryani & Cafes"}
              </div>
            </div>

            {/* Close / Share Action */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#F2E829] hover:bg-[#F2B949] text-black font-pixel text-xs rounded-xl retro-btn uppercase tracking-wider transition-colors shadow-retro-lg"
            >
              KEEP EXPLORING 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
