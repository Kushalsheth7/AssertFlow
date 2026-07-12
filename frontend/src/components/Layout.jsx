import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Box, ArrowRightLeft, Calendar, Wrench, ShieldCheck, BarChart3, Bell, Search, Settings, Sun } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../store/dataStore';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Box size={24} color="#2563EB" />
          <h2>AssetFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
          <Link to="/organization"><Users size={18} /> Organization</Link>
          <Link to="/assets"><Box size={18} /> Assets</Link>
          <Link to="/allocation"><ArrowRightLeft size={18} /> Allocation & Transfers</Link>
          <Link to="/booking"><Calendar size={18} /> Resource Booking</Link>
          <Link to="/maintenance"><Wrench size={18} /> Maintenance</Link>
          <Link to="/audit"><ShieldCheck size={18} /> Audits</Link>
          <Link to="/reports"><BarChart3 size={18} /> Reports</Link>
          <Link to="/activity"><Bell size={18} /> Notifications</Link>
          <Link to="/settings" style={{ marginTop: 'auto' }}><Settings size={18} /> Settings</Link>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="search-box">
              <Search size={16} />
              Global Search...
              <span>Ctrl K</span>
            </div>
          </div>
          
          <div className="topbar-right">
            <button className="icon-btn" title="Theme Toggle">
              <Sun size={20} />
            </button>
            <button className="icon-btn" title="Notifications">
              <Bell size={20} />
            </button>
            
            <div className="user-info">
              <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <span>{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="logout-btn" style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
