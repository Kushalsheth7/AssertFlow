import React, { useState, useEffect } from 'react';
import { getDB, initDB, saveDB, getCurrentUser } from '../store/dataStore';
import { useNavigate } from 'react-router-dom';
import './OrganizationSetup.css';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [db, setDb] = useState(null);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      // Only Admin can access
      navigate('/dashboard');
      return;
    }
    initDB().then(setDb);
  }, [navigate, currentUser]);

  if (!db) return <div>Loading...</div>;

  const promoteEmployee = (userId, newRole) => {
    const updatedDb = { ...db };
    const userIndex = updatedDb.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      updatedDb.users[userIndex].role = newRole;
      setDb(updatedDb);
      saveDB(updatedDb);
    }
  };

  return (
    <div className="org-setup">
      <div className="page-header">
        <h1>Organization Setup</h1>
        <p>Manage departments, asset categories, and the employee directory.</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Asset Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Directory
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'departments' && (
          <div className="panel">
            <h2>Departments</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.departments.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.name}</td>
                    <td><span className={`badge ${dept.status.toLowerCase()}`}>{dept.status}</span></td>
                    <td>
                      <button className="btn-small" onClick={() => {
                        const newName = prompt("Enter new department name:", dept.name);
                        if (newName && newName.trim() !== "") {
                          const updatedDb = { ...db };
                          const index = updatedDb.departments.findIndex(d => d.id === dept.id);
                          updatedDb.departments[index].name = newName.trim();
                          setDb(updatedDb);
                          saveDB(updatedDb);
                        }
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="panel">
            <h2>Asset Categories</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Custom Fields</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{cat.fields.join(', ') || 'None'}</td>
                    <td>
                      <button className="btn-small" onClick={() => {
                        const newName = prompt("Enter new category name:", cat.name);
                        if (newName && newName.trim() !== "") {
                          const updatedDb = { ...db };
                          const index = updatedDb.categories.findIndex(c => c.id === cat.id);
                          updatedDb.categories[index].name = newName.trim();
                          setDb(updatedDb);
                          saveDB(updatedDb);
                        }
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="panel">
            <h2>Employee Directory</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {db.users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="role-badge">{user.role}</span></td>
                    <td><span className={`badge ${(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span></td>
                    <td>
                      {user.role === 'Employee' && (
                        <select 
                          className="role-select" 
                          onChange={(e) => promoteEmployee(user.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Promote to...</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Asset Manager">Asset Manager</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSetup;
