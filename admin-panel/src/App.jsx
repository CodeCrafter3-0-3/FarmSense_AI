import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Cpu, Activity, Droplets, Brain,
  Bell, Settings, Search, Menu, Leaf, LogOut,
} from 'lucide-react';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import DevicesPage from './pages/DevicesPage';
import ActivityPage from './pages/ActivityPage';
import IrrigationPage from './pages/IrrigationPage';
import AIQueriesPage from './pages/AIQueriesPage';
import AlertsPage from './pages/AlertsPage';

// ── Sidebar ────────────────────────────────────────────
function Sidebar({ open, setOpen, onLogout, admin }) {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/users', icon: <Users />, label: 'Users' },
    { to: '/devices', icon: <Cpu />, label: 'ESP32 Devices' },
    { to: '/irrigation', icon: <Droplets />, label: 'Irrigation' },
    { to: '/ai-queries', icon: <Brain />, label: 'AI Queries' },
    { to: '/activity', icon: <Activity />, label: 'Activity Log' },
    { to: '/alerts', icon: <Bell />, label: 'Alerts' },
  ];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Leaf size={20} />
        </div>
        <div className="sidebar-brand-text">
          <h1>FarmSense AI</h1>
          <span>ADMIN PANEL</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">MAIN MENU</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 12 }}>SYSTEM</div>
        <button className="sidebar-link">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button className="sidebar-link" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-avatar">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="sidebar-footer-text">
            <p>{admin?.name || 'Admin'}</p>
            <span>{admin?.email || 'admin@farmsense.ai'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Header ─────────────────────────────────────────────
function Header({ onMenuToggle, onLogout, admin }) {
  const location = useLocation();

  const pageTitles = {
    '/': { title: 'Dashboard', sub: 'Overview of your farm network' },
    '/users': { title: 'Users', sub: 'Manage all registered farmers' },
    '/devices': { title: 'ESP32 Devices', sub: 'Monitor hardware modules' },
    '/irrigation': { title: 'Irrigation', sub: 'Pump controls & water usage' },
    '/ai-queries': { title: 'AI Queries', sub: 'All AI interactions across users' },
    '/activity': { title: 'Activity Log', sub: 'System-wide event history' },
    '/alerts': { title: 'Alerts', sub: 'Warnings & notifications' },
  };

  const current = pageTitles[location.pathname] || pageTitles['/'];

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-icon-btn" onClick={onMenuToggle} style={{ display: 'none' }} id="menu-toggle">
          <Menu size={18} />
        </button>
        <div className="header-title">
          <h2>{current.title}</h2>
          <span>{current.sub}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-search">
          <Search size={16} />
          <input type="text" placeholder="Search users, devices…" id="global-search" />
        </div>
        <button className="header-icon-btn" id="notifications-btn">
          <Bell size={18} />
          <span className="notif-dot"></span>
        </button>
        <button className="header-avatar-btn" onClick={onLogout} title={`Logout ${admin?.name || 'Admin'}`}>
          <img src={admin?.avatarUri || "https://www.w3schools.com/howto/img_avatar.png"} alt="Admin" />
        </button>
      </div>
    </header>
  );
}

// ── Authenticated Layout ───────────────────────────────
function AuthLayout({ onLogout, admin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout app-layout-enter">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} onLogout={onLogout} admin={admin} />
      <main className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} onLogout={onLogout} admin={admin} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/irrigation" element={<IrrigationPage />} />
          <Route path="/ai-queries" element={<AIQueriesPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── App (root) ─────────────────────────────────────────
export default function App() {
  const [admin, setAdmin] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Restore session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmsense_admin');
      if (stored) setAdmin(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogin = (adminData) => {
    // Start exit transition on login page
    setTransitioning(true);
    setTimeout(() => {
      setAdmin(adminData);
      localStorage.setItem('farmsense_admin', JSON.stringify(adminData));
      setTransitioning(false);
    }, 600); // matches CSS exit animation duration
  };

  const handleLogout = () => {
    setTransitioning(true);
    setTimeout(() => {
      setAdmin(null);
      localStorage.removeItem('farmsense_admin');
      setTransitioning(false);
    }, 400);
  };

  return (
    <BrowserRouter>
      <div className={`app-root ${transitioning ? 'app-transitioning' : ''}`}>
        {admin ? (
          <AuthLayout onLogout={handleLogout} admin={admin} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </div>
    </BrowserRouter>
  );
}
