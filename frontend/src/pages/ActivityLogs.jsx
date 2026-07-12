import React, { useState, useEffect } from 'react';
import { getDB, initDB } from '../store/dataStore';

const ActivityLogs = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  // Sort notifications by date descending
  const sortedLogs = [...db.notifications].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1>Activity Logs & Notifications</h1>
        <p>A complete timeline of events happening in AssetFlow.</p>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        {sortedLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No activities recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {sortedLogs.map((log, index) => (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  padding: '16px 0',
                  borderBottom: index !== sortedLogs.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--primary)', 
                  borderRadius: '50%', 
                  marginTop: '6px' 
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>{log.message}</p>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(log.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
