import React, { useState, useEffect } from 'react';
import { Ticket, Heart, Calendar, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface EventsSectionProps {
  onSelectDetail: (id: number, type: 'event') => void;
  onSaveFavorite: (id: number, type: 'event') => void;
  onConfirmVisit: (id: number, type: 'event') => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  onSelectDetail,
  onSaveFavorite,
  onConfirmVisit
}) => {
  const [bucket, setBucket] = useState<'All' | 'Today' | 'This Week' | 'Coming Soon'>('All');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getEvents(bucket === 'All' ? undefined : bucket)
      .then(data => {
        if (isMounted) setEvents(data.items || []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [bucket]);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      {/* Retro Concert Ticket Header in Mango Popsicle Palette */}
      <div className="bg-gradient-to-r from-[#F27430]/35 via-[#F2B949]/25 to-[#EDD377]/15 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-[#F2E829] uppercase tracking-widest">
              GIGS, WORKSHOPS & FESTS
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              WHAT'S ON? 🎟️
            </h2>
            <p className="text-xs text-[#EDD377] font-heading mt-0.5">
              12 Live gigs, pottery, flea markets & college fests.
            </p>
          </div>
          <span className="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🎸</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#18130d] rounded-xl border-2 border-black mb-4">
        {(['All', 'Today', 'This Week', 'Coming Soon'] as const).map(b => (
          <button
            key={b}
            onClick={() => { sound.playClick(); setBucket(b); }}
            className={`py-1.5 px-1 text-[11px] font-heading font-bold rounded-lg transition-all ${
              bucket === b
                ? 'bg-[#F27430] text-black shadow-retro-sm font-extrabold translate-y-[-1px]'
                : 'text-[#EDD377] hover:text-[#F2E829]'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 font-mono text-xs text-[#EDD377]">
          Tuning stage sound check... 🎤
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-10 bg-[#241b12] rounded-2xl border-3 border-black p-6 shadow-retro">
          <div className="text-4xl mb-2">🎭</div>
          <h3 className="font-heading font-bold text-sm text-white">No events for this filter</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Check "All" to view all upcoming events.</p>
          <button
            onClick={() => setBucket("All")}
            className="mt-3 px-4 py-2 bg-[#F2B949] text-black font-heading font-extrabold text-xs rounded-xl retro-btn"
          >
            View All 12 Events
          </button>
        </div>
      )}

      {/* Event Ticket Stubs */}
      <div className="space-y-3.5">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-[#241b12] rounded-2xl border-2 border-dashed border-[#F2B949]/70 shadow-retro p-4 hover:border-[#F2E829] transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(ev.id, 'event')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18130d] text-[#F27430] border border-black rounded font-bold">
                    {ev.category}
                  </span>
                  <span className="text-[10px] text-[#F2E829] font-mono font-bold flex items-center gap-1">
                    <Calendar size={11} /> {ev.date}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-[#F2E829] transition-colors">
                  {ev.event_name}
                </h3>

                <div className="text-xs text-gray-300 font-heading mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-[#F2B949]" /> {ev.venue}, {ev.area}
                </div>

                <p className="text-xs text-gray-300 font-heading line-clamp-2 mt-1">
                  {ev.description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                  <span className="text-[#EDD377] font-bold">{ev.fee || "Free entry"}</span>
                  <span className="text-gray-400">⏰ {ev.start_time} - {ev.end_time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(ev.id, 'event'); }}
                  className="p-2 rounded-xl border-2 border-black shadow-retro-sm bg-[#18130d] hover:bg-[#302419] text-[#F27430] transition-colors"
                  title="Save Event"
                >
                  <Heart size={16} />
                </button>

                <button
                  onClick={() => { sound.playStamp(); onConfirmVisit(ev.id, 'event'); }}
                  className="px-2.5 py-1 text-[10px] font-heading font-extrabold bg-[#EDD377] hover:bg-[#F2B949] text-black rounded-lg border-2 border-black shadow-retro-sm transition-colors"
                  title="Attended"
                >
                  ATTENDED ✓
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
