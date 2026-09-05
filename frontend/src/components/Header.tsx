import React, { useState } from 'react';
import { Calendar, Menu, Volume2, VolumeX, Heart, Shield, LogIn, LogOut, MapPin } from 'lucide-react';
import { sound } from '../services/sound';

interface HeaderProps {
  onOpenCalendar: () => void;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  currentUser: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalendar,
  onOpenFavorites,
  onOpenMap,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const isMute = sound.toggleMute();
    setMuted(isMute);
    if (!isMute) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#12111A]/95 backdrop-blur-md border-b-3 border-black shadow-retro px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* LEFT: Calendar Direct Access */}
        <button
          onClick={() => { sound.playClick(); onOpenCalendar(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-arcade-yellow text-black rounded-lg retro-btn font-heading font-bold text-xs"
          title="Open Warangal Adventure Diary"
        >
          <Calendar size={16} />
          <span className="hidden sm:inline">DIARY</span>
        </button>

        {/* CENTER: Brand Title */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-xl">🎲</span>
          <span className="font-pixel text-xs sm:text-sm text-arcade-yellow tracking-wider">
            DICE & GO
          </span>
        </div>

        {/* RIGHT: Menu & Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 text-gray-300 hover:text-white bg-gray-800 rounded-lg border border-black"
            title={muted ? "Unmute Retro Sounds" : "Mute Sounds"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-arcade-cyan" />}
          </button>

          <button
            onClick={() => { sound.playClick(); setMenuOpen(!menuOpen); }}
            className="p-2 bg-arcade-pink text-white rounded-lg retro-btn"
            title="Menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* Slide-out Menu Dropdown */}
      {menuOpen && (
        <div className="absolute right-4 top-14 w-56 bg-arcade-card rounded-xl border-3 border-black shadow-retro-lg p-3 z-50 animate-[fadeIn_0.15s_ease-out]">
          {currentUser && (
            <div className="px-3 py-2 mb-2 bg-[#12111A] rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono">LOGGED IN AS</div>
              <div className="font-heading font-bold text-sm text-arcade-yellow truncate">{currentUser.name}</div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenCalendar(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-gray-800 rounded-lg flex items-center gap-2 text-white"
            >
              <Calendar size={14} className="text-arcade-yellow" /> Adventure Diary (Calendar)
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenFavorites(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-gray-800 rounded-lg flex items-center gap-2 text-white"
            >
              <Heart size={14} className="text-arcade-pink" /> My Scrapbook (Saved)
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenMap(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-gray-800 rounded-lg flex items-center gap-2 text-white"
            >
              <MapPin size={14} className="text-arcade-cyan" /> Warangal City Map
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenAdmin(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-gray-800 rounded-lg flex items-center gap-2 text-white"
            >
              <Shield size={14} className="text-arcade-green" /> Admin Panel & Excel
            </button>

            <div className="border-t border-gray-800 my-1"></div>

            {currentUser ? (
              <button
                onClick={() => { sound.playClick(); setMenuOpen(false); onLogout(); }}
                className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-red-950 text-red-400 rounded-lg flex items-center gap-2"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <button
                onClick={() => { sound.playClick(); setMenuOpen(false); onOpenAuth(); }}
                className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-arcade-yellow text-arcade-yellow hover:text-black rounded-lg flex items-center gap-2"
              >
                <LogIn size={14} /> Login with Mobile OTP
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
