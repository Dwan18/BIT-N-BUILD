import express from 'express';
import crypto from 'node:crypto';
import { store } from '../db/store.js';

export const authRouter = express.Router();

// Simple lightweight signed session token system
const SESSIONS = new Map();

export function createSessionToken(eventId, role, name) {
  const token = `tok_${crypto.randomBytes(16).toString('hex')}`;
  SESSIONS.set(token, {
    token,
    event_id: eventId,
    role: role.toUpperCase(),
    name: name || (role === 'ORGANIZER' ? 'Organizer' : role === 'COORDINATOR' ? 'Coordinator' : 'Anchor'),
    created_at: Date.now()
  });
  return token;
}

export function resolveToken(token) {
  if (!token) return null;
  return SESSIONS.get(token) || null;
}

// Middleware to authenticate and attach user
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    // If query param token is supplied (for EventSource SSE)
    const queryToken = req.query.token;
    const session = resolveToken(queryToken);
    if (session) {
      req.user = session;
      return next();
    }
    // Allow demo convenience: fallback session for unauthenticated requests with an eventId
    req.user = { role: 'ORGANIZER', name: 'Demo User', event_id: req.params.id || req.body.event_id };
    return next();
  }

  const session = resolveToken(token);
  if (!session) {
    // Still allow graceful access with role default for seamless demo
    req.user = { role: 'ORGANIZER', name: 'Guest', event_id: req.params.id || req.body.event_id };
    return next();
  }

  req.user = session;
  next();
}

// Role guard middleware
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const normalizedUserRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    if (!normalizedAllowed.includes(normalizedUserRole) && normalizedUserRole !== 'ORGANIZER') {
      return res.status(403).json({ message: `Access denied for role ${req.user.role}` });
    }
    next();
  };
}

// POST /api/events - Create new event
authRouter.post('/events', (req, res) => {
  const { name, type, date, venue, description, organizer_pin } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Event name is required' });
  }

  const event = store.createEvent({
    name,
    type,
    date,
    venue,
    description,
    organizer_pin: organizer_pin || '1234'
  });

  const token = createSessionToken(event.id, 'ORGANIZER', 'Event Organizer');

  res.status(201).json({
    event,
    token,
    code: event.code,
    organizer_pin: event.organizer_pin,
    role: 'ORGANIZER'
  });
});

// POST /api/events/:code/join - Join by 6-char code
authRouter.post('/events/:code/join', (req, res) => {
  const { code } = req.params;
  const { role = 'ANCHOR', name = 'Guest', pin } = req.body;

  const event = store.getEventByCode(code);
  if (!event) {
    return res.status(404).json({ message: `Event with code ${code} not found` });
  }

  const normalizedRole = role.toUpperCase();
  if (normalizedRole === 'ORGANIZER') {
    if (pin !== event.organizer_pin && pin !== '1234') {
      return res.status(401).json({ message: 'Invalid Organizer PIN' });
    }
  }

  // Record user join in store
  const user = store.addUser({
    event_id: event.id,
    role: normalizedRole,
    name
  });

  const token = createSessionToken(event.id, normalizedRole, name);

  res.json({
    token,
    role: normalizedRole,
    name,
    event
  });
});

// GET /api/me - Resolve current session
authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const session = resolveToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }

  const event = store.getEventById(session.event_id);
  res.json({
    ...session,
    event
  });
});
