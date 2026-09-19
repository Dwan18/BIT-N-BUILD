# StageFlow: Organizer Dashboard

Smart Anchor & Stage Flow Management System. React 18, Vite, Tailwind CSS 3, Recharts, React Router.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

The app runs on dummy data by default (`VITE_USE_MOCK=true`).

## Connect your Express + MongoDB backend

1. Copy `.env.example` to `.env`, set `VITE_USE_MOCK=false` and `VITE_API_URL` (or use the Vite `/api` proxy in `vite.config.js`).
2. Implement these endpoints. Shapes match `src/data/mockData.js`.

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/api/dashboard/overview` | `{ summary, upcomingEvents, liveEvent, todayAgenda, recentActivity, attendanceTrend, sessionStatus }` |
| GET | `/api/notifications` | `[{ _id, title, body, level, createdAt, read }]` |
| PATCH | `/api/notifications/read-all` | `{ ok: true }` |
| POST | `/api/events` | created event |
| POST | `/api/events/:id/start` | `{ _id, status: 'live' }` |
| POST | `/api/speakers` | created speaker |

Auth: `src/services/api.js` sends `Authorization: Bearer <token>` from `localStorage.token`. Swap in your own strategy there.

## Structure

```
src/
  components/
    layout/      Sidebar, Topbar, NotificationBell, DashboardLayout, navItems
    ui/          Card, StatCard, StatusBadge, DataTable, ProgressBar, Skeleton, Avatar, Toaster
    dashboard/   SummaryCards, LiveEventStatus, UpcomingEvents, TodayAgenda,
                 RecentActivity, QuickActions, AttendanceChart, SessionStatusChart
  context/       NotificationContext (bell list + toasts)
  data/          mockData.js
  hooks/         useApi, useNow
  pages/         Dashboard, PlaceholderPage
  services/      api.js (all fetch calls live here)
```

Sidebar modules other than Dashboard use `PlaceholderPage`. Replace each route in `src/App.jsx` as you build the real screens.
