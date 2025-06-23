import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <div style={{ display: 'flex' , marginTop: '60px'}}>
        <AdminSidebar />
        <main style={{ padding: '1rem', flexGrow: 1 }}>
          {children}
        </main>
      </div>
    </>
  );
}
