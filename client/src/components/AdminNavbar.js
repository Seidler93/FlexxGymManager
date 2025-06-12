import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import './AdminNavbar.css';
import { FiBell } from 'react-icons/fi'; // 👈 Notification icon

export default function AdminNavbar() {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('')
    : currentUser?.email?.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="admin-navbar">
      <div className="nav-left">
        <img src="/logo192.png" alt="Logo" className="logo" />
      </div>

      <div className="nav-center">
        <input type="text" placeholder="Search clients..." className="search-input" />
      </div>

      <div className="nav-right">
        <div className="notification-icon">
          <FiBell size={20} />
        </div>

        <div className="profile-circle" onClick={() => setDropdownOpen(prev => !prev)}>
          {initials}
        </div>

        {dropdownOpen && (
          <div className="dropdown">
            <p className="name scaled-text">{currentUser?.displayName || currentUser?.email}</p>
            <button>View Account</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
