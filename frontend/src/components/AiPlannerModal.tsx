import React, { useState } from 'react';
import { X, Sparkles, Navigation, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore') => void;
  onConfirmVisit: (id: number, type: 'food' | 'explore') => void;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
  onConfirmVisit,
}) => {
  const [situation, setSituation] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [budget, setBudget] = useState(400);
  const [vibe, setVibe] = useState('Chill');
  const [duration, setDuration] = useState(4);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    sound.playDiceRoll();

    try {
      const data = await api.generateItinerary({
        situation: situation || "Hanging out in Warangal with friends",
        group_size: groupSize,
        budget_per_person: budget,
        vibe,
        duration_hours: duration
      });
      setItinerary(data);
      sound.playSuccess();

      confetti({
        particleCount: 70,
        spread: 60,
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
      <div className="bg-[#241b12] w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-20 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-[#F27430] tracking-widest uppercase font-bold">
            WARANGAL SITUATION ENGINE
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#F2E829] mt-0.5">
            🤖 AI PLANNER 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading">
            Describe your mood. We'll map the exact outing.
          </p>
        </div>

        {/* Input Form */}
        {!itinerary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#F2B949] mb-1.5">
                WHAT'S THE SITUATION?
              </label>
              <textarea
                rows={3}
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder="e.g. Me and 2 friends are near Subedari. We want spicy food and a sunset view within ₹400 each."
                className="w-full bg-[#18130d] border-2 border-black focus:border-[#F2B949] text-white p-3 rounded-xl font-heading text-xs outline-none shadow-retro-sm placeholder:text-gray-500"
              />
            </div>

            {/* Quick Chips: Vibe */}
            <div>
              <label className="block text-[11px] font-mono text-[#EDD377] mb-1">
                VIBE:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Chill", "Foodie", "Adventure", "Crazy", "Peaceful"].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { sound.playClick(); setVibe(v); }}
                    className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-black transition-all ${
                      vibe === v ? 'bg-[#F2E829] text-black shadow-retro-sm font-extrabold' : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Duration */}
            <div>
              <label className="block text-[11px] font-mono text-[#EDD377] mb-1">
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
                    className={`flex-1 py-1 text-[11px] font-heading font-bold rounded-lg border-2 border-black transition-all ${
                      duration === d.val ? 'bg-[#F27430] text-black shadow-retro-sm font-extrabold' : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Budget */}
            <div>
              <label className="block text-[11px] font-mono text-[#EDD377] mb-1">
                PER-PERSON BUDGET:
              </label>
              <div className="flex gap-2">
                {[200, 400, 700, 1200].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`flex-1 py-1 text-xs font-mono font-bold rounded-lg border-2 border-black transition-all ${
                      budget === b ? 'bg-[#F2B949] text-black shadow-retro-sm font-extrabold' : 'bg-[#18130d] text-[#EDD377] hover:bg-[#302419]'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#F2E829] via-[#F2B949] to-[#F27430] hover:opacity-95 text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn shadow-retro-lg flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
            >
              <Sparkles size={16} /> {loading ? "GENERATING MASTERPLAN..." : "GENERATE ITINERARY ⚡"}
            </button>
          </div>
        ) : (
          /* Itinerary Result Presentation */
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="p-3.5 bg-[#18130d] rounded-2xl border-2 border-black shadow-retro">
              <div className="text-[10px] font-pixel text-[#F2E829] uppercase">
                {itinerary.itinerary_title}
              </div>
              <div className="flex items-center justify-between mt-1 font-mono text-xs text-gray-300">
                <span>Cost: <b className="text-[#F2E829]">₹{itinerary.total_cost_per_person}/head</b></span>
                <span>Saved: <b className="text-emerald-400">₹{itinerary.budget_remaining}</b></span>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="space-y-2.5">
              {itinerary.stops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#18130d] rounded-xl border-2 border-[#F2B949]/50 shadow-retro-sm flex items-start gap-3 relative"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F2E829] text-black font-pixel text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-black font-bold">
                    {stop.order || idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#F2B949] font-mono">
                        {stop.time_slot}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 bg-[#EDD377] text-black rounded border border-black">
                        ₹{stop.estimated_cost}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-sm text-white mt-0.5">
                      {stop.name}
                    </h4>

                    <p className="text-xs text-gray-300 font-heading mt-0.5">
                      {stop.activity_notes}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectDetail(stop.item_id, stop.item_type);
                        }}
                        className="text-[11px] text-[#F2B949] font-mono font-bold hover:underline flex items-center gap-1"
                      >
                        <Navigation size={11} /> View Spot
                      </button>

                      <button
                        onClick={() => {
                          sound.playStamp();
                          onConfirmVisit(stop.item_id, stop.item_type);
                        }}
                        className="text-[11px] text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle2 size={11} /> Mark Done
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setItinerary(null)}
              className="w-full py-3 bg-[#302419] hover:bg-[#3d2f21] text-[#EDD377] font-heading font-bold text-xs rounded-xl border-2 border-black transition-colors"
            >
              Create Another Plan 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
