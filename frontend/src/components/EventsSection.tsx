import React, { useState, useEffect } from 'react';
import { Ticket, Heart, Calendar, MapPin, ExternalLink, UserCheck } from 'lucide-react';
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
      {/* Retro Concert Ticket Header */}
      <div className="bg-gradient-to-r from-arcade-ticket/40 to-arcade-pink/30 p-4 rounded-2xl border-3 border-black shadow-retro-lg mb-4 relative overflow-hidden">
        <div className="washi-tape"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-pixel text-arcade-pink uppercase tracking-widest">
              GIGS, WORKSHOPS & FESTS
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-white mt-1">
              WHAT'S ON? 🎟️
            </h2>
            <p className="text-xs text-gray-300 font-heading mt-0.5">
              Live gigs, pottery, painting, cultural fests & college fests.
            </p>
          </div>
          <span className="text-4xl">🎸</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12111A] rounded-xl border border-gray-800 mb-4">
        {(['All', 'Today', 'This Week', 'Coming Soon'] as const).map(b => (
          <button
            key={b}
            onClick={() => { sound.playClick(); setBucket(b); }}
            className={`py-1.5 px-1 text-[11px] font-heading font-bold rounded-lg transition-colors ${
              bucket === b
                ? 'bg-arcade-pink text-white shadow-retro-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 font-mono text-xs text-gray-400">
          Tuning stage sound check... 🎤
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-10 bg-arcade-card rounded-2xl border-2 border-black p-6">
          <div className="text-4xl mb-2">🎭</div>
          <h3 className="font-heading font-bold text-sm text-white">Nothing scheduled right now!</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">Check "Coming Soon" or explore ongoing fests.</p>
        </div>
      )}

      {/* Event Ticket Stubs */}
      <div className="space-y-3.5">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-arcade-card rounded-2xl border-2 border-dashed border-gray-600 shadow-retro p-4 hover:border-arcade-pink transition-all relative overflow-hidden"
          >
            {/* Left vertical notch */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectDetail(ev.id, 'event')}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#12111A] text-arcade-pink border border-arcade-pink/40 rounded">
                    {ev.category}
                  </span>
                  <span className="text-[10px] text-arcade-yellow font-mono font-bold flex items-center gap-1">
                    <Calendar size={11} /> {ev.date}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-white mt-1 hover:text-arcade-pink transition-colors">
                  {ev.event_name}
                </h3>

                <div className="text-xs text-gray-300 font-heading mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-arcade-cyan" /> {ev.venue}, {ev.area}
                </div>

                <p className="text-xs text-gray-400 font-heading line-clamp-2 mt-1">
                  {ev.description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">{ev.fee || "Free entry"}</span>
                  <span className="text-gray-400">⏰ {ev.start_time} - {ev.end_time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => { sound.playClick(); onSaveFavorite(ev.id, 'event'); }}
                  className={`p-2 rounded-xl border border-black shadow-retro-sm transition-colors ${
                    ev.is_favorite ? 'bg-arcade-pink text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  title="Save Event"
                >
                  <Heart size={15} fill={ev.is_favorite ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={() => { sound.playStamp(); onConfirmVisit(ev.id, 'event'); }}
                  className="px-2.5 py-1 text-[10px] font-heading font-bold bg-arcade-green text-black rounded-lg border border-black shadow-retro-sm hover:bg-emerald-400"
                  title="Attended"
                >
                  Attended!
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
