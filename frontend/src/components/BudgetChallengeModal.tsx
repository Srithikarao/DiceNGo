import React, { useState } from 'react';
import { X, DollarSign, Sparkles, RefreshCw, Navigation } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface BudgetChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const BudgetChallengeModal: React.FC<BudgetChallengeModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const [budget, setBudget] = useState(500);
  const [groupType, setGroupType] = useState("Friends");
  const [challenge, setChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunChallenge = async () => {
    setLoading(true);
    sound.playRollTick(450);

    try {
      const res = await api.takeChallenge({
        budget_limit: budget,
        group_type: groupType
      });
      setChallenge(res);
      sound.playJackpot();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <div className="text-[10px] font-pixel text-arcade-green tracking-widest uppercase">
            DAMAGE LIMIT ENGINE
          </div>
          <h2 className="font-pixel text-base text-arcade-yellow mt-0.5">
            💸 TAKE A CHALLENGE
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Maximum fun. Zero financial regret.
          </p>
        </div>

        {!challenge ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-arcade-green mb-1">
                WHAT'S THE DAMAGE LIMIT?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[300, 500, 1000].map(b => (
                  <button
                    key={b}
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`py-3 text-sm font-pixel rounded-xl border-2 border-black transition-all ${
                      budget === b
                        ? 'bg-arcade-green text-black shadow-retro-sm font-bold'
                        : 'bg-[#12111A] text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-arcade-cyan mb-1">
                WHO IS GOING?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Solo", "Friends", "Couple", "Family"].map(g => (
                  <button
                    key={g}
                    onClick={() => { sound.playClick(); setGroupType(g); }}
                    className={`py-2 text-xs font-heading font-bold rounded-lg border border-black transition-colors ${
                      groupType === g
                        ? 'bg-arcade-yellow text-black'
                        : 'bg-[#12111A] text-gray-400 hover:text-white'
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
              className="w-full py-3.5 bg-arcade-green hover:bg-emerald-400 text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "CRUNCHING NUMBERS..." : "LOCK CHALLENGE 💸"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Status Comment */}
            <div className="bg-arcade-green text-black p-3 rounded-xl border-2 border-black font-heading font-extrabold text-xs text-center shadow-retro-sm">
              {challenge.status_comment}
            </div>

            {/* Total Spend Breakdown */}
            <div className="bg-[#12111A] p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-gray-400">Budget Limit:</span>
                <div className="font-bold text-white">₹{challenge.budget_limit}</div>
              </div>
              <div>
                <span className="text-gray-400">Estimated Spend:</span>
                <div className="font-bold text-arcade-yellow">₹{challenge.total_estimated_spend}</div>
              </div>
              <div>
                <span className="text-gray-400">Remaining:</span>
                <div className="font-bold text-arcade-green">₹{challenge.remaining_balance}</div>
              </div>
            </div>

            {/* Stops */}
            <div className="space-y-2.5">
              {challenge.stops.map((s: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#12111A] rounded-xl border-2 border-black shadow-retro-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-arcade-yellow font-bold">
                      {s.time}
                    </span>
                    <span className="text-xs font-mono font-bold text-arcade-green">
                      ₹{s.cost}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white mt-0.5">
                    {s.title}
                  </h4>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {s.note}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { sound.playClick(); setChallenge(null); }}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Try Another Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
