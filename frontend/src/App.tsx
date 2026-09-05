import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IntroAnimation } from './components/IntroAnimation';
import { OnboardingModal } from './components/OnboardingModal';
import { DynamicGreeting } from './components/DynamicGreeting';
import { SearchBar } from './components/SearchBar';
import { QuickActions } from './components/QuickActions';
import { FoodSection } from './components/FoodSection';
import { ExploreSection } from './components/ExploreSection';
import { EventsSection } from './components/EventsSection';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { DiceModal } from './components/DiceModal';
import { AdventureCalendarModal } from './components/AdventureCalendarModal';
import { MonthlyRecapModal } from './components/MonthlyRecapModal';
import { AiPlannerModal } from './components/AiPlannerModal';
import { BudgetChallengeModal } from './components/BudgetChallengeModal';
import { SoloModeModal } from './components/SoloModeModal';
import { WarangalMapModal } from './components/WarangalMapModal';
import { FavoritesModal } from './components/FavoritesModal';
import { AdminModal } from './components/AdminModal';
import { api } from './services/api';
import { sound } from './services/sound';
import {
  Sparkles, Compass, Flame, MapPin, Award, CheckCircle2,
  Calendar as CalendarIcon, Utensils, Home, Heart, ShieldCheck
} from 'lucide-react';

