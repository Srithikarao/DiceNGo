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
    <header className="sticky top-0 z-40 bg-[#F2B949] border-b-3 border-black shadow-retro px-4 py-3 text-black">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* LEFT: Calendar Direct Access */}
        <button
          onClick={() => { sound.playClick(); onOpenCalendar(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2E829] hover:bg-[#EDD377] text-black rounded-lg retro-btn font-heading font-black text-xs transition-colors"
          title="Open Warangal Adventure Diary"
        >
          <Calendar size={15} />
          <span className="hidden sm:inline">DIARY</span>
        </button>

        {/* CENTER: Brand Title with Mango Popsicle Vibe */}
        <div
          className="flex items-center gap-1.5 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-xl">🥭</span>
          <span className="font-pixel text-xs sm:text-sm text-black tracking-wider font-black">
            DICE & GO
          </span>
        </div>

        {/* RIGHT: Menu & Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="p-2 text-black hover:bg-[#F2E829] bg-[#EDD377] rounded-lg border-2 border-black transition-colors"
            title={muted ? "Unmute Retro Sounds" : "Mute Sounds"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={() => { sound.playClick(); setMenuOpen(!menuOpen); }}
            className="p-2 bg-[#F27430] hover:bg-[#F2E829] text-black rounded-lg retro-btn transition-colors"
            title="Menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* Slide-out Menu Dropdown */}
      {menuOpen && (
        <div className="absolute right-4 top-14 w-56 bg-[#EDD377] rounded-xl border-3 border-black shadow-retro-lg p-3 z-50 animate-[fadeIn_0.15s_ease-out] text-black">
          {currentUser && (
            <div className="px-3 py-2 mb-2 bg-[#F2E829] rounded-lg border-2 border-black">
              <div className="text-[10px] text-black font-mono uppercase tracking-wider font-extrabold">LOGGED IN AS</div>
              <div className="font-heading font-black text-sm text-black truncate">{currentUser.name}</div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenCalendar(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-[#F2B949] rounded-lg flex items-center gap-2 text-black"
            >
              <Calendar size={14} /> Adventure Diary (Calendar)
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenFavorites(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-[#F2B949] rounded-lg flex items-center gap-2 text-black"
            >
              <Heart size={14} /> My Scrapbook (Saved)
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenMap(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-[#F2B949] rounded-lg flex items-center gap-2 text-black"
            >
              <MapPin size={14} /> Warangal City Map
            </button>

            <button
              onClick={() => { sound.playClick(); setMenuOpen(false); onOpenAdmin(); }}
              className="w-full text-left px-3 py-2 text-xs font-heading font-bold hover:bg-[#F2B949] rounded-lg flex items-center gap-2 text-black"
            >
              <Shield size={14} /> Admin Panel & Excel
            </button>

            <div className="border-t-2 border-black my-1"></div>

            {currentUser ? (
              <button
                onClick={() => { sound.playClick(); setMenuOpen(false); onLogout(); }}
                className="w-full text-left px-3 py-2 text-xs font-heading font-bold bg-[#F27430] hover:bg-[#F2E829] text-black rounded-lg flex items-center gap-2 border-2 border-black"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <button
                onClick={() => { sound.playClick(); setMenuOpen(false); onOpenAuth(); }}
                className="w-full text-left px-3 py-2 text-xs font-heading font-bold bg-[#F27430] text-black hover:bg-[#F2E829] rounded-lg flex items-center gap-2 retro-btn mt-1"
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
