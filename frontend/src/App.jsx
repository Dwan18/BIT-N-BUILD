import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/LandingPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import AgendaBuilder from './pages/organizer/AgendaBuilder';
import PeopleManager from './pages/organizer/PeopleManager';
import ScriptStudio from './pages/organizer/ScriptStudio';
import LiveControl from './pages/organizer/LiveControl';
import CoordinatorBoard from './pages/coordinator/CoordinatorBoard';
import StageView from './pages/anchor/StageView';
import EventBrief from './pages/anchor/EventBrief';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing Page with Quick Launch for TechFest 2026 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<LandingPage />} />

        {/* Protected Consoles inside Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          {/* Organizer Console */}
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/agenda" element={<AgendaBuilder />} />
          <Route path="/organizer/people" element={<PeopleManager />} />
          <Route path="/organizer/scripts" element={<ScriptStudio />} />
          <Route path="/organizer/live-control" element={<LiveControl />} />

          {/* Coordinator Console */}
          <Route path="/coordinator" element={<CoordinatorBoard />} />

          {/* Anchor Console */}
          <Route path="/anchor" element={<StageView />} />
          <Route path="/anchor/brief" element={<EventBrief />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
