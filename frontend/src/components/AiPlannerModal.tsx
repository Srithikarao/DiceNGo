import React, { useState } from 'react';
import { X, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
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
  const [groupSize, _setGroupSize] = useState(2);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-md rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-20 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-black tracking-widest uppercase font-black">
            WARANGAL SITUATION ENGINE
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-black mt-0.5 font-black">
            🤖 AI PLANNER 🥭
          </h2>
          <p className="text-xs text-black font-heading font-semibold">
            Describe your mood. We'll map the exact outing.
          </p>
        </div>

        {/* Input Form */}
        {!itinerary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-black text-black mb-1.5">
                WHAT'S THE SITUATION?
              </label>
              <textarea
                rows={3}
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder="e.g. Me and 2 friends are near Subedari. We want spicy food and a sunset view within ₹400 each."
                className="w-full bg-[#F2E829] border-2 border-black focus:border-[#F27430] text-black p-3 rounded-xl font-heading font-medium text-xs outline-none shadow-retro-sm placeholder:text-black/60"
              />
            </div>

            {/* Quick Chips: Vibe */}
            <div>
              <label className="block text-[11px] font-mono text-black font-bold mb-1">
                VIBE:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Chill", "Foodie", "Adventure", "Crazy", "Peaceful"].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { sound.playClick(); setVibe(v); }}
                    className={`px-3 py-1 text-xs font-heading font-black rounded-lg border-2 border-black transition-all ${
                      vibe === v ? 'bg-[#F27430] text-black shadow-retro-sm' : 'bg-[#F2B949] text-black hover:bg-[#F2E829]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Duration */}
            <div>
              <label className="block text-[11px] font-mono text-black font-bold mb-1">
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
                    className={`flex-1 py-1 text-[11px] font-heading font-black rounded-lg border-2 border-black transition-all ${
                      duration === d.val ? 'bg-[#F27430] text-black shadow-retro-sm' : 'bg-[#F2B949] text-black hover:bg-[#F2E829]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Chips: Budget */}
            <div>
              <label className="block text-[11px] font-mono text-black font-bold mb-1">
                PER-PERSON BUDGET:
              </label>
              <div className="flex gap-2">
                {[200, 400, 700, 1200].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { sound.playClick(); setBudget(b); }}
                    className={`flex-1 py-1 text-xs font-mono font-black rounded-lg border-2 border-black transition-all ${
                      budget === b ? 'bg-[#F27430] text-black shadow-retro-sm' : 'bg-[#F2B949] text-black hover:bg-[#F2E829]'
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
              className="w-full py-4 bg-[#F27430] hover:bg-[#F2B949] text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn shadow-retro-lg flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50 font-black"
            >
              <Sparkles size={16} /> {loading ? "GENERATING MASTERPLAN..." : "GENERATE ITINERARY ⚡"}
            </button>
          </div>
        ) : (
          /* Itinerary Result Presentation */
          <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="p-3.5 bg-[#F2B949] rounded-2xl border-3 border-black shadow-retro text-black">
              <div className="text-[10px] font-pixel text-black font-black uppercase">
                {itinerary.itinerary_title}
              </div>
              <div className="flex items-center justify-between mt-1 font-mono text-xs text-black font-bold">
                <span>Cost: <b className="font-black">₹{itinerary.total_cost_per_person}/head</b></span>
                <span>Saved: <b className="font-black text-[#F27430]">₹{itinerary.budget_remaining}</b></span>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="space-y-2.5">
              {itinerary.stops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F2E829] rounded-xl border-2 border-black shadow-retro-sm flex items-start gap-3 relative text-black"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F27430] text-black font-pixel text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-black font-black">
                    {stop.order || idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-black font-mono font-bold">
                        {stop.time_slot}
                      </span>
                      <span className="text-[10px] font-black font-mono px-1.5 py-0.5 bg-[#EDD377] text-black rounded border border-black">
                        ₹{stop.estimated_cost}
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-sm text-black mt-0.5">
                      {stop.name}
                    </h4>

                    <p className="text-xs text-black font-heading mt-0.5 font-medium">
                      {stop.activity_notes}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectDetail(stop.item_id, stop.item_type);
                        }}
                        className="text-[11px] text-black font-mono font-black hover:underline flex items-center gap-1"
                      >
                        <Navigation size={11} /> View Spot
                      </button>

                      <button
                        onClick={() => {
                          sound.playStamp();
                          onConfirmVisit(stop.item_id, stop.item_type);
                        }}
                        className="text-[11px] text-black font-mono font-black hover:underline flex items-center gap-1 ml-auto bg-[#EDD377] px-2 py-0.5 rounded border border-black"
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
              className="w-full py-3 bg-[#F2B949] hover:bg-[#F27430] text-black font-heading font-black text-xs rounded-xl border-2 border-black transition-colors"
            >
              Create Another Plan 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
