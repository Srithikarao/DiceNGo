import React, { useState } from 'react';
import { X } from 'lucide-react';
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
  onSelectDetail: _onSelectDetail,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-md rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[90vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-20 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title in Mango Popsicle Palette */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-black tracking-widest uppercase font-black">
            TAKE A CHALLENGE
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-black mt-0.5 font-black">
            💸 BUDGET CHALLENGE 🥭
          </h2>
          <p className="text-xs text-black font-heading font-semibold">
            Maximum fun. Zero financial regret.
          </p>
        </div>

        {!challenge ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-black text-black mb-1.5">
                WHAT'S THE DAMAGE LIMIT?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[300, 500, 1000].map(b => (
                  <button
                    key={b}
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`py-3 text-sm font-pixel rounded-xl border-2 border-black transition-all ${
                      budget === b
                        ? 'bg-[#F27430] text-black shadow-retro-sm font-black translate-y-[-1px]'
                        : 'bg-[#F2B949] text-black hover:bg-[#F2E829] font-black'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-black text-black mb-1.5">
                WHO IS GOING?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Solo", "Friends", "Couple", "Family"].map(g => (
                  <button
                    key={g}
                    onClick={() => { sound.playClick(); setGroupType(g); }}
                    className={`py-2 text-xs font-heading font-black rounded-lg border-2 border-black transition-all ${
                      groupType === g
                        ? 'bg-[#F27430] text-black shadow-retro-sm translate-y-[-1px]'
                        : 'bg-[#F2B949] text-black hover:bg-[#F2E829]'
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
              className="w-full py-4 bg-[#F27430] hover:bg-[#F2B949] text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2 shadow-retro-lg transition-colors disabled:opacity-50 font-black"
            >
              {loading ? "CRUNCHING NUMBERS..." : "LOCK CHALLENGE 💸"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Status Comment */}
            <div className="bg-[#F2E829] text-black p-3 rounded-xl border-2 border-black font-heading font-black text-xs text-center shadow-retro-sm">
              {challenge.mission || "Mission active! Stay within budget and log all stops."}
            </div>

            {/* Total Spend Breakdown */}
            <div className="bg-[#F2B949] p-3 rounded-xl border-2 border-black flex items-center justify-between text-xs font-mono text-black font-bold">
              <div>
                <span className="text-black/80 font-medium">Budget Limit:</span>
                <div className="font-black text-black">₹{challenge.budget_limit}</div>
              </div>
              <div>
                <span className="text-black/80 font-medium">Est. Spend:</span>
                <div className="font-black text-black">₹{challenge.total_estimated_cost}</div>
              </div>
              <div>
                <span className="text-black/80 font-medium">Remaining:</span>
                <div className="font-black text-[#F27430]">₹{challenge.remaining_money}</div>
              </div>
            </div>

            {/* Stops */}
            <div className="space-y-2">
              {challenge.stops.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F2E829] rounded-xl border-2 border-black shadow-retro-sm flex items-center justify-between text-black"
                >
                  <div>
                    <div className="text-[10px] text-black font-mono font-black">
                      Stop {s.stop_number}
                    </div>
                    <div className="font-heading font-black text-sm text-black mt-0.5">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-black/80 font-heading font-medium">
                      Target: {s.target}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black px-2 py-0.5 bg-[#EDD377] text-black rounded border border-black">
                      ₹{s.cost}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setChallenge(null)}
              className="w-full py-3 bg-[#F2B949] hover:bg-[#F27430] text-black font-heading font-black text-xs rounded-xl border-2 border-black transition-colors"
            >
              Take Another Challenge 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
