import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';
import './AssetAllocation.css';

const AssetAllocation = () => {
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('allocate');
  
  // Allocate Form
  const [selectedAsset, setSelectedAsset] = useState('');
  const [assigneeType, setAssigneeType] = useState('employee');
  const [assigneeId, setAssigneeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [allocationError, setAllocationError] = useState('');

  // Transfer Form
  const [transferAsset, setTransferAsset] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferError, setTransferError] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager' || currentUser?.role === 'Department Head';

  const handleAllocate = (e) => {
    e.preventDefault();
    setAllocationError('');

    const asset = db.assets.find(a => a.id === selectedAsset);
    if (!asset) return;

    if (asset.status !== 'Available') {
      setAllocationError(`Asset is currently ${asset.status}. You must initiate a transfer request instead.`);
      return;
    }

    const newAllocation = {
      id: Date.now().toString(),
      assetId: asset.id,
      assignedTo: assigneeId,
      assigneeType,
      expectedReturnDate,
      status: 'Active'
    };

    const updatedDb = { ...db };
    const assetIndex = updatedDb.assets.findIndex(a => a.id === asset.id);
    updatedDb.assets[assetIndex].status = 'Allocated';
    
    updatedDb.allocations.push(newAllocation);
    
    updatedDb.notifications.push({
      id: Date.now().toString(),
      message: `Asset ${asset.tag} allocated to ${assigneeId}`,
      date: new Date().toISOString()
    });

    setDb(updatedDb);
    saveDB(updatedDb);
    
    // reset form
    setSelectedAsset('');
    setAssigneeId('');
    setExpectedReturnDate('');
  };

  const handleTransferRequest = (e) => {
    e.preventDefault();
    setTransferError('');

    const asset = db.assets.find(a => a.id === transferAsset);
    if (!asset || asset.status !== 'Allocated') {
      setTransferError('Only currently allocated assets can be transferred.');
      return;
    }

    const currentAllocation = db.allocations.find(a => a.assetId === asset.id && a.status === 'Active');
    
    const newTransfer = {
      id: Date.now().toString(),
      assetId: asset.id,
      fromId: currentAllocation?.assignedTo || 'Unknown',
      toId: transferToId,
      status: 'Requested'
    };

    const updatedDb = { ...db };
    updatedDb.transfers.push(newTransfer);
    updatedDb.notifications.push({
      id: Date.now().toString(),
      message: `Transfer requested for asset ${asset.tag} to user ${transferToId}`,
      date: new Date().toISOString()
    });

    setDb(updatedDb);
    saveDB(updatedDb);

    setTransferAsset('');
    setTransferToId('');
  };

  return (
    <div className="asset-allocation">
      <div className="page-header">
        <h1>Asset Allocation & Transfers</h1>
        <p>Manage who holds what and handle transfer requests between employees.</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'allocate' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocate')}
        >
          Allocate Asset
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          Transfer Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Active Allocations
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'allocate' && (
          <div className="panel">
            <h2>Allocate an Asset</h2>
            {allocationError && <div className="error-message">{allocationError}</div>}
            <form onSubmit={handleAllocate} className="allocation-form">
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
                <label>Assign To Type</label>
                <select value={assigneeType} onChange={e => setAssigneeType(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="department">Department</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assignee</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required>
                  <option value="" disabled>-- Select {assigneeType} --</option>
                  {assigneeType === 'employee' 
                    ? db.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                    : db.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                  }
                </select>
              </div>

              <div className="form-group">
                <label>Expected Return Date (Optional)</label>
                <input 
                  type="date" 
                  value={expectedReturnDate} 
                  onChange={e => setExpectedReturnDate(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn primary">Allocate Asset</button>
            </form>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="panel">
            <h2>Request Asset Transfer</h2>
            {transferError && <div className="error-message">{transferError}</div>}
            <form onSubmit={handleTransferRequest} className="allocation-form">
              <div className="form-group">
                <label>Select Allocated Asset</label>
                <select value={transferAsset} onChange={e => setTransferAsset(e.target.value)} required>
                  <option value="" disabled>-- Select an Asset --</option>
                  {db.assets.filter(a => a.status === 'Allocated').map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Transfer To</label>
                <select value={transferToId} onChange={e => setTransferToId(e.target.value)} required>
                  <option value="" disabled>-- Select Employee --</option>
                  {db.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn secondary">Request Transfer</button>
            </form>

            <h3 className="mt-4">Pending Transfer Requests</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.transfers.filter(t => t.status === 'Requested').map(t => {
                  const asset = db.assets.find(a => a.id === t.assetId);
                  const toUser = db.users.find(u => u.id === t.toId);
                  return (
                    <tr key={t.id}>
                      <td>{asset?.tag} - {asset?.name}</td>
                      <td>{t.fromId}</td>
                      <td>{toUser?.name}</td>
                      <td><span className="badge warning">Requested</span></td>
                      <td>
                        {canManage && (
                          <div className="action-buttons">
                            <button className="btn-small success">Approve</button>
                            <button className="btn-small danger">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="panel">
            <h2>Active Allocations</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Assigned To</th>
                  <th>Return Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.allocations.filter(a => a.status === 'Active').map(alloc => {
                  const asset = db.assets.find(a => a.id === alloc.assetId);
                  const assignee = alloc.assigneeType === 'employee' 
                    ? db.users.find(u => u.id === alloc.assignedTo)?.name 
                    : db.departments.find(d => d.id === alloc.assignedTo)?.name;
                    
                  const isOverdue = alloc.expectedReturnDate && alloc.expectedReturnDate < new Date().toISOString().split('T')[0];
                  
                  return (
                    <tr key={alloc.id}>
                      <td>{asset?.tag} - {asset?.name}</td>
                      <td>{assignee} ({alloc.assigneeType})</td>
                      <td className={isOverdue ? 'text-danger fw-bold' : ''}>
                        {alloc.expectedReturnDate || 'Indefinite'}
                        {isOverdue && ' (Overdue)'}
                      </td>
                      <td>
                        <button className="btn-small">Mark Returned</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAllocation;
