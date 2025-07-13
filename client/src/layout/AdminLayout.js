import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <div style={{ marginTop: '60px'}}>
        <AdminSidebar />
        <main style={{ marginLeft: '175px', padding: '1rem', }}>
          {children}
        </main>
      </div>
    </>
  );
}
