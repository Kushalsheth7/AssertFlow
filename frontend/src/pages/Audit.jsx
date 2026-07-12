import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';

const Audit = () => {
  const [db, setDb] = useState(null);
  const [auditMode, setAuditMode] = useState(false);
  const [scannedTag, setScannedTag] = useState('');
  const [auditResults, setAuditResults] = useState([]);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    initDB().then(setDb);
  }, []);

  if (!db) return <div>Loading...</div>;

  const startAudit = () => {
    setAuditMode(true);
    setAuditResults(db.assets.map(a => ({
      ...a,
      scanned: false,
      discrepancy: null
    })));
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!scannedTag.trim()) return;

    const updatedResults = [...auditResults];
    const assetIndex = updatedResults.findIndex(a => a.tag.toLowerCase() === scannedTag.toLowerCase().trim());

    if (assetIndex !== -1) {
      updatedResults[assetIndex].scanned = true;
      updatedResults[assetIndex].discrepancy = 'Match';
    } else {
      // Asset tag not in DB
      updatedResults.push({
        id: Date.now().toString(),
        tag: scannedTag.toUpperCase(),
        name: 'Unknown Asset',
        status: 'Unknown',
        scanned: true,
        discrepancy: 'Not Found in DB'
      });
    }

    setAuditResults(updatedResults);
    setScannedTag('');
  };

  const completeAudit = () => {
    const updatedDb = { ...db };
    
    // Mark unscanned as missing
    const finalResults = auditResults.map(a => {
      if (!a.scanned && a.id) {
        return { ...a, discrepancy: 'Missing' };
      }
      return a;
    });
    
    setAuditResults(finalResults);

    // Update real DB for missing assets
    finalResults.forEach(res => {
      if (res.discrepancy === 'Missing') {
        const dbIdx = updatedDb.assets.findIndex(a => a.id === res.id);
        if (dbIdx !== -1) {
          updatedDb.assets[dbIdx].status = 'Lost';
        }
      }
    });

    updatedDb.notifications.push({
      id: Date.now().toString(),
      message: `Asset Audit completed by ${currentUser?.name}. Missing items updated to Lost.`,
      date: new Date().toISOString()
    });

    setDb(updatedDb);
    saveDB(updatedDb);
    setAuditMode(false);
  };

  const totalAssets = auditResults.filter(a => a.id).length;
  const scannedCount = auditResults.filter(a => a.scanned && a.discrepancy === 'Match').length;
  const missingCount = auditResults.filter(a => !a.scanned).length;
  const unknownCount = auditResults.filter(a => a.discrepancy === 'Not Found in DB').length;

  return (
    <div className="audit-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1>Asset Audit</h1>
        <p>Conduct physical inventory checks and generate discrepancy reports.</p>
      </div>

      {!auditMode && auditResults.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Ready to begin physical audit?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Starting an audit will lock current inventory lists and allow you to scan items.
          </p>
          <button className="btn primary" onClick={startAudit}>Start New Audit</button>
        </div>
      )}

      {auditMode && (
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="panel" style={{ flex: '1' }}>
            <h2>Scan Assets</h2>
            <form onSubmit={handleScan} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <input 
                type="text" 
                value={scannedTag} 
                onChange={e => setScannedTag(e.target.value)} 
                placeholder="Scan or enter Asset Tag (e.g. AF-101)" 
                style={{ flex: '1' }}
                autoFocus
              />
              <button type="submit" className="btn secondary">Scan</button>
            </form>
            
            <div style={{ marginTop: '32px' }}>
              <button className="btn primary" onClick={completeAudit} style={{ width: '100%' }}>
                Complete & Generate Report
              </button>
            </div>
          </div>

          <div className="panel" style={{ flex: '2' }}>
            <h2>Audit Progress</h2>
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', marginBottom: '24px' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Expected</p>
                <h3 style={{ margin: 0, fontSize: '24px' }}>{totalAssets}</h3>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Found</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--success)' }}>{scannedCount}</h3>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Unknown</p>
                <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--warning)' }}>{unknownCount}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditResults.length > 0 && !auditMode && (
        <div className="panel">
          <h2>Discrepancy Report</h2>
          <table className="data-table" style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Expected Location</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {auditResults.map((a, i) => (
                <tr key={i}>
                  <td>{a.tag}</td>
                  <td>{a.name}</td>
                  <td>{a.location || 'N/A'}</td>
                  <td>
                    <span className={`badge ${
                      a.discrepancy === 'Match' ? 'success' : 
                      a.discrepancy === 'Missing' ? 'danger' : 'warning'
                    }`}>
                      {a.discrepancy || 'Not Scanned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '24px' }}>
            <button className="btn secondary" onClick={() => setAuditResults([])}>Clear Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
