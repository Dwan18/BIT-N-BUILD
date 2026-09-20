import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { seedTechFest2026 } from './db/seed.js';
import { authRouter, authenticate } from './routes/auth.js';
import { eventsRouter } from './routes/events.js';
import { activitiesRouter } from './routes/activities.js';
import { peopleRouter } from './routes/people.js';
import { scriptsRouter } from './routes/scripts.js';
import { liveRouter } from './routes/live.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger for live debugging
app.use((req, res, next) => {
  if (!req.path.includes('/stream') && !req.path.includes('/live')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Seed data
seedTechFest2026();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'SMART_STAGE Event Operating Platform',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', authRouter);
app.use('/api', authenticate, eventsRouter);
app.use('/api', authenticate, activitiesRouter);
app.use('/api', authenticate, peopleRouter);
app.use('/api', authenticate, scriptsRouter);
app.use('/api', authenticate, liveRouter);


// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SMART_STAGE Backend is running on port ${PORT}`);
    console.log(`📡 Base API: http://localhost:${PORT}/api`);
    console.log(`⚡ Pre-seeded Demo Event Code: TF2026 (PIN: 1234)`);
    console.log(`======================================================\n`);
  });
}

export default app;
export { app };

