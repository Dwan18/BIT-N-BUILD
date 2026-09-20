// server/controllers/dashboardController.js
// Maps YOUR Mongoose models to the payload the React dashboard expects.
// Rename the imports and the fields in the `toX` mappers to match your schemas.
// Route: GET /api/dashboard/overview  (protect with your auth middleware)

import Event from '../models/Event.js';
import Session from '../models/Session.js';
import Activity from '../models/Activity.js'; // optional: any audit/log model
// import Attendance from '../models/Attendance.js'; // optional: for the attendance chart

// ---- Field mappers: the only place that knows your schema -----------------
const toUpcomingEvent = (e) => ({
  _id: e._id,
  name: e.title,                          // e.title -> name
  startDate: e.startDate,
  venue: e.venue,
  speakers: e.speakers?.length ?? 0,      // array of refs
  registrations: e.registrationCount ?? 0,
  capacity: e.capacity ?? 0,
  status: e.status,                       // 'upcoming' | 'scheduled' | 'draft' ...
});

const toSession = (s) => ({
  _id: s._id,
  title: s.title,
  speaker: s.speaker?.name ?? 'TBA',      // populate('speaker', 'name')
  stage: s.stage ?? 'Main stage',
  startTime: s.startTime,
  endTime: s.endTime,
  status: s.status,                       // 'completed' | 'live' | 'delayed' | 'scheduled'
  delayMinutes: s.delayMinutes ?? 0,
});

const toActivity = (a) => ({
  _id: a._id,
  type: a.type,                           // delay | speaker | announcement | ai | event | live
  message: a.message,
  actor: a.actorName ?? 'System',
  createdAt: a.createdAt,
});

// ---- Controller -----------------------------------------------------------
export async function getOverview(req, res, next) {
  try {
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
    const owner = { organizer: req.user.id }; // scope to the logged-in organizer

    const liveDoc = await Event.findOne({ ...owner, status: 'live' }).populate('anchor', 'name');

    const [
      total, upcoming, live, completed, delayedSessions,
      upcomingDocs, agendaDocs, activityDocs, statusCounts,
    ] = await Promise.all([
      Event.countDocuments(owner),
      Event.countDocuments({ ...owner, status: 'upcoming' }),
      Event.countDocuments({ ...owner, status: 'live' }),
      Event.countDocuments({ ...owner, status: 'completed' }),
      Session.countDocuments({ ...owner, status: 'delayed' }),

      Event.find({ ...owner, startDate: { $gte: now }, status: { $in: ['upcoming', 'scheduled', 'draft'] } })
        .sort({ startDate: 1 }).limit(5),

      Session.find({ ...owner, startTime: { $gte: dayStart, $lte: dayEnd } })
        .populate('speaker', 'name').sort({ startTime: 1 }),

      Activity.find(owner).sort({ createdAt: -1 }).limit(6),

      Session.aggregate([
        { $match: { organizer: req.user._id, startTime: { $gte: dayStart, $lte: dayEnd } } },
        { $group: { _id: '$status', value: { $sum: 1 } } },
      ]),
    ]);

    const todayAgenda = agendaDocs.map(toSession);
    const current = todayAgenda.find((s) => s.status === 'live');
    const next = todayAgenda.find((s) => new Date(s.startTime) > now && s.status !== 'completed');

    res.json({
      summary: {
        totalEvents: { value: total, change: '' },
        upcomingEvents: { value: upcoming, change: '' },
        liveEvents: { value: live, change: liveDoc ? `${liveDoc.title} running` : 'Nothing on air' },
        completedEvents: { value: completed, change: '' },
        delayedSessions: { value: delayedSessions, change: '' },
      },
      upcomingEvents: upcomingDocs.map(toUpcomingEvent),
      liveEvent: liveDoc && {
        _id: liveDoc._id,
        name: liveDoc.title,
        venue: liveDoc.venue,
        anchor: liveDoc.anchor?.name ?? 'Unassigned',
        attendeesOnline: liveDoc.attendeesOnline ?? 0,   // update via sockets/polling
        attendeesInRoom: liveDoc.attendeesInRoom ?? 0,
        stagesLive: liveDoc.stagesLive ?? 1,
        status: 'live',
        currentSessionId: current?._id,
        nextSessionId: next?._id,
      },
      todayAgenda,
      recentActivity: activityDocs.map(toActivity),
      attendanceTrend: [], // e.g. Attendance.aggregate() grouped by hour -> [{ time: '9 AM', attendees: 120 }]
      sessionStatus: statusCounts.map((s) => ({
        name: s._id[0].toUpperCase() + s._id.slice(1),
        key: s._id,
        value: s.value,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ---- Wiring (server/routes/dashboard.js) ----------------------------------
// import { Router } from 'express';
// import { getOverview } from '../controllers/dashboardController.js';
// import { requireAuth } from '../middleware/auth.js';
// const router = Router();
// router.get('/overview', requireAuth, getOverview);
// export default router;
//
// server.js:  app.use('/api/dashboard', dashboardRoutes);
//             app.use(cors({ origin: 'http://localhost:5173' }));
