import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </button>
      <nav>
        <NavLink to="/" end className="nav-link">
          🏠 {!collapsed && <span className="sidebar-text">Dashboard</span>}
        </NavLink>
        <NavLink to="/calendar" className="nav-link">
          📅 {!collapsed && <span className="sidebar-text">Calendar</span>}
        </NavLink>
        <NavLink to="/members" className="nav-link">
          👥 {!collapsed && <span className="sidebar-text">Members</span>}
        </NavLink>
        <NavLink to="/sessions" className="nav-link">
          📆 {!collapsed && <span className="sidebar-text">Sessions</span>}
        </NavLink>
        <NavLink to="/reports" className="nav-link">
          📊 {!collapsed && <span className="sidebar-text">Reports</span>}
        </NavLink>

      </nav>
    </aside>
  );
}
