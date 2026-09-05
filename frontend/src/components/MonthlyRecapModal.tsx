import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  onSelectDetail: _onSelectDetail
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-sm rounded-3xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-10 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {loading && (
          <div className="text-center py-20 font-mono text-xs text-black font-bold">
            Developing your monthly film roll... 🎞️
          </div>
        )}

        {!loading && recap && (
          <div className="space-y-4">
            {/* Header Stamp */}
            <div className="text-center pt-2">
              <div className="inline-block px-3 py-1 bg-[#F27430] text-black font-pixel text-[10px] rounded-lg border-2 border-black shadow-retro-sm uppercase font-black">
                {recap.month || month} RECAP 🎉
              </div>
              <h2 className="font-heading font-black text-xl text-black mt-2">
                "Warangal Adventure Master"
              </h2>
              <p className="text-xs text-black font-mono font-bold">
                Badge: {recap.badge_awarded || "Mango Popsicle Adventurer 🥭"}
              </p>
            </div>

            {/* Stat Counters Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#F2B949] p-3 rounded-2xl border-2 border-black shadow-retro text-center text-black">
              <div>
                <div className="font-pixel text-lg text-black font-black">
                  {recap.days_active || 1}
                </div>
                <div className="text-[10px] text-black/80 font-mono font-bold">Days Out</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-black font-black">
                  {recap.total_discoveries || 3}
                </div>
                <div className="text-[10px] text-black/80 font-mono font-bold">Spots Visited</div>
              </div>
              <div>
                <div className="font-pixel text-lg text-black font-black">
                  +250
                </div>
                <div className="text-[10px] text-black/80 font-mono font-bold">XP Gained</div>
              </div>
            </div>

            {/* Favorite Category */}
            <div className="bg-[#F2E829] p-4 rounded-2xl border-2 border-black shadow-retro text-black">
              <h3 className="font-pixel text-xs text-black font-black mb-1">
                TOP SPOT OF THE MONTH 🥭
              </h3>
              <p className="text-sm font-heading font-black text-black">
                {recap.top_spot || "Kakatiya Deluxe Mess"}
              </p>
              <div className="text-[11px] text-black font-mono mt-1 font-bold">
                Category: {recap.top_category || "Biryani & Cafes"}
              </div>
            </div>

            {/* Close / Share Action */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-pixel text-xs rounded-xl retro-btn uppercase tracking-wider transition-colors shadow-retro-lg font-black"
            >
              KEEP EXPLORING 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
