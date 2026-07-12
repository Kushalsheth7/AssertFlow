const fs = require('fs');

const pages = [
  'Dashboard', 'Login', 'OrganizationSetup', 'AssetDirectory', 
  'AssetAllocation', 'ResourceBooking', 'Maintenance', 
  'Audit', 'Reports', 'ActivityLogs'
];

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div>
      <h1>${page}</h1>
      <p>Placeholder for ${page} screen.</p>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(`./src/pages/${page}.jsx`, content);
});

const layoutContent = `import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Box, ArrowRightLeft, Calendar, Wrench, ShieldCheck, BarChart3, Bell } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AssetFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/organization"><Users size={20} /> Organization Setup</Link>
          <Link to="/assets"><Box size={20} /> Asset Directory</Link>
          <Link to="/allocation"><ArrowRightLeft size={20} /> Allocation & Transfer</Link>
          <Link to="/booking"><Calendar size={20} /> Resource Booking</Link>
          <Link to="/maintenance"><Wrench size={20} /> Maintenance</Link>
          <Link to="/audit"><ShieldCheck size={20} /> Asset Audit</Link>
          <Link to="/reports"><BarChart3 size={20} /> Reports</Link>
          <Link to="/activity"><Bell size={20} /> Activity Logs</Link>
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>Welcome, User</span>
            <Link to="/login" className="logout-btn">Logout</Link>
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
`;
fs.writeFileSync('./src/components/Layout.jsx', layoutContent);

const layoutCss = `.app-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 250px;
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #334155;
}

.sidebar-header h2 {
  margin: 0;
  color: #38bdf8;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
}

.sidebar-nav a:hover {
  background-color: #334155;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  color: #ef4444;
  text-decoration: none;
  font-weight: 500;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
`;
fs.writeFileSync('./src/components/Layout.css', layoutCss);
