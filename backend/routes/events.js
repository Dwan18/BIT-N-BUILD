import express from 'express';
import { store } from '../db/store.js';
import { recompute } from '../services/scheduler.js';
import { buildLiveState } from '../services/liveState.js';
import { bus } from '../services/bus.js';
import { requireRole } from './auth.js';

export const eventsRouter = express.Router();

// GET /api/events - list all events
eventsRouter.get('/', (req, res) => {
  const events = store.getEvents();
  res.json(events);
});

// GET /api/events/:id - get full event details
eventsRouter.get('/:id', (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  let activities = store.getActivities(event.id);
  activities = recompute(activities);
  const people = store.getPeople(event.id);
  const users = store.getUsers(event.id);

  res.json({
    ...event,
    activities,
    people,
    users
  });
});

// PUT /api/events/:id - edit event details
eventsRouter.put('/:id', requireRole('ORGANIZER'), (req, res) => {
  const updated = store.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Event not found' });

  const liveState = buildLiveState(req.params.id);
  bus.publish(req.params.id, 'live_state', liveState);

  res.json(updated);
});

// DELETE /api/events/:id - delete event
eventsRouter.delete('/:id', requireRole('ORGANIZER'), (req, res) => {
  const success = store.deleteEvent(req.params.id);
  if (!success) return res.status(404).json({ message: 'Event not found' });
  res.json({ ok: true });
});

// POST /api/events/:id/start - DRAFT/READY -> LIVE
eventsRouter.post('/:id/start', requireRole('ORGANIZER'), (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  store.updateEvent(event.id, { status: 'LIVE' });

  // If first activity is SCHEDULED, set it to UPCOMING
  const activities = store.getActivities(event.id);
  if (activities.length > 0 && activities[0].status === 'SCHEDULED') {
    store.updateActivity(activities[0].id, { status: 'UPCOMING' });
  }

  store.appendUpdate({
    event_id: event.id,
    type: 'ANNOUNCEMENT',
    message: `${event.name} is now officially LIVE!`,
    created_by: req.user?.name || 'Lead Organizer'
  });

  const liveState = buildLiveState(event.id);
  bus.publish(event.id, 'live_state', liveState);

  res.json({ ok: true, event: store.getEventById(event.id), live_state: liveState });
});

// POST /api/events/:id/end - LIVE -> COMPLETED
eventsRouter.post('/:id/end', requireRole('ORGANIZER'), (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  store.updateEvent(event.id, { status: 'COMPLETED' });

  // Mark all active activities as COMPLETED
  const activities = store.getActivities(event.id);
  activities.forEach(a => {
    if (['IN_PROGRESS', 'UPCOMING', 'DELAYED', 'SCHEDULED'].includes(a.status)) {
      store.updateActivity(a.id, { status: 'COMPLETED', actual_end: new Date().toISOString() });
    }
  });

  store.appendUpdate({
    event_id: event.id,
    type: 'ANNOUNCEMENT',
    message: `${event.name} has concluded. All sessions completed.`,
    created_by: req.user?.name || 'Lead Organizer'
  });

  const liveState = buildLiveState(event.id);
  bus.publish(event.id, 'live_state', liveState);

  res.json({ ok: true, event: store.getEventById(event.id), live_state: liveState });
});
