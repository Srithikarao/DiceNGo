import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
  onSelectDetail: _onSelectDetail
}) => {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9); // September 2026
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [_loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-md rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-10 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="text-[10px] font-pixel text-black uppercase tracking-widest font-black">
            MY WARANGAL ADVENTURE DIARY
          </div>
          <h2 className="font-pixel text-base text-black mt-0.5 font-black">
            HANGOUT CALENDAR 📅 🥭
          </h2>
          <p className="text-xs text-black font-heading font-semibold">
            Which days did you actually go out and explore?
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-[#F2B949] p-2.5 rounded-xl border-2 border-black mb-3 text-black">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-black hover:opacity-75 font-mono text-xs flex items-center gap-1 font-black"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="font-heading font-black text-sm text-black">
            {monthNames[month - 1].toUpperCase()} {year}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 text-black hover:opacity-75 font-mono text-xs flex items-center gap-1 font-black"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary Snippet */}
        {calendarData && (
          <div className="mb-3 p-3 bg-[#F2E829] rounded-xl border-2 border-black text-xs font-mono flex items-center justify-between text-black font-bold">
            <div>
              <span className="font-black">{calendarData.total_explored_days}</span> days outside • <span className="font-black">{calendarData.active_days?.length || 0}</span> missions
            </div>
            <button
              onClick={() => {
                sound.playJackpot();
                const mStr = `${year}-${String(month).padStart(2, '0')}`;
                onOpenRecap(mStr);
              }}
              className="text-[10px] font-heading font-black text-black hover:bg-[#F2B949] flex items-center gap-1 bg-[#F27430] px-2 py-0.5 rounded border border-black"
            >
              <Sparkles size={12} /> View Recap
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-[#F2B949] p-3 rounded-2xl border-3 border-black shadow-retro mb-4 text-black">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-[10px] font-mono text-black font-black">
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
                      ? 'border-3 border-black shadow-retro font-black bg-[#F2E829] text-black'
                      : isActive
                      ? 'bg-[#F27430] text-black font-black border-2 border-black shadow-retro-sm'
                      : 'bg-[#EDD377] text-black hover:bg-[#F2E829] border border-black font-bold'
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
          <div className="p-3 bg-[#F2E829] rounded-xl border-2 border-black shadow-retro animate-[fadeIn_0.2s_ease-out] text-black">
            <div className="text-[10px] font-pixel text-black uppercase mb-1.5 font-black">
              ADVENTURES ON DAY {selectedDay}
            </div>
            <div className="space-y-1.5">
              {calendarData.days_data[selectedDay].map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono text-black">
                  <span className="font-black text-black truncate max-w-[200px]">{entry.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#F27430] text-black font-black rounded border border-black">
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
