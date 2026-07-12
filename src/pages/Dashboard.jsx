import React, { useEffect, useState } from 'react';
import { getDB, getCurrentUser } from '../store/dataStore';
import { useNavigate } from 'react-router-dom';
import { Box, UserCheck, Wrench, CalendarCheck, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [db, setDb] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    setDb(getDB());
  }, [navigate]);

  if (!db || !currentUser) return <div>Loading...</div>;

  // Calculate KPIs
  const assetsAvailable = db.assets.filter(a => a.status === 'Available').length;
  const assetsAllocated = db.assets.filter(a => a.status === 'Allocated').length;
  const maintenanceToday = db.maintenance.filter(m => m.status === 'In Progress').length;
  const activeBookings = db.bookings.filter(b => b.status === 'Ongoing').length;
  const pendingTransfers = db.transfers.filter(t => t.status === 'Requested').length;
  
  const today = new Date().toISOString().split('T')[0];
  const upcomingReturns = db.allocations.filter(a => a.status === 'Active' && a.expectedReturnDate && a.expectedReturnDate >= today).length;
  const overdueReturns = db.allocations.filter(a => a.status === 'Active' && a.expectedReturnDate && a.expectedReturnDate < today).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="quick-actions">
          <button className="btn primary" onClick={() => navigate('/assets')}>Register Asset</button>
          <button className="btn secondary" onClick={() => navigate('/booking')}>Book Resource</button>
          <button className="btn secondary" onClick={() => navigate('/maintenance')}>Raise Maintenance</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><Box size={20} /></div>
          <div className="kpi-content">
            <h3>Assets Available</h3>
            <p className="kpi-value">{assetsAvailable}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><UserCheck size={20} /></div>
          <div className="kpi-content">
            <h3>Assets Allocated</h3>
            <p className="kpi-value">{assetsAllocated}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Wrench size={20} /></div>
          <div className="kpi-content">
            <h3>Maintenance Today</h3>
            <p className="kpi-value">{maintenanceToday}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><CalendarCheck size={20} /></div>
          <div className="kpi-content">
            <h3>Active Bookings</h3>
            <p className="kpi-value">{activeBookings}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><ArrowRightLeft size={20} /></div>
          <div className="kpi-content">
            <h3>Pending Transfers</h3>
            <p className="kpi-value">{pendingTransfers}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><Clock size={20} /></div>
          <div className="kpi-content">
            <h3>Upcoming Returns</h3>
            <p className="kpi-value">{upcomingReturns}</p>
          </div>
        </div>
        <div className="kpi-card overdue">
          <div className="kpi-icon"><AlertTriangle size={20} /></div>
          <div className="kpi-content">
            <h3>Overdue Returns</h3>
            <p className="kpi-value">{overdueReturns}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="panel">
          <h2>Recent Activity</h2>
          {db.notifications.length === 0 ? (
            <p className="text-muted">No recent activity.</p>
          ) : (
            <div className="timeline">
              {db.notifications.slice(0, 5).map(n => (
                <div key={n.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="timeline-text">{n.message}</p>
                    <span className="timeline-date">{new Date(n.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
