import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalIcon, Sparkles, Navigation, Award } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AdventureCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecap: (month: string) => void;
  onSelectDetail: (id: number, type: 'food' | 'explore' | 'event') => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AdventureCalendarModal: React.FC<AdventureCalendarModalProps> = ({
  isOpen,
  onClose,
  onOpenRecap,
  onSelectDetail
}) => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9); // September 2026
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getCalendar(year, month)
      .then(res => {
        setCalendarData(res);
        setSelectedDay(null);
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

  const firstDayWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const paddingDays = Array.from({ length: firstDayWeekday }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#241b12] w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#18130d] text-gray-400 hover:text-white p-1.5 rounded-full z-10 border border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="text-[10px] font-pixel text-[#F27430] uppercase tracking-widest font-bold">
            MY WARANGAL ADVENTURE DIARY
          </div>
          <h2 className="font-pixel text-base text-[#F2E829] mt-0.5">
            HANGOUT CALENDAR 📅 🥭
          </h2>
          <p className="text-xs text-[#EDD377] font-heading">
            Which days did you actually go out and explore?
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-[#18130d] p-2.5 rounded-xl border-2 border-black mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-300 hover:text-white font-mono text-xs flex items-center gap-1 font-bold"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="font-heading font-extrabold text-sm text-[#F2E829]">
            {monthNames[month - 1].toUpperCase()} {year}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-300 hover:text-white font-mono text-xs flex items-center gap-1 font-bold"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary Snippet */}
        {calendarData && (
          <div className="mb-3 p-3 bg-[#F2B949]/15 rounded-xl border border-[#F2B949]/40 text-xs font-mono flex items-center justify-between">
            <div className="text-gray-300">
              <span className="text-[#F2E829] font-bold">{calendarData.total_explored_days}</span> days outside • <span className="text-[#F2B949] font-bold">{calendarData.active_days?.length || 0}</span> missions
            </div>
            <button
              onClick={() => {
                sound.playJackpot();
                const mStr = `${year}-${String(month).padStart(2, '0')}`;
                onOpenRecap(mStr);
              }}
              className="text-[10px] font-heading font-extrabold text-[#F27430] hover:text-[#F2E829] flex items-center gap-1"
            >
              <Sparkles size={12} /> View Recap
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-[#18130d] p-3 rounded-2xl border-2 border-black shadow-retro mb-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-[10px] font-mono text-[#EDD377] font-bold">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {paddingDays.map(p => (
              <div key={`pad-${p}`} className="h-10 rounded-lg bg-transparent" />
            ))}

            {monthDays.map(day => {
              const isActive = calendarData?.active_days?.includes(day);
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDay(isSelected ? null : day);
                  }}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center font-mono text-xs transition-all relative ${
                    isSelected
                      ? 'border-2 border-[#F27430] shadow-retro-sm font-bold bg-[#302419]'
                      : isActive
                      ? 'bg-[#F2E829] text-black font-extrabold border border-black shadow-retro-sm'
                      : 'bg-[#241b12] text-gray-400 hover:text-white border border-black/40'
                  }`}
                >
                  <span>{day}</span>
                  {isActive && (
                    <span className="text-[8px] leading-none mt-0.5">🥭</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && calendarData?.days_data?.[selectedDay] && (
          <div className="p-3 bg-[#18130d] rounded-xl border-2 border-[#F2B949] shadow-retro animate-[fadeIn_0.2s_ease-out]">
            <div className="text-[10px] font-pixel text-[#F2E829] uppercase mb-1.5">
              ADVENTURES ON DAY {selectedDay}
            </div>
            <div className="space-y-1.5">
              {calendarData.days_data[selectedDay].map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono text-gray-200">
                  <span className="font-bold text-white truncate max-w-[200px]">{entry.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#F2B949] text-black font-bold rounded">
                    {entry.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
