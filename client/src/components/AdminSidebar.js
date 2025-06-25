import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { icon: '🏠', name: 'Dashboard', linkTo: '/' },
    { icon: '📅', name: 'Calendar', linkTo: '/calendar' },
    { icon: '👥', name: 'Members', linkTo: '/members' },
    { icon: '📆', name: 'Sessions', linkTo: '/sessions' },
    { icon: '📊', name: 'Reports', linkTo: '/reports' },
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </button>
      <nav>
        {links.map(({ icon, name, linkTo }) => (
          <NavLink key={linkTo} to={linkTo} end className="nav-link">
            {icon} {!collapsed && <span className="sidebar-text">{name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
