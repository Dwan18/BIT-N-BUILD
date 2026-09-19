// Dummy data shaped like MongoDB documents (`_id`, ISO dates, refs as ids).
// Times are generated relative to "now" so the live session always looks live.

const minutesFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();
const daysFromNow = (d, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const summary = {
  totalEvents: { value: 48, change: '+6 this month' },
  upcomingEvents: { value: 12, change: '3 start this week' },
  liveEvents: { value: 1, change: 'Main Hall running' },
  completedEvents: { value: 33, change: '+4 this month' },
  delayedSessions: { value: 3, change: '1 needs attention' },
};

export const upcomingEvents = [
  { _id: 'evt_101', name: 'Nexus Tech Summit 2026', startDate: daysFromNow(2), venue: 'Convention Centre, Ahmedabad', speakers: 18, registrations: 1240, capacity: 1500, status: 'upcoming' },
  { _id: 'evt_102', name: 'Founders Roundtable', startDate: daysFromNow(4, 16), venue: 'The Grand Bhagwati, Vadodara', speakers: 6, registrations: 180, capacity: 200, status: 'upcoming' },
  { _id: 'evt_103', name: 'Design Systems Live', startDate: daysFromNow(9, 10), venue: 'Online · Studio B', speakers: 9, registrations: 860, capacity: 2000, status: 'scheduled' },
  { _id: 'evt_104', name: 'AgriTech Innovation Expo', startDate: daysFromNow(14, 9), venue: 'Surat Exhibition Hall', speakers: 24, registrations: 2130, capacity: 3000, status: 'scheduled' },
  { _id: 'evt_105', name: 'Youth Leadership Forum', startDate: daysFromNow(21, 11), venue: 'MSU Auditorium, Vadodara', speakers: 8, registrations: 310, capacity: 600, status: 'draft' },
];

export const liveEvent = {
  _id: 'evt_099',
  name: 'Product Futures Conference',
  venue: 'Main Hall · Stage A',
  anchor: 'Riya Mehta',
  attendeesOnline: 842,
  attendeesInRoom: 615,
  stagesLive: 2,
  status: 'live',
  currentSessionId: 'ses_3',
  nextSessionId: 'ses_4',
};

export const todayAgenda = [
  { _id: 'ses_1', title: 'Opening keynote', speaker: 'Dr. Anaya Kapoor', stage: 'Stage A', startTime: minutesFromNow(-150), endTime: minutesFromNow(-90), status: 'completed', delayMinutes: 0 },
  { _id: 'ses_2', title: 'Panel: Building for the next billion', speaker: 'Vikram Shah + 3', stage: 'Stage A', startTime: minutesFromNow(-85), endTime: minutesFromNow(-40), status: 'completed', delayMinutes: 5 },
  { _id: 'ses_3', title: 'Live demo: Adaptive stage cues', speaker: 'Neha Joshi', stage: 'Stage A', startTime: minutesFromNow(-25), endTime: minutesFromNow(20), status: 'live', delayMinutes: 0 },
  { _id: 'ses_4', title: 'Fireside chat: Scaling a product team', speaker: 'Arjun Patel', stage: 'Stage A', startTime: minutesFromNow(30), endTime: minutesFromNow(70), status: 'delayed', delayMinutes: 10 },
  { _id: 'ses_5', title: 'Workshop: Prototyping with AI', speaker: 'Sana Iqbal', stage: 'Workshop Room', startTime: minutesFromNow(90), endTime: minutesFromNow(150), status: 'scheduled', delayMinutes: 0 },
  { _id: 'ses_6', title: 'Closing remarks and awards', speaker: 'Riya Mehta', stage: 'Stage A', startTime: minutesFromNow(170), endTime: minutesFromNow(200), status: 'scheduled', delayMinutes: 0 },
];

export const recentActivity = [
  { _id: 'act_1', type: 'delay', message: 'Fireside chat pushed back by 10 minutes', actor: 'Stage manager', createdAt: minutesFromNow(-6) },
  { _id: 'act_2', type: 'speaker', message: 'Sana Iqbal confirmed for Prototyping with AI', actor: 'Speaker portal', createdAt: minutesFromNow(-22) },
  { _id: 'act_3', type: 'announcement', message: 'Lunch break announcement sent to 842 attendees', actor: 'Riya Mehta', createdAt: minutesFromNow(-48) },
  { _id: 'act_4', type: 'ai', message: 'AI Assistant drafted anchor script for Closing remarks', actor: 'AI Assistant', createdAt: minutesFromNow(-95) },
  { _id: 'act_5', type: 'event', message: 'Founders Roundtable agenda published', actor: 'Karan Desai', createdAt: minutesFromNow(-190) },
  { _id: 'act_6', type: 'live', message: 'Product Futures Conference went live', actor: 'Organizer', createdAt: minutesFromNow(-240) },
];

export const attendanceTrend = [
  { time: '9 AM', attendees: 120 },
  { time: '10 AM', attendees: 340 },
  { time: '11 AM', attendees: 610 },
  { time: '12 PM', attendees: 720 },
  { time: '1 PM', attendees: 540 },
  { time: '2 PM', attendees: 790 },
  { time: '3 PM', attendees: 842 },
];

export const sessionStatus = [
  { name: 'Completed', value: 2, key: 'completed' },
  { name: 'Live', value: 1, key: 'live' },
  { name: 'Delayed', value: 1, key: 'delayed' },
  { name: 'Scheduled', value: 2, key: 'scheduled' },
];

export const notifications = [
  { _id: 'n1', title: 'Session delayed', body: 'Fireside chat now starts 10 min late.', level: 'warning', createdAt: minutesFromNow(-6), read: false },
  { _id: 'n2', title: 'Speaker confirmed', body: 'Sana Iqbal accepted the workshop slot.', level: 'success', createdAt: minutesFromNow(-22), read: false },
  { _id: 'n3', title: 'Registrations near capacity', body: 'Founders Roundtable is 90% full.', level: 'info', createdAt: minutesFromNow(-120), read: true },
];

export const dashboardOverview = {
  summary,
  upcomingEvents,
  liveEvent,
  todayAgenda,
  recentActivity,
  attendanceTrend,
  sessionStatus,
};
