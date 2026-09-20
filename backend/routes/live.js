import express from 'express';
import { store } from '../db/store.js';
import { buildLiveState } from '../services/liveState.js';
import { bus } from '../services/bus.js';
import { requireRole } from './auth.js';

export const liveRouter = express.Router();

// GET /api/events/:id/live - Snapshot for polling fallback
liveRouter.get('/events/:id/live', (req, res) => {
  const liveState = buildLiveState(req.params.id);
  if (!liveState) return res.status(404).json({ message: 'Event not found' });
  res.json(liveState);
});

// GET /api/events/:id/stream - Real-time Server-Sent Events stream
liveRouter.get('/events/:id/stream', (req, res) => {
  const eventId = req.params.id;
  const event = store.getEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send immediate initial live_state snapshot
  const initialSnapshot = buildLiveState(eventId);
  res.write(`event: live_state\ndata: ${JSON.stringify(initialSnapshot)}\n\n`);

  // Subscribe to bus updates
  const unsubscribe = bus.subscribe(eventId, ({ event: evType, data }) => {
    res.write(`event: ${evType}\ndata: ${JSON.stringify(data)}\n\n`);
  });

  // Keep-alive heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

// POST /api/events/:id/announcements - Post unexpected/operational announcement
liveRouter.post('/events/:id/announcements', requireRole('ORGANIZER', 'COORDINATOR'), (req, res) => {
  const eventId = req.params.id;
  const event = store.getEventById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const { message, severity = 'INFO' } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const update = store.appendUpdate({
    event_id: eventId,
    type: 'ANNOUNCEMENT',
    message,
    payload: { severity },
    created_by: req.user?.name || 'Stage Coordinator'
  });

  const liveState = buildLiveState(eventId);
  bus.publish(eventId, 'live_state', liveState);
  bus.publish(eventId, 'update', update);

  res.status(201).json({ update, live_state: liveState });
});

// GET /api/events/:id/updates - Update feed with optional ?since=
liveRouter.get('/events/:id/updates', (req, res) => {
  const updates = store.getUpdates(req.params.id, req.query.since);
  res.json(updates);
});
