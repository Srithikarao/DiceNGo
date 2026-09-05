import React, { useState } from 'react';
import { X, Navigation, CheckCircle2, RotateCcw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface DiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
  onConfirmVisit: (id: number, type: 'food' | 'explore' | 'event') => void;
  onSaveFavorite?: (id: number, type: 'food' | 'explore' | 'event') => void;
}

export const DiceModal: React.FC<DiceModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
  onConfirmVisit,
}) => {
  const [mode, setMode] = useState<'Food' | 'Explore' | 'Events' | 'Surprise Me'>('Food');
  const [allowFamiliar, setAllowFamiliar] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [reelText, setReelText] = useState('SHUFFLING WARANGAL...');

  if (!isOpen) return null;

  const handleRoll = async () => {
    setIsRolling(true);
    setResult(null);
    sound.playDiceRoll();

    const reels = [
      "Checking Hanamkonda Biryanis...",
      "Scouting Kazipet Addas...",
      "Peeking at Bhadrakali Lake...",
      "Looking for fresh chai spots...",
      "Finding unvisited gems...",
      "Rolling the destiny dice..."
    ];

    let count = 0;
    const interval = setInterval(() => {
      setReelText(reels[count % reels.length]);
      count++;
    }, 150);

    try {
      const modeKey = mode === 'Food' ? 'food' : mode === 'Explore' ? 'explore' : mode === 'Events' ? 'quick_hangout' : 'wildcard';
      const data = await api.rollDice(modeKey, 18.0073, 79.5668, allowFamiliar);

      setTimeout(() => {
        clearInterval(interval);
        setIsRolling(false);
        setResult(data);
        sound.playJackpot();

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F2E829', '#F2B949', '#F27430', '#EDD377']
        });
      }, 1100);
    } catch (err) {
      clearInterval(interval);
      setIsRolling(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm text-black">
      <div className="bg-[#EDD377] w-full max-w-sm rounded-2xl border-4 border-black shadow-retro-xl p-5 relative overflow-hidden text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:opacity-75 p-1 z-30"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title in Mango Popsicle Palette */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-black tracking-widest uppercase font-black">
            REMOVE DECISION FATIGUE
          </div>
          <h2 className="font-pixel text-lg text-black mt-0.5 font-black">
            🎲 DICE & GO 🥭
          </h2>
          <p className="text-xs text-black font-heading font-semibold">
            Stop arguing. Let the dice decide.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {!result && (
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-[#F2B949] rounded-xl border-2 border-black mb-5">
            {(['Food', 'Explore', 'Events', 'Surprise Me'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { sound.playClick(); setMode(m); }}
                className={`py-2 px-1 text-[11px] font-heading font-black rounded-lg transition-all ${
                  mode === m
                    ? 'bg-[#F27430] text-black shadow-retro-sm translate-y-[-1px] border border-black'
                    : 'text-black/80 hover:text-black'
                }`}
              >
                {m === 'Food' && '🍜 Food'}
                {m === 'Explore' && '🌅 Explore'}
                {m === 'Events' && '🎟️ Event'}
                {m === 'Surprise Me' && '⚡ Surprise'}
              </button>
            ))}
          </div>
        )}

        {/* Rolling Reel Animation State */}
        {isRolling && (
          <div className="my-8 text-center py-6 bg-[#F2E829] rounded-xl border-3 border-black shadow-retro text-black">
            <div className="text-5xl mb-3 animate-[spin_0.8s_linear_infinite]">
              🎲
            </div>
            <div className="font-pixel text-xs text-black font-black animate-pulse">
              {reelText}
            </div>
            <div className="text-[10px] text-black font-mono font-bold mt-2">
              CONSULTING WARANGAL SPIRITS... 🥭
            </div>
          </div>
        )}

        {/* Not Rolling & No Result yet: Arcade Trigger */}
        {!isRolling && !result && (
          <div className="my-6 text-center">
            <div
              className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#F2E829] via-[#F2B949] to-[#F27430] rounded-2xl border-3 border-black shadow-retro-lg flex items-center justify-center text-5xl mb-5 hover:rotate-6 transition-transform cursor-pointer"
              onClick={handleRoll}
            >
              🎲
            </div>

            <button
              onClick={handleRoll}
              className="w-full py-4 bg-[#F27430] hover:bg-[#F2E829] text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn shadow-retro-lg flex items-center justify-center gap-2 transition-colors font-black"
            >
              ROLL THE DICE ⚡
            </button>

            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="allowFamiliar"
                checked={allowFamiliar}
                onChange={(e) => setAllowFamiliar(e.target.checked)}
                className="w-4 h-4 accent-[#F27430] rounded cursor-pointer"
              />
              <label htmlFor="allowFamiliar" className="text-xs text-black font-heading font-semibold cursor-pointer">
                Include places I've already visited
              </label>
            </div>
          </div>
        )}

        {/* Rolled Result Presentation */}
        {!isRolling && result && result.item && (
          <div className="my-2 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#F2B949] rounded-2xl border-3 border-black shadow-retro-lg p-4 relative overflow-hidden text-black">
              <div className="washi-tape"></div>

              <div className="flex items-center justify-between mb-1 mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EDD377] text-black rounded border border-black font-black">
                  {result.item.category}
                </span>
                <span className="text-[10px] text-black font-mono font-bold">
                  📍 {result.item.area} ({result.distance_km || 2.4} km away)
                </span>
              </div>

              <h3 className="font-heading font-black text-lg text-black mt-1">
                {result.item.name || result.item.event_name}
              </h3>

              <div className="text-xs text-black font-heading mt-1 font-medium">
                <span className="font-black">Why this: </span>
                {result.item.best_known_for || result.item.description || "Top rated Warangal experience"}
              </div>

              {/* Arcade Punchline */}
              <div className="my-3 p-2.5 bg-[#F2E829] rounded-xl border-2 border-black text-xs font-heading text-black font-black flex items-center gap-2">
                <Flame size={16} className="shrink-0 text-[#F27430]" />
                <span>{result.arcade_punchline}</span>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() => {
                    sound.playStamp();
                    onConfirmVisit(result.item.id, result.item_type || 'food');
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2E829] text-black font-heading font-black text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={16} /> ACCEPT FATE & GO 🚀
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDetail(result.item.id, result.item_type || 'food')}
                    className="py-2.5 bg-[#EDD377] hover:bg-[#F2E829] text-black font-heading font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={14} /> View Details
                  </button>

                  <button
                    onClick={handleRoll}
                    className="py-2.5 bg-[#F2E829] hover:bg-[#EDD377] text-black font-heading font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={14} /> Re-roll (1/3)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