export function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'home' | 'food' | 'explore' | 'events'>('home');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isReturning, setIsReturning] = useState(false);

  // Modal States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRecap, setShowRecap] = useState<string | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showSolo, setShowSolo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Place Detail Modal State
  const [selectedPlace, setSelectedPlace] = useState<{ id: number; type: 'food' | 'explore' | 'event' } | null>(null);

  // Dashboard Data State
  const [stats, setStats] = useState<any | null>(null);
  const [newPlaces, setNewPlaces] = useState<{ food: any[]; explore: any[] }>({ food: [], explore: [] });
  const [nearPlaces, setNearPlaces] = useState<any[]>([]);

  // Check login on startup
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsReturning(true);
      // Fetch visit stats
      api.getVisitStats().then(setStats).catch(() => {});
    }

    // Fetch New in Warangal
    api.getNewPlaces().then(setNewPlaces).catch(() => {});

    // Fetch Near You
    api.getFood({ limit: 4 }).then(res => {
      setNearPlaces(res.items?.slice(0, 4) || []);
    }).catch(() => {});
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (!currentUser) {
      setShowOnboarding(true);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    api.getVisitStats().then(setStats).catch(() => {});
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setStats(null);
  };

  const handleConfirmVisit = async (id: number, type: string) => {
    try {
      await api.recordVisit(id, type, "Direct");
      const updatedStats = await api.getVisitStats();
      setStats(updatedStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFavorite = async (id: number, type: string) => {
    try {
      await api.addFavorite(id, type);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetail = (id: number, type: 'food' | 'explore' | 'event') => {
    sound.playClick();
    setSelectedPlace({ id, type });
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} isReturningUser={isReturning} />;
  }

  return (
    <div className="min-h-screen bg-[#100f18] text-white pb-24 selection:bg-arcade-yellow selection:text-black">
      {/* Top Header */}
      <Header
        onOpenCalendar={() => setShowCalendar(true)}
        onOpenFavorites={() => setShowFavorites(true)}
        onOpenMap={() => setShowMap(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenAuth={() => setShowOnboarding(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Tab Content */}
      {currentTab === 'home' && (
        <main className="animate-[fadeIn_0.2s_ease-out]">
          {/* 1. Personalized Greeting */}
          <DynamicGreeting
            userName={currentUser?.name || "Explorer"}
            totalVisits={stats?.total_visits || 0}
          />

          {/* 2. Prominent Retro Search Bar */}
          <SearchBar onSelectPlace={openDetail} />

          {/* 3. Quick Actions & Main Dice CTA */}
          <QuickActions
            onOpenDice={() => setShowDice(true)}
            onOpenFood={() => setCurrentTab('food')}
            onOpenExplore={() => setCurrentTab('explore')}
            onOpenEvents={() => setCurrentTab('events')}
            onOpenMap={() => setShowMap(true)}
            onOpenPlanner={() => setShowPlanner(true)}
            onOpenFavorites={() => setShowFavorites(true)}
            onOpenCalendar={() => setShowCalendar(true)}
            onOpenChallenge={() => setShowChallenge(true)}
            onOpenSolo={() => setShowSolo(true)}
          />

          {/* 4. Warangal Exploration Progress Meter */}
          <div className="px-4 py-3 max-w-md mx-auto">
            <div className="bg-arcade-card p-3.5 rounded-2xl border-2 border-black shadow-retro">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-heading font-extrabold text-white flex items-center gap-1.5">
                  🗺️ EXPLORATION PROGRESS
                </span>
                <span className="font-pixel text-xs text-arcade-yellow">
                  {stats?.unlocked_percent || 12}% UNLOCKED
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#12111A] rounded-full border border-black overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-arcade-yellow via-amber-400 to-arcade-pink rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(stats?.unlocked_percent || 12, 8)}%` }}
                ></div>
              </div>

              <div className="text-[11px] text-gray-400 font-mono mt-1.5 flex items-center justify-between">
                <span>{stats?.progress_copy || "12% unlocked. Warangal still has secrets."}</span>
                <span className="text-arcade-cyan font-bold">{stats?.new_discoveries || 0} new finds</span>
              </div>
            </div>
          </div>

          {/* 5. Today's Mission */}
          <div className="px-4 py-2 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-[#1E1C2B] to-[#251B38] p-4 rounded-2xl border-2 border-arcade-pink/50 shadow-retro flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-pixel text-arcade-pink uppercase">🎯 TODAY'S MISSION</span>
                  <span className="text-[9px] bg-arcade-pink/30 text-white px-1.5 rounded font-mono">+100 PTS</span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-white mt-1">
                  Sunset & Chai Quest
                </h3>
                <p className="text-xs text-gray-300 font-heading mt-0.5">
                  Visit Waddepally or Bhadrakali Lake before 6:45 PM.
                </p>
              </div>

              <button
                onClick={() => { sound.playClick(); setCurrentTab('explore'); }}
                className="px-3 py-2 bg-arcade-pink text-white font-heading font-bold text-xs rounded-xl retro-btn hover:bg-pink-600 whitespace-nowrap"
              >
                Go 📍
              </button>
            </div>
          </div>

          {/* 6. NEW IN WARANGAL (Part 26) */}
          <div className="px-4 py-3 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-arcade-yellow" /> NEW IN WARANGAL 🆕
              </h3>
              <button
                onClick={() => setCurrentTab('food')}
                className="text-xs text-arcade-cyan font-mono hover:underline"
              >
                View all
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {newPlaces.food.map((f: any) => (
                <div
                  key={`new-f-${f.id}`}
                  onClick={() => openDetail(f.id, 'food')}
                  className="min-w-[170px] bg-arcade-card rounded-xl border-2 border-black shadow-retro-sm p-3 cursor-pointer hover:border-arcade-yellow transition-all"
                >
                  <span className="text-[9px] bg-arcade-yellow text-black font-bold px-1.5 py-0.5 rounded">
                    JUST OPENED
                  </span>
                  <h4 className="font-heading font-bold text-xs text-white mt-1.5 truncate">
                    {f.name}
                  </h4>
                  <div className="text-[10px] text-gray-400 font-mono truncate">
                    {f.category} • {f.area}
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold mt-1">
                    ★ {f.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. NEAR YOU (Part 25) */}
          <div className="px-4 py-3 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-1.5">
                <MapPin size={16} className="text-arcade-green" /> POPULAR NEAR YOU 📍
              </h3>
              <button
                onClick={() => setShowMap(true)}
                className="text-xs text-arcade-green font-mono hover:underline"
              >
                Open Map
              </button>
            </div>

            <div className="space-y-2.5">
              {nearPlaces.map((p: any) => (
                <div
                  key={`near-${p.id}`}
                  onClick={() => openDetail(p.id, 'food')}
                  className="p-3 bg-arcade-card rounded-xl border-2 border-black shadow-retro-sm flex items-center justify-between cursor-pointer hover:border-arcade-green transition-all"
                >
                  <div>
                    <h4 className="font-heading font-bold text-xs text-white">
                      {p.name}
                    </h4>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {p.category} • {p.area} • {p.best_known_for}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-xs">★ {p.rating}</span>
                    <div className="text-[10px] text-gray-400 font-mono">{p.price_range}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentTab === 'food' && (
        <main className="animate-[fadeIn_0.2s_ease-out]">
          <FoodSection
            onSelectDetail={(id) => openDetail(id, 'food')}
            onSaveFavorite={(id) => handleSaveFavorite(id, 'food')}
            onConfirmVisit={(id) => handleConfirmVisit(id, 'food')}
          />
        </main>
      )}

      {currentTab === 'explore' && (
        <main className="animate-[fadeIn_0.2s_ease-out]">
          <ExploreSection
            onSelectDetail={(id) => openDetail(id, 'explore')}
            onSaveFavorite={(id) => handleSaveFavorite(id, 'explore')}
            onConfirmVisit={(id) => handleConfirmVisit(id, 'explore')}
          />
        </main>
      )}

      {currentTab === 'events' && (
        <main className="animate-[fadeIn_0.2s_ease-out]">
          <EventsSection
            onSelectDetail={(id) => openDetail(id, 'event')}
            onSaveFavorite={(id) => handleSaveFavorite(id, 'event')}
            onConfirmVisit={(id) => handleConfirmVisit(id, 'event')}
          />
        </main>
      )}

      {/* Floating Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#12111A]/95 backdrop-blur-md border-t-3 border-black shadow-retro z-40 px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button
            onClick={() => { sound.playClick(); setCurrentTab('home'); }}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors ${
              currentTab === 'home' ? 'text-arcade-yellow font-bold bg-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home size={18} />
            <span className="text-[10px] font-heading mt-0.5">Home</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setCurrentTab('food'); }}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors ${
              currentTab === 'food' ? 'text-arcade-diner font-bold bg-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Utensils size={18} />
            <span className="text-[10px] font-heading mt-0.5">Food</span>
          </button>

          {/* Central Dice Trigger */}
          <button
            onClick={() => { sound.playClick(); setShowDice(true); }}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-arcade-yellow to-amber-500 border-3 border-black shadow-retro flex items-center justify-center text-2xl hover:rotate-12 transition-transform">
              🎲
            </div>
            <span className="text-[10px] font-pixel text-arcade-yellow mt-0.5">Roll</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setCurrentTab('explore'); }}
            className={`py-1.5 flex flex-col items-center justify-center rounded-xl transition-colors ${
              currentTab === 'explore' ? 'text-arcade-cyan font-bold bg-gray-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Compass size={18} />
            <span className="text-[10px] font-heading mt-0.5">Explore</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setShowCalendar(true); }}
            className="py-1.5 flex flex-col items-center justify-center rounded-xl text-gray-400 hover:text-white"
          >
            <CalendarIcon size={18} />
            <span className="text-[10px] font-heading mt-0.5">Diary</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSuccess={handleLoginSuccess}
      />

      <DiceModal
        isOpen={showDice}
        onClose={() => setShowDice(false)}
        onSelectDetail={(id, type) => {
          setShowDice(false);
          openDetail(id, type);
        }}
        onSaveFavorite={(id, type) => handleSaveFavorite(id, type)}
        onConfirmVisit={(id, type) => handleConfirmVisit(id, type)}
      />

      <PlaceDetailModal
        id={selectedPlace?.id || null}
        type={selectedPlace?.type || null}
        onClose={() => setSelectedPlace(null)}
        onSaveFavorite={(id, type) => handleSaveFavorite(id, type)}
        onConfirmVisit={(id, type) => handleConfirmVisit(id, type)}
      />

      <AdventureCalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onOpenRecap={(m) => {
          setShowCalendar(false);
          setShowRecap(m);
        }}
        onSelectDetail={(id, type) => {
          setShowCalendar(false);
          openDetail(id, type);
        }}
      />

      {showRecap && (
        <MonthlyRecapModal
          month={showRecap}
          isOpen={true}
          onClose={() => setShowRecap(null)}
          onSelectDetail={(id, type) => {
            setShowRecap(null);
            openDetail(id, type);
          }}
        />
      )}

      <AiPlannerModal
        isOpen={showPlanner}
        onClose={() => setShowPlanner(false)}
        onSelectDetail={(id, type) => {
          setShowPlanner(false);
          openDetail(id, type);
        }}
        onConfirmVisit={(id, type) => handleConfirmVisit(id, type)}
      />

      <BudgetChallengeModal
        isOpen={showChallenge}
        onClose={() => setShowChallenge(false)}
        onSelectDetail={(id, type) => {
          setShowChallenge(false);
          openDetail(id, type);
        }}
      />

      <SoloModeModal
        isOpen={showSolo}
        onClose={() => setShowSolo(false)}
        onSelectDetail={(id, type) => {
          setShowSolo(false);
          openDetail(id, type);
        }}
      />

      <WarangalMapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onSelectDetail={(id, type) => {
          setShowMap(false);
          openDetail(id, type);
        }}
      />

      <FavoritesModal
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        onSelectDetail={(id, type) => {
          setShowFavorites(false);
          openDetail(id, type);
        }}
        onConfirmVisit={(id, type) => handleConfirmVisit(id, type)}
      />

      <AdminModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
      />
    </div>
  );
}

export default App;
