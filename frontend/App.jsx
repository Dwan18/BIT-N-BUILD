import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

const modules = [
  { path: 'events', title: 'Events', description: 'Create, edit and publish events.', endpoint: 'GET /api/events' },
  { path: 'agenda', title: 'Agenda', description: 'Plan sessions, stages and timings.', endpoint: 'GET /api/agenda' },
  { path: 'speakers', title: 'Speakers', description: 'Manage speaker profiles and invitations.', endpoint: 'GET /api/speakers' },
  { path: 'ai-assistant', title: 'AI Assistant', description: 'Draft anchor scripts, intros and schedule fixes.', endpoint: 'POST /api/ai/assist' },
  { path: 'live-control', title: 'Live Control', description: 'Run sessions, cue speakers and shift timings live.', endpoint: 'GET /api/live/:eventId' },
  { path: 'announcements', title: 'Announcements', description: 'Send updates to attendees, speakers and staff.', endpoint: 'GET /api/announcements' },
  { path: 'analytics', title: 'Analytics', description: 'Attendance, engagement and session performance.', endpoint: 'GET /api/analytics' },
  { path: 'settings', title: 'Settings', description: 'Team, roles, branding and integrations.', endpoint: 'GET /api/settings' },
];

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        {modules.map(({ path, ...props }) => (
          <Route key={path} path={path} element={<PlaceholderPage {...props} />} />
        ))}
        <Route path="*" element={<PlaceholderPage title="Page not found" description="That address doesn't match any module." endpoint="/" />} />
      </Route>
    </Routes>
  );
}
