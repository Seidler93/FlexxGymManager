import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <div style={{ display: 'flex' , marginTop: '60px'}}>
        <AdminSidebar />
        <main style={{ padding: '1rem', width: '100%' }}>
          {children}
        </main>
      </div>
    </>
  );
}
