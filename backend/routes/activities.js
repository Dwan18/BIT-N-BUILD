import express from 'express';
import { store } from '../db/store.js';
import { recompute } from '../services/scheduler.js';
import { buildLiveState } from '../services/liveState.js';
import { bus } from '../services/bus.js';
import { requireRole } from './auth.js';

export const activitiesRouter = express.Router();

function broadcastEventChange(eventId, updateItem = null) {
  let activities = store.getActivities(eventId);
  activities = recompute(activities);
  // persist the computed times back
  activities.forEach(a => {
    store.updateActivity(a.id, {
      computed_start: a.computed_start,
      computed_end: a.computed_end
    });
  });

  const liveState = buildLiveState(eventId);
  bus.publish(eventId, 'live_state', liveState);
  if (updateItem) {
    bus.publish(eventId, 'update', updateItem);
  }
  return liveState;
}

// POST /api/events/:id/activities - Add activity
activitiesRouter.post('/events/:id/activities', requireRole('ORGANIZER'), (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const activity = store.createActivity({
    ...req.body,
    event_id: event.id
  });

  const update = store.appendUpdate({
    event_id: event.id,
    activity_id: activity.id,
    type: 'TIME_CHANGE',
    message: `Added new session: "${activity.title}" at ${activity.planned_start}`,
    created_by: req.user?.name || 'Organizer'
  });

  const liveState = broadcastEventChange(event.id, update);
  res.status(201).json({ activity, live_state: liveState });
});

// PUT /api/activities/:id - Edit activity
activitiesRouter.put('/activities/:id', requireRole('ORGANIZER'), (req, res) => {
  const existing = store.getActivityById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Activity not found' });

  const updated = store.updateActivity(req.params.id, req.body);
  const update = store.appendUpdate({
    event_id: existing.event_id,
    activity_id: existing.id,
    type: 'TIME_CHANGE',
    message: `Updated session: "${updated.title}"`,
    created_by: req.user?.name || 'Organizer'
  });

  const liveState = broadcastEventChange(existing.event_id, update);
  res.json({ activity: updated, live_state: liveState });
});

// DELETE /api/activities/:id - Delete activity
activitiesRouter.delete('/activities/:id', requireRole('ORGANIZER'), (req, res) => {
  const existing = store.getActivityById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Activity not found' });

  const eventId = existing.event_id;
  store.deleteActivity(req.params.id);

  const update = store.appendUpdate({
    event_id: eventId,
    type: 'CANCEL',
    message: `Removed session "${existing.title}" from agenda`,
    created_by: req.user?.name || 'Organizer'
  });

  const liveState = broadcastEventChange(eventId, update);
  res.json({ ok: true, live_state: liveState });
});

// POST /api/events/:id/activities/reorder - Reorder sequence
activitiesRouter.post('/events/:id/activities/reorder', requireRole('ORGANIZER'), (req, res) => {
  const { ordered_ids } = req.body;
  if (!Array.isArray(ordered_ids)) {
    return res.status(400).json({ message: 'ordered_ids array required' });
  }

  const activities = store.reorderActivities(req.params.id, ordered_ids);
  const liveState = broadcastEventChange(req.params.id);
  res.json({ activities, live_state: liveState });
});

// POST /api/activities/:id/start - Coordinator/Organizer starts activity
activitiesRouter.post('/activities/:id/start', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Complete any previous IN_PROGRESS activity
  const allActs = store.getActivities(act.event_id);
  allActs.forEach(a => {
    if (a.id !== act.id && a.status === 'IN_PROGRESS') {
      store.updateActivity(a.id, { status: 'COMPLETED', actual_end: timeString });
    }
  });

  store.updateActivity(act.id, {
    status: 'IN_PROGRESS',
    actual_start: timeString
  });

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'ACTIVITY_START',
    message: `Session Started: "${act.title}" on stage`,
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// POST /api/activities/:id/complete - Coordinator/Organizer completes activity
activitiesRouter.post('/activities/:id/complete', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  store.updateActivity(act.id, {
    status: 'COMPLETED',
    actual_end: timeString
  });

  // Promote next activity to UPCOMING
  const allActs = store.getActivities(act.event_id);
  const nextAct = allActs.find(a => a.sequence > act.sequence && !['COMPLETED', 'CANCELLED', 'POSTPONED'].includes(a.status));
  if (nextAct && nextAct.status === 'SCHEDULED') {
    store.updateActivity(nextAct.id, { status: 'UPCOMING' });
  }

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'ACTIVITY_COMPLETE',
    message: `Completed session: "${act.title}"`,
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// POST /api/activities/:id/delay - Coordinator/Organizer reports delay (The Wow Moment!)
activitiesRouter.post('/activities/:id/delay', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  if (act.status === 'COMPLETED') {
    return res.status(409).json({ message: 'Cannot apply delay to a COMPLETED activity' });
  }

  const delayMin = Math.max(0, Number(req.body.delay_min) || 0);
  const reason = req.body.reason || 'speaker in transit';

  store.updateActivity(act.id, {
    delay_min: delayMin,
    status: 'DELAYED'
  });

  // Flag scripts for this activity as stale
  store.markScriptsStale(act.event_id, act.id, 'delay_reported');

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'DELAY',
    message: `${act.title} delayed by ${delayMin} minutes`,
    reason,
    payload: { delay_min: delayMin },
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// POST /api/activities/:id/cancel - Coordinator/Organizer cancels activity
activitiesRouter.post('/activities/:id/cancel', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const reason = req.body.reason || 'Speaker absent';
  store.updateActivity(act.id, { status: 'CANCELLED' });
  store.markScriptsStale(act.event_id, null, 'schedule_cancelled');

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'CANCEL',
    message: `Cancelled: "${act.title}"`,
    reason,
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// POST /api/activities/:id/postpone - Coordinator/Organizer postpones activity
activitiesRouter.post('/activities/:id/postpone', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const reason = req.body.reason || 'Postponed to later track';
  store.updateActivity(act.id, { status: 'POSTPONED' });

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'POSTPONE',
    message: `Postponed: "${act.title}" moved to later today`,
    reason,
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// PATCH /api/activities/:id/timing - Coordinator/Organizer changes duration/break
activitiesRouter.patch('/activities/:id/timing', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const updates = {};
  if (req.body.duration_min !== undefined) updates.duration_min = Math.max(1, Number(req.body.duration_min));
  if (req.body.break_after_min !== undefined) updates.break_after_min = Math.max(0, Number(req.body.break_after_min));

  store.updateActivity(act.id, updates);

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'BREAK_CHANGE',
    message: `Timing updated for "${act.title}": ${updates.duration_min || act.duration_min} min session`,
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});

// PATCH /api/activities/:id/room - Coordinator/Organizer moves room
activitiesRouter.patch('/activities/:id/room', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const act = store.getActivityById(req.params.id);
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const oldRoom = act.room;
  const newRoom = req.body.room || 'Room B';
  store.updateActivity(act.id, { room: newRoom });

  // Stale script flag
  store.markScriptsStale(act.event_id, act.id, 'room_changed');

  const update = store.appendUpdate({
    event_id: act.event_id,
    activity_id: act.id,
    type: 'ROOM_CHANGE',
    message: `${act.title} moved from ${oldRoom} to ${newRoom}`,
    payload: { old_room: oldRoom, new_room: newRoom },
    created_by: req.user?.name || 'Coordinator'
  });

  const liveState = broadcastEventChange(act.event_id, update);
  res.json({ ok: true, activity: store.getActivityById(act.id), live_state: liveState });
});
