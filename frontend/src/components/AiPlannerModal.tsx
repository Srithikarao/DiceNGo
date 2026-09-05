import React, { useState } from 'react';
import { X, Sparkles, Navigation, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
  onConfirmVisit: (id: number, type: string) => void;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
  onConfirmVisit
}) => {
  const [situation, setSituation] = useState("Me and my three friends are bored in Hanamkonda. Budget is ₹500 each.");
  const [vibe, setVibe] = useState("Chill");
  const [duration, setDuration] = useState(4);
  const [budget, setBudget] = useState(500);
  const [itinerary, setItinerary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    sound.playRollTick(400);

    try {
      const data = await api.generateItinerary({
        situation,
        group_size: 4,
        budget_per_person: budget,
        vibe,
        duration_hours: duration
      });
      setItinerary(data);
      sound.playJackpot();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-arcade-card w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-arcade-cyan tracking-widest uppercase">
            MISSION CONTROL ASSISTANT
          </div>
          <h2 className="font-pixel text-base text-arcade-yellow mt-0.5">
            🤖 AI PLANNER
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Tell me the situation. I'll build your itinerary.
          </p>
        </div>

        {/* Input Form */}
        {!itinerary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-arcade-cyan mb-1.5">
                WHAT'S THE SITUATION?
              </label>
              <textarea
                rows={3}
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder="e.g. Me and 2 friends are near Subedari. We want spicy food and a sunset view within ₹400 each."
                className="w-full bg-[#12111A] border-2 border-gray-700 focus:border-arcade-cyan text-white p-3 rounded-xl font-heading text-xs outline-none shadow-retro-sm"
              />
            </div>

            {/* Quick Chips: Vibe */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                VIBE:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Chill", "Foodie", "Adventure", "Crazy", "Peaceful"].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { sound.playClick(); setVibe(v); }}
                    className={`px-2.5 py-1 text-xs font-heading font-bold rounded-lg border border-black transition-colors ${
                      vibe === v ? 'bg-arcade-yellow text-black' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Duration */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                TIME AVAILABLE:
              </label>
              <div className="flex gap-2">
                {[
                  { label: "Quick (2 hrs)", val: 2 },
                  { label: "Evening (4 hrs)", val: 4 },
                  { label: "Full Outing (6 hrs)", val: 6 }
                ].map(d => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => { sound.playClick(); setDuration(d.val); }}
                    className={`flex-1 py-1 text-[11px] font-heading font-bold rounded-lg border border-black transition-colors ${
                      duration === d.val ? 'bg-arcade-pink text-white' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Budget */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                PER-PERSON BUDGET:
              </label>
              <div className="flex gap-2">
                {[300, 500, 800, 1200].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`flex-1 py-1 text-[11px] font-heading font-bold rounded-lg border border-black transition-colors ${
                      budget === b ? 'bg-arcade-green text-black' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-arcade-cyan hover:bg-cyan-400 text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "CALCULATING ITINERARY..." : "GENERATE PLAN 🤖"}
            </button>
          </div>
        ) : (
          /* Itinerary View */
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Retro AI Message */}
            <div className="bg-[#12111A] p-3.5 rounded-xl border-2 border-arcade-cyan text-xs font-heading text-arcade-cyan italic shadow-retro-sm">
              "{itinerary.summary_message}"
            </div>

            {/* Cost Breakdown Pill */}
            <div className="grid grid-cols-3 gap-2 bg-[#12111A] p-3 rounded-xl border border-gray-800 text-center font-mono">
              <div>
                <div className="text-[10px] text-gray-400">Total Spend</div>
                <div className="text-sm font-bold text-arcade-yellow">₹{itinerary.total_cost_per_person}</div>
                <div className="text-[9px] text-gray-500">per person</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Remaining</div>
                <div className="text-sm font-bold text-arcade-green">₹{itinerary.remaining_budget_per_person}</div>
                <div className="text-[9px] text-gray-500">left over</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Distance</div>
                <div className="text-sm font-bold text-arcade-cyan">{itinerary.total_distance_km} km</div>
                <div className="text-[9px] text-gray-500">travel radius</div>
              </div>
            </div>

            {/* Timeline Stops */}
            <div className="space-y-3">
              {itinerary.stops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#12111A] p-3 rounded-xl border-2 border-black shadow-retro flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-arcade-yellow">
                        {stop.time}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-800 text-gray-300 rounded uppercase">
                        {stop.type}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectDetail(stop.item_id, stop.type === 'explore' ? 'explore' : 'food')}
                      className="font-heading font-extrabold text-sm text-white mt-1 hover:text-arcade-yellow cursor-pointer"
                    >
                      {stop.name}
                    </h4>

                    <p className="text-xs text-gray-400 font-heading mt-0.5">
                      {stop.why_selected}
                    </p>

                    <div className="text-[11px] text-arcade-green font-mono font-bold mt-1">
                      Est. Cost: ₹{stop.estimated_cost_per_person} / head
                    </div>
                  </div>

                  <a
                    href={stop.maps_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-arcade-yellow text-black rounded-lg border border-black hover:bg-yellow-400"
                    title="Navigate"
                  >
                    <Navigation size={14} />
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => { sound.playClick(); setItinerary(null); }}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Tweak & Plan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
