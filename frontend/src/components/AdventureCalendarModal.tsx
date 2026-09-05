import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AdventureCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecap: (month: string) => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const AdventureCalendarModal: React.FC<AdventureCalendarModalProps> = ({
  isOpen,
  onClose,
  onOpenRecap,
  onSelectDetail
}) => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9); // September
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getCalendar(year, month)
      .then(data => {
        setCalendarData(data);
        // Find today if in current month
        const todayItem = data.days.find((d: any) => d.is_today);
        if (todayItem && todayItem.is_explored) {
          setSelectedDay(todayItem);
        } else {
          const firstExplored = data.days.find((d: any) => d.is_explored);
          setSelectedDay(firstExplored || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, year, month]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    sound.playClick();
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playClick();
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  // Compute blank padding days before the 1st day of the month
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();
  const paddingDays = Array.from({ length: firstDayWeekday }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-arcade-card w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="text-[10px] font-pixel text-arcade-yellow uppercase tracking-widest">
            MY WARANGAL ADVENTURE DIARY
          </div>
          <h2 className="font-pixel text-base text-white mt-0.5">
            HANGOUT CALENDAR 📅
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Which days did you actually go out and explore?
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-[#12111A] p-2.5 rounded-xl border border-gray-800 mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-400 hover:text-white font-mono text-xs flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="font-heading font-extrabold text-sm text-arcade-yellow">
            {calendarData ? `${calendarData.month_name.toUpperCase()} ${year}` : `${month} ${year}`}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-400 hover:text-white font-mono text-xs flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary Snippet */}
        {calendarData && (
          <div className="mb-3 p-3 bg-gradient-to-r from-arcade-yellow/10 to-arcade-pink/10 rounded-xl border border-arcade-yellow/30 text-xs font-mono flex items-center justify-between">
            <div>
              <span className="text-arcade-yellow font-bold">{calendarData.total_explored_days}</span> days outside • <span className="text-arcade-cyan font-bold">{calendarData.total_places_explored}</span> spots explored
            </div>
            <button
              onClick={() => {
                sound.playJackpot();
                const mStr = `${year}-${String(month).padStart(2, '0')}`;
                onOpenRecap(mStr);
              }}
              className="text-[10px] font-heading font-bold text-arcade-pink hover:underline flex items-center gap-1"
            >
              <Sparkles size={12} /> View Recap
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-[#12111A] p-3 rounded-2xl border-2 border-black shadow-retro mb-4">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-[10px] font-mono text-gray-400 font-bold">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Padding slots */}
            {paddingDays.map(p => (
              <div key={`pad-${p}`} className="h-10"></div>
            ))}

            {/* Actual Days */}
            {calendarData && calendarData.days.map((d: any) => {
              const isSelected = selectedDay && selectedDay.date === d.date;

              return (
                <button
                  key={d.date}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDay(d);
                  }}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    d.is_explored
                      ? 'bg-arcade-yellow text-black font-extrabold border-2 border-black shadow-retro-sm hover:scale-105'
                      : d.is_today
                      ? 'border-2 border-dashed border-arcade-cyan text-arcade-cyan font-bold'
                      : 'text-gray-300 hover:bg-gray-800'
                  } ${isSelected ? 'ring-2 ring-arcade-pink' : ''}`}
                >
                  <span className="text-xs font-mono">
                    {d.is_today && d.is_explored ? `🎲 ${d.day_number}` : d.day_number}
                  </span>

                  {/* Multiple Activity Indicator Dots */}
                  {d.is_explored && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(d.visit_count, 3) }).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 bg-black rounded-full"></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Adventure Breakdown */}
        {selectedDay && selectedDay.is_explored ? (
          <div className="bg-[#12111A] p-4 rounded-xl border-2 border-black shadow-retro animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono text-arcade-green font-bold uppercase">
                  🎉 YOU WENT OUT
                </span>
                <h3 className="font-heading font-extrabold text-sm text-white">
                  {selectedDay.date}
                </h3>
              </div>
              <span className="text-xs text-arcade-yellow font-mono font-bold">
                {selectedDay.activities.length} spots visited
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {selectedDay.activities.map((act: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => onSelectDetail(act.item_id, act.item_type)}
                  className="p-2.5 bg-arcade-card hover:bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-heading font-bold text-xs text-white group-hover:text-arcade-yellow">
                      {act.item_type === 'food' && '🍜 '}
                      {act.item_type === 'explore' && '🌅 '}
                      {act.item_type === 'event' && '🎟️ '}
                      {act.place_name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {act.category} • {act.area}
                    </div>
                  </div>
                  <span className="text-[10px] text-arcade-cyan font-mono">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : selectedDay ? (
          <div className="p-4 bg-[#12111A] rounded-xl border border-gray-800 text-center font-mono text-xs text-gray-400">
            No outings recorded on {selectedDay.date}. Tap any highlighted date to view your adventure log!
          </div>
        ) : null}
      </div>
    </div>
  );
};
