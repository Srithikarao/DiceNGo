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
      }, 2000);
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#EDD377] px-4 text-center text-black">
        <div className="text-6xl mb-4 animate-bounce">🥭</div>
        <h1 className="font-pixel text-xl sm:text-2xl text-black mb-3 tracking-wider font-black">
          DICE & GO WARANGAL
        </h1>
        <p className="text-black font-heading text-lg italic font-bold">
          "Where are we going today?"
        </p>
        <div className="mt-6 w-36 h-3 bg-[#F2B949] rounded-full overflow-hidden border-2 border-black">
          <div className="h-full bg-gradient-to-r from-[#F2E829] via-[#F2B949] to-[#F27430] animate-[pulse_1s_infinite] w-full border-r-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#EDD377] p-6 text-center overflow-hidden text-black">
      {/* Skip Button */}
      <div className="w-full flex justify-end">
        <button
          onClick={() => { sound.playClick(); onComplete(); }}
          className="text-xs font-mono uppercase bg-[#F2B949] hover:bg-[#F2E829] text-black px-3 py-1.5 rounded-lg border-2 border-black font-black shadow-retro-sm"
        >
          Skip Intro ⏭
        </button>
      </div>

      {/* Main Animated Comic Box in Mango Popsicle Palette */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative my-4">
        {step >= 0 && step < 5 && (
          <div className="space-y-4 w-full">
            <div className="text-xs font-pixel text-black mb-2 tracking-widest uppercase font-black">
              📍 Somewhere in Hanamkonda... 6:30 PM
            </div>

            {/* Speech bubble 1 */}
            {step >= 1 && (
              <div className="bg-[#F2E829] text-black font-heading font-black p-3.5 rounded-xl border-3 border-black shadow-retro transform -rotate-2 animate-[fadeIn_0.3s_ease-out]">
                🍜 "Bro, biryani tindaama Kakatiya Deluxe lo?"
              </div>
            )}

            {/* Speech bubble 2 */}
            {step >= 2 && (
              <div className="bg-[#F2B949] text-black font-heading font-black p-3.5 rounded-xl border-3 border-black shadow-retro transform rotate-2 animate-[fadeIn_0.3s_ease-out]">
                🌅 "Voddu ra, sunset ki Waddepally lake podam!"
              </div>
            )}

            {/* Speech bubble 3 */}
            {step >= 3 && (
              <div className="bg-[#F27430] text-black font-heading font-black p-3.5 rounded-xl border-3 border-black shadow-retro transform -rotate-1 animate-[fadeIn_0.3s_ease-out]">
                🎟️ "Hunter road drive-in lo mango dessert & music undi anta!"
              </div>
            )}

            {/* Confusion state */}
            {step >= 4 && (
              <div className="bg-[#F27430] text-black font-pixel text-xs p-3.5 rounded-xl border-3 border-black shadow-retro animate-[bounce_0.5s_infinite] font-black">
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
            <div className="font-pixel text-sm text-black mb-2 uppercase tracking-widest font-black">
              STOP DECIDING.
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-black mb-4 font-black">
              LET'S GO 🥭
            </div>
            <div className="bg-[#F2B949] p-4 rounded-xl border-3 border-black shadow-retro-lg max-w-xs text-center mb-6 text-black">
              <div className="text-xs text-black font-mono mb-1 font-bold">Warangal • Hanamkonda • Kazipet</div>
              <h2 className="font-pixel text-lg text-black font-black">DICE & GO</h2>
              <p className="text-black text-sm font-heading mt-2 font-black">
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
            className="w-full py-4 bg-[#F27430] hover:bg-[#F2E829] text-black font-pixel text-sm tracking-wider uppercase rounded-xl retro-btn flex items-center justify-center gap-2 shadow-retro-lg font-black"
          >
            LET'S ROLL 🎲
          </button>
        ) : (
          <button
            onClick={() => { setStep(5); sound.playRollTick(450); }}
            className="w-full py-3 bg-[#F2B949] text-black hover:bg-[#F2E829] font-heading font-black text-sm rounded-xl border-2 border-black shadow-retro"
          >
            Ready to roll? Tap here ⚡
          </button>
        )}
      </div>
    </div>
  );
};
