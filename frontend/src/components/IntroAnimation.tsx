import React, { useState, useEffect } from 'react';
import { sound } from '../services/sound';

interface IntroAnimationProps {
  onComplete: () => void;
  isReturningUser?: boolean;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, isReturningUser }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // If returning user, show a snappy 2-second brand animation
    if (isReturningUser) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2200);
      return () => clearTimeout(timer);
    }

    // First time animated sequence
    const timers = [
      setTimeout(() => { setStep(1); sound.playClick(); }, 800),   // Person 1
      setTimeout(() => { setStep(2); sound.playClick(); }, 1800),  // Person 2
      setTimeout(() => { setStep(3); sound.playClick(); }, 2800),  // Person 3
      setTimeout(() => { setStep(4); sound.playClick(); }, 3800),  // Confusion
      setTimeout(() => { setStep(5); sound.playRollTick(400); }, 4800), // Dice appears
      setTimeout(() => { setStep(6); sound.playJackpot(); }, 5800), // Let's go reveal
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [isReturningUser, onComplete]);

  if (isReturningUser) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#100f18] px-4 text-center scanlines">
        <div className="text-6xl mb-4 animate-bounce">🎲</div>
        <h1 className="font-pixel text-xl sm:text-2xl text-arcade-yellow mb-3 tracking-wider">
          DICE & GO WARANGAL
        </h1>
        <p className="text-arcade-cyan font-heading text-lg italic">
          "Where are we going today?"
        </p>
        <div className="mt-6 w-36 h-2 bg-gray-800 rounded-full overflow-hidden border border-black">
          <div className="h-full bg-arcade-pink animate-[pulse_1s_infinite] w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#12111A] p-6 text-center scanlines overflow-hidden">
      {/* Skip Button */}
      <div className="w-full flex justify-end">
        <button
          onClick={() => { sound.playClick(); onComplete(); }}
          className="text-xs font-mono uppercase bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded border border-gray-600"
        >
          Skip Intro ⏭
        </button>
      </div>

      {/* Main Animated Comic Box */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative my-4">
        {step >= 0 && step < 5 && (
          <div className="space-y-4 w-full">
            <div className="text-xs font-pixel text-arcade-yellow mb-2 tracking-widest uppercase">
              📍 Somewhere in Hanamkonda... 6:30 PM
            </div>

            {/* Speech bubble 1 */}
            {step >= 1 && (
              <div className="bg-arcade-yellow text-black font-heading font-bold p-3 rounded-lg border-2 border-black shadow-retro transform -rotate-2 animate-[fadeIn_0.3s_ease-out]">
                🍜 "Bro, biryani tindaama Kakatiya Deluxe lo?"
              </div>
            )}

            {/* Speech bubble 2 */}
            {step >= 2 && (
              <div className="bg-arcade-cyan text-black font-heading font-bold p-3 rounded-lg border-2 border-black shadow-retro transform rotate-2 animate-[fadeIn_0.3s_ease-out]">
                🌅 "Voddu ra, sunset ki Waddepally lake podam!"
              </div>
            )}

            {/* Speech bubble 3 */}
            {step >= 3 && (
              <div className="bg-arcade-pink text-white font-heading font-bold p-3 rounded-lg border-2 border-black shadow-retro transform -rotate-1 animate-[fadeIn_0.3s_ease-out]">
                🎟️ "Hunter road drive-in lo music gig undi anta!"
              </div>
            )}

            {/* Confusion state */}
            {step >= 4 && (
              <div className="bg-red-600 text-white font-pixel text-xs p-3 rounded-lg border-2 border-black shadow-retro animate-[bounce_0.5s_infinite]">
                🤯 30 MINUTES WASTED. NOBODY CAN DECIDE.
              </div>
            )}
          </div>
        )}

        {/* Dramatic Dice Transformation */}
        {step >= 5 && (
          <div className="flex flex-col items-center justify-center animate-[zoomIn_0.4s_ease-out] w-full">
            <div className="text-7xl mb-4 animate-[spin_1.5s_ease-in-out]">
              🎲
            </div>
            <div className="font-pixel text-sm text-arcade-pink mb-2 uppercase tracking-widest">
              STOP DECIDING.
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-arcade-yellow mb-4">
              LET'S GO.
            </div>
            <div className="bg-arcade-card p-4 rounded-xl border-3 border-black shadow-retro-lg max-w-xs text-center mb-6">
              <div className="text-xs text-gray-400 font-mono mb-1">Warangal • Hanamkonda • Kazipet</div>
              <h2 className="font-pixel text-lg text-white">DICE & GO</h2>
              <p className="text-arcade-cyan text-sm font-heading mt-2">
                "Stop arguing. Let the dice decide."
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="w-full max-w-sm pb-4">
        {step >= 5 ? (
          <button
            onClick={() => { sound.playJackpot(); onComplete(); }}
            className="w-full py-4 bg-arcade-yellow hover:bg-yellow-400 text-black font-pixel text-sm tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2"
          >
            LET'S ROLL 🎲
          </button>
        ) : (
          <button
            onClick={() => { setStep(5); sound.playRollTick(450); }}
            className="w-full py-3 bg-gray-800 text-arcade-cyan font-heading font-bold text-sm rounded-xl border-2 border-black shadow-retro"
          >
            Ready to roll? Tap here ⚡
          </button>
        )}
      </div>
    </div>
  );
};
