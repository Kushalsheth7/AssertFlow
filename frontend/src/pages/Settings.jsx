import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('assetflow_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('assetflow_theme', theme);
  }, [theme]);

  const handleSave = () => {
    toast.success('Settings Saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      <div className="panel" style={{ maxWidth: '600px' }}>
        <h3>Profile Settings</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
          Configure your user interface preferences here.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Email Notifications</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: '14px' }}>Receive alerts for new maintenance requests</span>
            </div>
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Theme Preference</label>
            <select 
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', width: '200px' }}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>
        
        <button className="btn primary" style={{ marginTop: '32px' }} onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default Settings;
