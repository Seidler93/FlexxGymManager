import Dashboard from './Dashboard';
import SessionsPage from './SessionsPage';
import CalendarPage from './CalendarPage';
import MembersPage from './MembersPage';

export const pageRoutes = {
  '/': Dashboard, // special case for dashboard
  '/sessions': SessionsPage,
  '/calendar': CalendarPage,
  '/members': MembersPage,
};
