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
        <NavLink to="/" end className="nav-link">🏠 {!collapsed && 'Dashboard'}</NavLink>
        <NavLink to="/calendar" className="nav-link">📅 {!collapsed && 'Calendar'}</NavLink>
        <NavLink to="/members" className="nav-link">👥 {!collapsed && 'Members'}</NavLink>
        <NavLink to="/sessions" className="nav-link">📆 {!collapsed && 'Sessions'}</NavLink>
        <NavLink to="/reports" className="nav-link">📊 {!collapsed && 'Reports'}</NavLink>
      </nav>
    </aside>
  );
}
