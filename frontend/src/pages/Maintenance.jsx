import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';
import './Maintenance.css';

const Maintenance = () => {
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');
  
  // Request Form
  const [selectedAsset, setSelectedAsset] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const canApprove = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  const handleRequest = async (e) => {
    e.preventDefault();

    const asset = db.assets.find(a => a.id === selectedAsset);
    if (!asset) return;

    setUploading(true);
    let photoUrl = null;

    if (photoFile) {
      try {
        const { uploadFile } = await import('../store/api');
        photoUrl = await uploadFile('assets', photoFile);
      } catch (err) {
        console.error("Failed to upload photo", err);
      }
    }

    const newMaintenance = {
      id: Date.now().toString(),
      assetId: asset.id,
      requestedBy: currentUser.id,
      issue,
      priority,
      status: 'Pending',
      requestDate: new Date().toISOString(),
      photoUrl
    };

    const updatedDb = { ...db };
    updatedDb.maintenance.push(newMaintenance);
    updatedDb.notifications.push({
      id: Date.now().toString(),
      message: `Maintenance requested for asset ${asset.tag}`,
      date: new Date().toISOString()
    });

    setDb(updatedDb);
    saveDB(updatedDb);
    
    setSelectedAsset('');
    setIssue('');
    setPriority('Medium');
    setPhotoFile(null);
    setUploading(false);
    setActiveTab('kanban'); // switch to board to see it
  };

  const updateStatus = (requestId, newStatus) => {
    const updatedDb = { ...db };
    const reqIndex = updatedDb.maintenance.findIndex(m => m.id === requestId);
    if (reqIndex === -1) return;
    
    updatedDb.maintenance[reqIndex].status = newStatus;
    
    // Auto-update asset status based on workflow
    const assetId = updatedDb.maintenance[reqIndex].assetId;
    const assetIndex = updatedDb.assets.findIndex(a => a.id === assetId);
    
    if (newStatus === 'Approved') {
      updatedDb.assets[assetIndex].status = 'Under Maintenance';
    } else if (newStatus === 'Resolved') {
      updatedDb.assets[assetIndex].status = 'Available';
    }

    setDb(updatedDb);
    saveDB(updatedDb);
  };

  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

  const getCardsByStatus = (status) => {
    return db.maintenance.filter(m => m.status === status);
  };

  return (
    <div className="maintenance-management">
      <div className="page-header">
        <h1>Maintenance Management</h1>
        <p>Route repair requests through approval and track progress.</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          Kanban Board
        </button>
        <button 
          className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Raise Request
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'request' && (
          <div className="panel" style={{ maxWidth: '600px' }}>
            <h2>Raise Maintenance Request</h2>
            <form onSubmit={handleRequest} className="maintenance-form">
              <div className="form-group">
                <label>Select Asset</label>
                <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} required>
                  <option value="" disabled>-- Select an Asset --</option>
                  {db.assets.map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.status})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Issue Description</label>
                <textarea 
                  rows="4"
                  value={issue} 
                  onChange={e => setIssue(e.target.value)} 
                  required 
                  placeholder="Describe the problem in detail..."
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Issue Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>

              <button type="submit" className="btn primary mt-2" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="kanban-board">
            {columns.map(col => (
              <div key={col} className="kanban-column">
                <div className="column-header">
                  <h3>{col}</h3>
                  <span className="count">{getCardsByStatus(col).length}</span>
                </div>
                
                <div className="column-content">
                  {getCardsByStatus(col).map(req => {
                    const asset = db.assets.find(a => a.id === req.assetId);
                    const requester = db.users.find(u => u.id === req.requestedBy);
                    
                    return (
                      <div key={req.id} className="maintenance-card">
                        <div className="card-header">
                          <span className="asset-tag">{asset?.tag}</span>
                          <span className={`priority-badge ${req.priority.toLowerCase()}`}>{req.priority}</span>
                        </div>
                        <h4 className="asset-name">{asset?.name}</h4>
                        <p className="issue-text">{req.issue}</p>
                        {req.photoUrl && (
                          <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                            <img src={req.photoUrl} alt="Issue" style={{ width: '100%', borderRadius: '4px' }} />
                          </div>
                        )}
                        
                        <div className="card-footer">
                          <span className="requester">By {requester?.name}</span>
                          
                          {canManageState(col) && (
                            <select 
                              className="status-select" 
                              value={req.status}
                              onChange={(e) => updateStatus(req.id, e.target.value)}
                            >
                              {columns.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                              {col === 'Pending' && <option value="Rejected">Reject</option>}
                            </select>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {getCardsByStatus(col).length === 0 && (
                    <div className="empty-column">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function canManageState(currentState) {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') return true;
    return false; // For simplicity, only managers can drag/move cards
  }
};

export default Maintenance;
