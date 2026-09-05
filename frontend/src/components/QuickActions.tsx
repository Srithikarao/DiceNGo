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
      {/* Central Super CTA: DICE & GO */}
      <button
        onClick={() => { sound.playClick(); onOpenDice(); }}
        className="w-full mb-3 p-4 bg-gradient-to-r from-arcade-yellow via-yellow-400 to-amber-500 rounded-2xl border-3 border-black shadow-retro-lg hover:shadow-retro-xl flex items-center justify-between group transition-all"
      >
        <div className="text-left">
          <div className="text-[10px] font-pixel text-black uppercase tracking-widest flex items-center gap-1">
            ⚡ THE INSTANT RANDOMIZER
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-black mt-0.5">
            DICE & GO 🎲
          </h2>
          <p className="text-xs text-black/90 font-heading font-bold mt-1">
            "Stop thinking. One roll, let's go."
          </p>
        </div>
        <div className="text-4xl sm:text-5xl transform group-hover:rotate-12 transition-transform">
          🎲
        </div>
      </button>

      {/* Main 3 Section Pills */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Food */}
        <button
          onClick={() => { sound.playClick(); onOpenFood(); }}
          className="p-3 bg-arcade-diner/20 hover:bg-arcade-diner/30 border-2 border-arcade-diner rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🍜</div>
          <div className="font-heading font-bold text-xs text-white">FOOD</div>
          <div className="text-[9px] text-gray-300 font-mono">Feed the gang</div>
        </button>

        {/* Explore */}
        <button
          onClick={() => { sound.playClick(); onOpenExplore(); }}
          className="p-3 bg-arcade-cyan/20 hover:bg-arcade-cyan/30 border-2 border-arcade-cyan rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🌅</div>
          <div className="font-heading font-bold text-xs text-white">EXPLORE</div>
          <div className="text-[9px] text-gray-300 font-mono">Sunset spots</div>
        </button>

        {/* Events */}
        <button
          onClick={() => { sound.playClick(); onOpenEvents(); }}
          className="p-3 bg-arcade-pink/20 hover:bg-arcade-pink/30 border-2 border-arcade-pink rounded-xl text-center retro-btn group"
        >
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎟️</div>
          <div className="font-heading font-bold text-xs text-white">EVENTS</div>
          <div className="text-[9px] text-gray-300 font-mono">What's on?</div>
        </button>
      </div>

      {/* Supporting Action Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* AI Planner */}
        <button
          onClick={() => { sound.playClick(); onOpenPlanner(); }}
          className="p-3 bg-arcade-card hover:bg-gray-800 border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
          <div>
            <div className="font-heading font-bold text-xs text-arcade-cyan">AI PLANNER</div>
            <div className="text-[10px] text-gray-400 font-mono">Plan it for me</div>
          </div>
        </button>

        {/* Take a Challenge */}
        <button
          onClick={() => { sound.playClick(); onOpenChallenge(); }}
          className="p-3 bg-arcade-card hover:bg-gray-800 border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">💸</span>
          <div>
            <div className="font-heading font-bold text-xs text-arcade-green">BUDGET ₹</div>
            <div className="text-[10px] text-gray-400 font-mono">Damage limit</div>
          </div>
        </button>

        {/* Map */}
        <button
          onClick={() => { sound.playClick(); onOpenMap(); }}
          className="p-3 bg-arcade-card hover:bg-gray-800 border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
          <div>
            <div className="font-heading font-bold text-xs text-arcade-yellow">CITY MAP</div>
            <div className="text-[10px] text-gray-400 font-mono">What's near me?</div>
          </div>
        </button>

        {/* Solo Mode */}
        <button
          onClick={() => { sound.playClick(); onOpenSolo(); }}
          className="p-3 bg-arcade-card hover:bg-gray-800 border-2 border-black shadow-retro rounded-xl text-left flex items-center gap-2.5 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🧍</span>
          <div>
            <div className="font-heading font-bold text-xs text-arcade-pink">SOLO MODE</div>
            <div className="text-[10px] text-gray-400 font-mono">Why wait?</div>
          </div>
        </button>
      </div>
    </div>
  );
};
