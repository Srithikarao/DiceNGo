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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="bg-[#241b12] w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative scanlines overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 z-30"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title in Mango Popsicle Palette */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-[#F27430] tracking-widest uppercase font-bold">
            REMOVE DECISION FATIGUE
          </div>
          <h2 className="font-pixel text-lg text-[#F2E829] mt-0.5">
            🎲 DICE & GO 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading">
            Stop arguing. Let the dice decide.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {!result && (
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#18130d] rounded-xl border-2 border-black mb-5">
            {(['Food', 'Explore', 'Events', 'Surprise Me'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { sound.playClick(); setMode(m); }}
                className={`py-2 px-1 text-[11px] font-heading font-bold rounded-lg transition-all ${
                  mode === m
                    ? 'bg-[#F2E829] text-black shadow-retro-sm font-extrabold translate-y-[-1px]'
                    : 'text-[#EDD377] hover:text-[#F2E829]'
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
          <div className="my-8 text-center py-6 bg-[#18130d] rounded-xl border-2 border-black shadow-retro">
            <div className="text-5xl mb-3 animate-[spin_0.8s_linear_infinite]">
              🎲
            </div>
            <div className="font-pixel text-xs text-[#F2E829] animate-pulse">
              {reelText}
            </div>
            <div className="text-[10px] text-[#F2B949] font-mono mt-2">
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
              className="w-full py-4 bg-[#F2E829] hover:bg-[#F2B949] text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn shadow-retro-lg flex items-center justify-center gap-2 transition-colors"
            >
              ROLL THE DICE ⚡
            </button>

            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="allowFamiliar"
                checked={allowFamiliar}
                onChange={(e) => setAllowFamiliar(e.target.checked)}
                className="w-4 h-4 accent-[#F2B949] rounded cursor-pointer"
              />
              <label htmlFor="allowFamiliar" className="text-xs text-[#EDD377] font-heading cursor-pointer">
                Include places I've already visited
              </label>
            </div>
          </div>
        )}

        {/* Rolled Result Presentation */}
        {!isRolling && result && result.item && (
          <div className="my-2 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#18130d] rounded-2xl border-3 border-[#F2B949] shadow-retro-lg p-4 relative overflow-hidden">
              <div className="washi-tape"></div>

              <div className="flex items-center justify-between mb-1 mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#241b12] text-[#F2B949] rounded border border-black font-bold">
                  {result.item.category}
                </span>
                <span className="text-[10px] text-gray-300 font-mono">
                  📍 {result.item.area} ({result.distance_km || 2.4} km away)
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-lg text-white mt-1">
                {result.item.name || result.item.event_name}
              </h3>

              <div className="text-xs text-[#EDD377] font-heading mt-1">
                <span className="text-[#F2B949] font-bold">Why this: </span>
                {result.item.best_known_for || result.item.description || "Top rated Warangal experience"}
              </div>

              {/* Arcade Punchline */}
              <div className="my-3 p-2.5 bg-[#F27430]/15 rounded-xl border border-[#F27430]/40 text-xs font-heading text-[#F27430] flex items-center gap-2">
                <Flame size={16} className="shrink-0" />
                <span>{result.arcade_punchline}</span>
              </div>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() => {
                    sound.playStamp();
                    onConfirmVisit(result.item.id, result.item_type || 'food');
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#F2E829] hover:bg-[#F2B949] text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={16} /> ACCEPT FATE & GO 🚀
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDetail(result.item.id, result.item_type || 'food')}
                    className="py-2.5 bg-[#241b12] hover:bg-[#302419] text-[#EDD377] font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={14} className="text-[#F2B949]" /> View Details
                  </button>

                  <button
                    onClick={handleRoll}
                    className="py-2.5 bg-[#302419] hover:bg-[#3d2f21] text-white font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={14} className="text-[#F27430]" /> Re-roll (1/3)
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
