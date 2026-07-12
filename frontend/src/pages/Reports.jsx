import React, { useState, useEffect } from 'react';
import { getDB, initDB } from '../store/dataStore';

const Reports = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const totalAssets = db.assets.length;
  const availableAssets = db.assets.filter(a => a.status === 'Available').length;
  const allocatedAssets = db.assets.filter(a => a.status === 'Allocated').length;
  const maintenanceAssets = db.assets.filter(a => a.status === 'Under Maintenance').length;
  const lostAssets = db.assets.filter(a => a.status === 'Lost').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p>View asset utilization, maintenance frequency, and workflow metrics.</p>
        </div>
        <button className="btn secondary">Export Report (PDF)</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="panel">
          <h3>Asset Status Distribution</h3>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Available</span>
              <span style={{ fontWeight: 600 }}>{availableAssets}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px' }}>
              <div style={{ width: `${(availableAssets/totalAssets)*100}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Allocated</span>
              <span style={{ fontWeight: 600 }}>{allocatedAssets}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px' }}>
              <div style={{ width: `${(allocatedAssets/totalAssets)*100}%`, height: '100%', backgroundColor: 'var(--info)', borderRadius: '4px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Maintenance</span>
              <span style={{ fontWeight: 600 }}>{maintenanceAssets}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px' }}>
              <div style={{ width: `${(maintenanceAssets/totalAssets)*100}%`, height: '100%', backgroundColor: 'var(--warning)', borderRadius: '4px' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Lost/Disposed</span>
              <span style={{ fontWeight: 600 }}>{lostAssets}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px' }}>
              <div style={{ width: `${(lostAssets/totalAssets)*100}%`, height: '100%', backgroundColor: 'var(--danger)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>Most Used Assets</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Assets with highest booking frequency this month.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {db.assets.filter(a => a.isShared).slice(0, 4).map(a => (
              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span>{a.name}</span>
                <span className="badge info">High Usage</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
