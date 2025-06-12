import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SessionsPage from './pages/SessionsPage';
import AdminLayout from './layout/AdminLayout';

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {currentUser && (
          <>
            <Route
              path="/"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/sessions"
              element={
                <AdminLayout>
                  <SessionsPage />
                </AdminLayout>
              }
            />
          </>
        )}

        {!currentUser && (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
