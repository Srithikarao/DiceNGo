import React from 'react';
import { sound } from '../services/sound';

interface QuickActionsProps {
  onOpenDice: () => void;
  onOpenFood: () => void;
  onOpenExplore: () => void;
  onOpenEvents: () => void;
  onOpenMap: () => void;
  onOpenPlanner: () => void;
  onOpenFavorites: () => void;
  onOpenCalendar: () => void;
  onOpenChallenge: () => void;
  onOpenSolo: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenDice,
  onOpenFood,
  onOpenExplore,
  onOpenEvents,
  onOpenMap,
  onOpenPlanner,
  onOpenFavorites,
  onOpenCalendar,
  onOpenChallenge,
  onOpenSolo,
}) => {
  return (
    <div className="px-4 py-2 max-w-md mx-auto">
      {/* Central Super CTA: DICE & GO with Mango Popsicle Gradient */}
      <button
        onClick={() => { sound.playClick(); onOpenDice(); }}
        className="w-full mb-3 p-4 bg-gradient-to-r from-[#F2E829] via-[#F2B949] to-[#F27430] rounded-2xl border-3 border-black shadow-retro-lg hover:shadow-retro-xl flex items-center justify-between group transition-all transform hover:-translate-y-0.5"
      >
        <div className="text-left">
          <div className="text-[10px] font-pixel text-black uppercase tracking-widest flex items-center gap-1 font-bold">
            ⚡ THE INSTANT RANDOMIZER
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-black mt-0.5">
            DICE & GO 🎲
          </h2>
          <p className="text-xs text-black font-heading font-extrabold mt-1">
            "Stop thinking. One roll, let's go."
          </p>
        </div>
        <div className="text-4xl sm:text-5xl transform group-hover:rotate-12 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          🥭
        </div>
      </button>

      {/* Main 3 Section Pills in Mango Popsicle Hues */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Food */}
        <button
          onClick={() => { sound.playClick(); onOpenFood(); }}
          className="p-3 bg-[#F27430]/15 hover:bg-[#F27430]/30 border-2 border-[#F27430] rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🍜</div>
          <div className="font-heading font-extrabold text-xs text-[#F27430]">FOOD</div>
          <div className="text-[9px] text-[#EDD377] font-mono">315 spots</div>
        </button>

        {/* Explore */}
        <button
          onClick={() => { sound.playClick(); onOpenExplore(); }}
          className="p-3 bg-[#F2B949]/15 hover:bg-[#F2B949]/30 border-2 border-[#F2B949] rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🌅</div>
          <div className="font-heading font-extrabold text-xs text-[#F2B949]">EXPLORE</div>
          <div className="text-[9px] text-[#EDD377] font-mono">108 places</div>
        </button>

        {/* Events */}
        <button
          onClick={() => { sound.playClick(); onOpenEvents(); }}
          className="p-3 bg-[#EDD377]/15 hover:bg-[#EDD377]/30 border-2 border-[#EDD377] rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎟️</div>
          <div className="font-heading font-extrabold text-xs text-[#EDD377]">EVENTS</div>
          <div className="text-[9px] text-gray-300 font-mono">12 on deck</div>
        </button>
      </div>

      {/* Supporting Action Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* AI Planner */}
        <button
          onClick={() => { sound.playClick(); onOpenPlanner(); }}
          className="p-3 bg-[#241b12] hover:bg-[#302419] border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#F2B949]">AI PLANNER</div>
            <div className="text-[10px] text-gray-400 font-mono">Plan it for me</div>
          </div>
        </button>

        {/* Take a Challenge */}
        <button
          onClick={() => { sound.playClick(); onOpenChallenge(); }}
          className="p-3 bg-[#241b12] hover:bg-[#302419] border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">💸</span>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#EDD377]">BUDGET ₹</div>
            <div className="text-[10px] text-gray-400 font-mono">Damage limit</div>
          </div>
        </button>

        {/* Map */}
        <button
          onClick={() => { sound.playClick(); onOpenMap(); }}
          className="p-3 bg-[#241b12] hover:bg-[#302419] border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#F2E829]">CITY MAP</div>
            <div className="text-[10px] text-gray-400 font-mono">Interactive Pins</div>
          </div>
        </button>

        {/* Solo Mode */}
        <button
          onClick={() => { sound.playClick(); onOpenSolo(); }}
          className="p-3 bg-[#241b12] hover:bg-[#302419] border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🧍</span>
          <div>
            <div className="font-heading font-extrabold text-xs text-[#F27430]">SOLO MODE</div>
            <div className="text-[10px] text-gray-400 font-mono">Why wait?</div>
          </div>
        </button>
      </div>
    </div>
  );
};
