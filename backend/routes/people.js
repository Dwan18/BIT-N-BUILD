import express from 'express';
import { store } from '../db/store.js';
import { buildLiveState } from '../services/liveState.js';
import { bus } from '../services/bus.js';
import { requireRole } from './auth.js';

export const peopleRouter = express.Router();

// GET /api/events/:id/people
peopleRouter.get('/events/:id/people', (req, res) => {
  const roleType = req.query.role_type;
  const people = store.getPeople(req.params.id, roleType);
  res.json(people);
});

// POST /api/events/:id/people - Organizer can add any; Coordinator can add JURY only
peopleRouter.post('/events/:id/people', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const roleType = (req.body.role_type || 'SPEAKER').toUpperCase();
  if (req.user?.role === 'COORDINATOR' && roleType !== 'JURY') {
    return res.status(403).json({ message: 'Coordinators may only add JURY members backstage' });
  }

  const person = store.createPerson({
    ...req.body,
    role_type: roleType,
    event_id: event.id
  });

  const update = store.appendUpdate({
    event_id: event.id,
    type: 'PEOPLE_CHANGE',
    message: `Added new ${roleType.toLowerCase()}: ${person.name} (${person.designation || person.organization || ''})`,
    created_by: req.user?.name || 'Backstage Team'
  });

  const liveState = buildLiveState(event.id);
  bus.publish(event.id, 'live_state', liveState);
  bus.publish(event.id, 'update', update);

  res.status(201).json({ person, live_state: liveState });
});

// PUT /api/people/:id
peopleRouter.put('/people/:id', requireRole('ORGANIZER'), (req, res) => {
  const existing = store.getPersonById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Person not found' });

  const updated = store.updatePerson(req.params.id, req.body);
  const liveState = buildLiveState(existing.event_id);
  bus.publish(existing.event_id, 'live_state', liveState);

  res.json(updated);
});

// DELETE /api/people/:id
peopleRouter.delete('/people/:id', requireRole('ORGANIZER'), (req, res) => {
  const existing = store.getPersonById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Person not found' });

  const eventId = existing.event_id;
  store.deletePerson(req.params.id);

  const liveState = buildLiveState(eventId);
  bus.publish(eventId, 'live_state', liveState);

  res.json({ ok: true, live_state: liveState });
});
