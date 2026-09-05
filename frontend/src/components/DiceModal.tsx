import React, { useState } from 'react';
import { X, Sparkles, Navigation, Heart, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface DiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
  onSaveFavorite: (id: number, type: string) => void;
  onConfirmVisit: (id: number, type: string) => void;
}

export const DiceModal: React.FC<DiceModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail,
  onSaveFavorite,
  onConfirmVisit
}) => {
  const [mode, setMode] = useState<'Food' | 'Explore' | 'Events' | 'Surprise Me'>('Food');
  const [isRolling, setIsRolling] = useState(false);
  const [reelText, setReelText] = useState('DICE READY');
  const [result, setResult] = useState<any | null>(null);
  const [allowFamiliar, setAllowFamiliar] = useState(false);

  if (!isOpen) return null;

  const handleRoll = async () => {
    setIsRolling(true);
    setResult(null);

    // Rapid reel simulation
    const dummyNames = [
      "Kakatiya Deluxe Mess", "Waddepally Lake", "The Coffee Cup", "Warangal Fort",
      "Subash Biryani", "Padmakshi Temple", "Bhadrakali Promenade", "Hunter Road Drive-in",
      "Chai Kafi Adda", "Inavolu Temple", "Urban Grill", "Asian Sridevi Mall"
    ];

    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      sound.playRollTick(250 + ticks * 25);
      setReelText(dummyNames[ticks % dummyNames.length]);
      if (ticks > 18) {
        clearInterval(interval);
      }
    }, 90);

    try {
      const data = await api.rollDice(mode, undefined, undefined, allowFamiliar);
      setTimeout(() => {
        clearInterval(interval);
        setResult(data);
        setIsRolling(false);
        sound.playJackpot();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 1800);
    } catch (err) {
      clearInterval(interval);
      setIsRolling(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="bg-arcade-card w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-5 relative scanlines overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 z-30"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-arcade-pink tracking-widest uppercase">
            REMOVE DECISION FATIGUE
          </div>
          <h2 className="font-pixel text-lg text-arcade-yellow mt-0.5">
            🎲 DICE & GO
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Stop arguing. Let the dice decide.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {!result && (
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12111A] rounded-xl border border-gray-800 mb-5">
            {(['Food', 'Explore', 'Events', 'Surprise Me'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { sound.playClick(); setMode(m); }}
                className={`py-2 px-1 text-[11px] font-heading font-bold rounded-lg transition-colors ${
                  mode === m
                    ? 'bg-arcade-yellow text-black shadow-retro-sm'
                    : 'text-gray-400 hover:text-white'
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
          <div className="my-8 text-center py-6 bg-[#12111A] rounded-xl border-2 border-black shadow-retro">
            <div className="text-5xl mb-3 animate-[spin_0.8s_linear_infinite]">
              🎲
            </div>
            <div className="font-pixel text-xs text-arcade-yellow animate-pulse">
              {reelText}
            </div>
            <div className="text-[10px] text-arcade-cyan font-mono mt-2">
              CONSULTING WARANGAL SPIRITS...
            </div>
          </div>
        )}

        {/* Not Rolling & No Result yet: Arcade Trigger */}
        {!isRolling && !result && (
          <div className="my-6 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-arcade-yellow to-amber-500 rounded-2xl border-3 border-black shadow-retro-lg flex items-center justify-center text-5xl mb-5 hover:rotate-6 transition-transform cursor-pointer" onClick={handleRoll}>
              🎲
            </div>

            <button
              onClick={handleRoll}
              className="w-full py-4 bg-arcade-yellow hover:bg-yellow-400 text-black font-pixel text-xs tracking-wider uppercase rounded-xl retro-btn shadow-retro-lg flex items-center justify-center gap-2"
            >
              ROLL THE DICE ⚡
            </button>

            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="allowFamiliar"
                checked={allowFamiliar}
                onChange={(e) => setAllowFamiliar(e.target.checked)}
                className="accent-arcade-yellow cursor-pointer"
              />
              <label htmlFor="allowFamiliar" className="text-[11px] text-gray-400 font-mono cursor-pointer">
                Allow familiar / repeated spots
              </label>
            </div>
          </div>
        )}

        {/* Result Card Reveal */}
        {!isRolling && result && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Punchline Header */}
            <div className="bg-arcade-pink text-white text-[11px] font-pixel text-center py-1.5 px-2 rounded-lg border-2 border-black shadow-retro-sm mb-3">
              {result.punchline}
            </div>

            {/* Main Result Box */}
            <div className="bg-[#12111A] p-4 rounded-xl border-2 border-black shadow-retro mb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-arcade-yellow/20 text-arcade-yellow border border-arcade-yellow/40 rounded">
                    {result.place_type.toUpperCase()} • {result.selected_place.category}
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-white mt-1">
                    {result.selected_place.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    📍 {result.selected_place.area || "Warangal"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold text-sm">
                    ★ {result.selected_place.rating || "4.5"}
                  </span>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {result.distance_km} km away
                  </div>
                </div>
              </div>

              {/* Why selected */}
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-arcade-cyan font-heading italic">
                "{result.why_selected}"
              </div>

              {result.selected_place.best_known_for && (
                <div className="mt-2 text-xs text-gray-300 font-mono">
                  <span className="text-arcade-yellow font-bold">Best known for:</span> {result.selected_place.best_known_for}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <a
                href={result.selected_place.maps_url || `https://maps.google.com/?q=${result.selected_place.latitude},${result.selected_place.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-arcade-yellow hover:bg-yellow-400 text-black font-heading font-bold text-xs rounded-xl retro-btn flex items-center justify-center gap-1.5 text-center"
              >
                <Navigation size={14} /> Navigate 📍
              </a>

              <button
                onClick={() => {
                  sound.playStamp();
                  onConfirmVisit(result.selected_place.id, result.place_type);
                }}
                className="py-2.5 bg-arcade-green hover:bg-emerald-400 text-black font-heading font-bold text-xs rounded-xl retro-btn flex items-center justify-center gap-1.5"
              >
                ✓ I Went Here 🎉
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onSaveFavorite(result.selected_place.id, result.place_type);
                }}
                className="py-2 bg-gray-800 hover:bg-gray-700 text-white font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5"
              >
                <Heart size={14} className="text-arcade-pink" /> Save ❤️
              </button>

              <button
                onClick={handleRoll}
                className="py-2 bg-gray-800 hover:bg-gray-700 text-arcade-cyan font-heading font-bold text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} /> Roll Again 🎲
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
