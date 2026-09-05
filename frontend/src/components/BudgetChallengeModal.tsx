import React, { useState } from 'react';
import { X, DollarSign, Navigation, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface BudgetChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore') => void;
}

export const BudgetChallengeModal: React.FC<BudgetChallengeModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
}) => {
  const [budget, setBudget] = useState(500);
  const [groupType, setGroupType] = useState('Friends');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleRunChallenge = async () => {
    setLoading(true);
    sound.playDiceRoll();

    try {
      const data = await api.takeChallenge({
        budget_limit: budget,
        group_type: groupType
      });
      setChallenge(data);
      sound.playSuccess();

      confetti({
        particleCount: 60,
        spread: 50,
        colors: ['#F2E829', '#F2B949', '#F27430', '#EDD377']
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[90vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-20 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title in Mango Popsicle Palette */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-[#F27430] tracking-widest uppercase font-bold">
            TAKE A CHALLENGE
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#F2E829] mt-0.5">
            💸 BUDGET CHALLENGE 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading">
            Maximum fun. Zero financial regret.
          </p>
        </div>

        {!challenge ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#EDD377] mb-1.5">
                WHAT'S THE DAMAGE LIMIT?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[300, 500, 1000].map(b => (
                  <button
                    key={b}
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`py-3 text-sm font-pixel rounded-xl border-2 border-black transition-all ${
                      budget === b
                        ? 'bg-[#EDD377] text-black shadow-retro-sm font-extrabold translate-y-[-1px]'
                        : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#F2B949] mb-1.5">
                WHO IS GOING?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Solo", "Friends", "Couple", "Family"].map(g => (
                  <button
                    key={g}
                    onClick={() => { sound.playClick(); setGroupType(g); }}
                    className={`py-2 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${
                      groupType === g
                        ? 'bg-[#F2B949] text-black font-extrabold shadow-retro-sm translate-y-[-1px]'
                        : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunChallenge}
              disabled={loading}
              className="w-full py-4 bg-[#F27430] hover:bg-[#F2B949] text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2 shadow-retro-lg transition-colors disabled:opacity-50"
            >
              {loading ? "CRUNCHING NUMBERS..." : "LOCK CHALLENGE 💸"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Status Comment */}
            <div className="bg-[#EDD377] text-black p-3 rounded-xl border-2 border-black font-heading font-extrabold text-xs text-center shadow-retro-sm">
              {challenge.mission || "Mission active! Stay within budget and log all stops."}
            </div>

            {/* Total Spend Breakdown */}
            <div className="bg-[#18130d] p-3 rounded-xl border-2 border-black flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-gray-400">Budget Limit:</span>
                <div className="font-bold text-white">₹{challenge.budget_limit}</div>
              </div>
              <div>
                <span className="text-gray-400">Est. Spend:</span>
                <div className="font-bold text-[#F2E829]">₹{challenge.total_estimated_cost}</div>
              </div>
              <div>
                <span className="text-gray-400">Remaining:</span>
                <div className="font-bold text-emerald-400">₹{challenge.remaining_money}</div>
              </div>
            </div>

            {/* Stops */}
            <div className="space-y-2">
              {challenge.stops.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#18130d] rounded-xl border-2 border-[#F2B949]/50 shadow-retro-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10px] text-[#F2B949] font-mono">
                      Stop {s.stop_number}
                    </div>
                    <div className="font-heading font-extrabold text-sm text-white mt-0.5">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-heading">
                      Target: {s.target}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#EDD377] text-black rounded border border-black">
                      ₹{s.cost}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setChallenge(null)}
              className="w-full py-3 bg-[#302419] hover:bg-[#3d2f21] text-[#EDD377] font-heading font-bold text-xs rounded-xl border-2 border-black transition-colors"
            >
              Take Another Challenge 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
