import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveState } from '../../hooks/useLiveState';
import { peopleApi } from '../../services/api';
import { FileText, User, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

export default function EventBrief() {
  const { eventId, eventData } = useAuth();
  const { liveState } = useLiveState(eventId);

  const [people, setPeople] = useState([]);

  const event = liveState?.event || eventData;
  const agenda = liveState?.agenda || [];

  useEffect(() => {
    if (eventId) {
      peopleApi.list(eventId).then(setPeople).catch(console.error);
    }
  }, [eventId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="panel p-6 bg-white border border-slate-200">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FileText className="h-4 w-4" />
          <span>Stage Reference & Brief</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-display">
          {event?.name || 'TechFest 2026'}
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          {event?.description || 'Premier collegiate technology symposium gathering industry leaders and student innovators.'}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
            <span>{event?.date || 'Today'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-teal-600" />
            <span>{event?.venue || 'Main Auditorium'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            <span>{agenda.length} Planned Sessions</span>
          </div>
        </div>
      </div>

      {/* Speaker Profiles Directory */}
      <div className="panel p-6 bg-white border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 font-display mb-4">
          Speaker & Guest Profiles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {p.role_type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Grounded</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">
                {p.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {p.designation} {p.organization ? `· ${p.organization}` : ''}
              </p>

              {p.topic && (
                <div className="mt-2 text-xs font-medium text-slate-700">
                  <span className="text-slate-400">Topic: </span>
                  "{p.topic}"
                </div>
              )}

              {p.bio ? (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {p.bio}
                </p>
              ) : (
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  (No extended bio provided — introduce using credentials alone)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Agenda Snapshot */}
      <div className="panel p-6 bg-white border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 font-display mb-4">
          Complete Program Sequence
        </h2>

        <div className="divide-y divide-slate-100">
          {agenda.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold w-6">#{act.sequence}</span>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{act.title}</span>
                  <span className="text-slate-500">{act.person_name || 'Stage MC'} · {act.room}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-slate-800 font-bold">{act.computed_start} → {act.computed_end}</span>
                <span className="text-[10px] text-slate-400 block">{act.duration_min} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
