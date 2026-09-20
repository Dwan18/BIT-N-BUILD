import { store } from '../db/store.js';
import { recompute, computeTimingMetrics } from './scheduler.js';

export function buildLiveState(eventId) {
  const event = store.getEventById(eventId);
  if (!event) return null;

  let activities = store.getActivities(eventId);
  // Recompute cascade to ensure live timings are completely fresh
  activities = recompute(activities);

  const people = store.getPeople(eventId);
  const peopleMap = new Map(people.map(p => [p.id, p]));

  const metrics = computeTimingMetrics(event, activities);
  const updates = store.getUpdates(eventId);

  // Script flags
  const scripts = store.getScripts(eventId);
  const scriptFlags = {};
  scripts.forEach(s => {
    if (s.activity_id && s.is_stale) {
      scriptFlags[s.activity_id] = {
        stale: true,
        reason: s.stale_reason || 'schedule_updated'
      };
    }
  });

  const formatActivity = (a) => {
    if (!a) return null;
    const person = a.person_id ? peopleMap.get(a.person_id) : null;
    return {
      activity_id: a.id,
      id: a.id,
      title: a.title,
      type: a.type,
      sequence: a.sequence,
      person: person ? `${person.name} (${person.designation || person.role_type})` : (a.person_id || null),
      person_id: a.person_id,
      person_name: person ? person.name : null,
      person_role: person ? (person.designation || person.role_type) : null,
      person_topic: person ? person.topic : null,
      person_org: person ? person.organization : null,
      room: a.room || 'Main Auditorium',
      status: a.status,
      planned_start: a.planned_start,
      computed_start: a.computed_start,
      computed_end: a.computed_end,
      actual_start: a.actual_start,
      actual_end: a.actual_end,
      duration_min: a.duration_min,
      break_after_min: a.break_after_min,
      delay_min: a.delay_min || 0,
      allow_pull_forward: a.allow_pull_forward,
      notes: a.notes
    };
  };

  const currentFormatted = formatActivity(metrics.current);
  if (currentFormatted) {
    currentFormatted.remaining_sec = metrics.remainingSec;
    currentFormatted.overrun_sec = metrics.overrunSec;
  }

  const nextFormatted = formatActivity(metrics.next);

  return {
    event: {
      id: event.id,
      code: event.code,
      name: event.name,
      type: event.type,
      date: event.date,
      venue: event.venue,
      status: event.status,
      description: event.description,
      organizer_pin: event.organizer_pin
    },
    server_time: metrics.serverTime,
    drift_min: metrics.driftMin,
    current: currentFormatted,
    next: nextFormatted,
    gap_to_next_sec: metrics.gapToNextSec,
    agenda: activities.map(formatActivity),
    recent_updates: updates.slice(0, 15).map(u => ({
      id: u.id,
      type: u.type,
      message: u.message,
      reason: u.reason,
      activity_id: u.activity_id,
      created_by: u.created_by,
      created_at: u.created_at,
      payload: u.payload
    })),
    script_flags: scriptFlags
  };
}
