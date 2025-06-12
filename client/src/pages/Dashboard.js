import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

export default function Dashboard() {

  return (
     <>
      <AdminNavbar />
      <div style={{ display: 'flex', marginTop: '60px' }}>
        <AdminSidebar />
        <main style={{ marginLeft: '200px', padding: '1rem', width: '100%' }}>
          <h2>Dashboard Content</h2>
        </main>
      </div>
    </>
  );
}
