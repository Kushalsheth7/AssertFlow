import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';
import './AssetDirectory.css';

const AssetDirectory = () => {
  const [db, setDb] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isRegistering, setIsRegistering] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  
  // New Asset Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const canRegister = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  const handleRegister = async (e) => {
    e.preventDefault();
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

    const newTag = `AF-${(db.assets.length + 1).toString().padStart(4, '0')}`;
    const newAsset = {
      id: Date.now().toString(),
      tag: newTag,
      name,
      categoryId,
      serialNumber,
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 0,
      condition,
      location,
      isShared,
      status: 'Available',
      photoUrl
    };
    
    const updatedDb = { ...db, assets: [...db.assets, newAsset] };
    setDb(updatedDb);
    saveDB(updatedDb);
    setIsRegistering(false);
    
    // Reset form
    setName('');
    setCategoryId('');
    setSerialNumber('');
    setCondition('Good');
    setLocation('');
    setIsShared(false);
    setPhotoFile(null);
    setUploading(false);
  };

  const filteredAssets = db.assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="asset-directory">
      <div className="page-header">
        <h1>Asset Directory</h1>
        <div className="header-actions">
          {canRegister && (
            <button className="btn primary" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Cancel' : 'Register New Asset'}
            </button>
          )}
        </div>
      </div>

      {isRegistering && (
        <div className="panel registration-panel">
          <h2>Register Asset</h2>
          <form onSubmit={handleRegister} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label>Asset Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  <option value="" disabled>Select Category</option>
                  {db.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Serial Number</label>
                <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={isShared} onChange={e => setIsShared(e.target.checked)} />
                  Is this a shared/bookable resource?
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: '1' }}>
                <label>Asset Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
            </div>
            
            <button type="submit" className="btn primary submit-btn" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Asset'}
            </button>
          </form>
        </div>
      )}

      <div className="panel filters-panel">
        <input 
          type="text" 
          placeholder="Search by name, tag, or serial..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Reserved">Reserved</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Lost">Lost</option>
          <option value="Retired">Retired</option>
          <option value="Disposed">Disposed</option>
        </select>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Name</th>
              <th>Category</th>
              <th>Serial Number</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length > 0 ? filteredAssets.map(asset => {
              const category = db.categories.find(c => c.id === asset.categoryId);
              return (
                <React.Fragment key={asset.id}>
                  <tr>
                    <td className="fw-bold">{asset.tag}</td>
                    <td>{asset.name} {asset.isShared && <span className="shared-badge">Shared</span>}</td>
                    <td>{category ? category.name : 'Unknown'}</td>
                    <td>{asset.serialNumber}</td>
                    <td>{asset.location}</td>
                    <td><span className={`status-pill ${asset.status.toLowerCase().replace(' ', '-')}`}>{asset.status}</span></td>
                    <td>
                      <button className="btn-small" onClick={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}>
                        {expandedAssetId === asset.id ? 'Close' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedAssetId === asset.id && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0 }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--hover-bg)', margin: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '48px' }}>
                           <div>
                             <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Financials</h4>
                             <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}><strong>Purchase Date:</strong> {asset.acquisitionDate || 'N/A'}</p>
                             <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}><strong>Cost:</strong> ${asset.acquisitionCost || '0'}</p>
                           </div>
                           <div>
                             <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Condition & Data</h4>
                             <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}><strong>Condition:</strong> {asset.condition || 'Good'}</p>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No assets found matching the criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetDirectory;
