import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layout/AdminLayout';
import { pageRoutes } from './pages';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {currentUser &&
          Object.entries(pageRoutes).map(([path, Component]) => (
            <Route
              key={path}
              path={path}
              element={
                <AdminLayout>
                  <Component />
                </AdminLayout>
              }
            />
          ))}

        {!currentUser && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
