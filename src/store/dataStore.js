// Simple mock database using localStorage

const INITIAL_DATA = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@assetflow.com', password: 'password', role: 'Admin', department: null, status: 'Active' },
    { id: '2', name: 'John Doe', email: 'john@assetflow.com', password: 'password', role: 'Asset Manager', department: 'd1', status: 'Active' },
    { id: '3', name: 'Jane Smith', email: 'jane@assetflow.com', password: 'password', role: 'Department Head', department: 'd1', status: 'Active' },
    { id: '4', name: 'Bob Employee', email: 'bob@assetflow.com', password: 'password', role: 'Employee', department: 'd1', status: 'Active' }
  ],
  departments: [
    { id: 'd1', name: 'Engineering', headId: '3', parentId: null, status: 'Active' },
    { id: 'd2', name: 'HR', headId: null, parentId: null, status: 'Active' }
  ],
  categories: [
    { id: 'c1', name: 'Electronics', fields: ['warranty'] },
    { id: 'c2', name: 'Furniture', fields: [] },
    { id: 'c3', name: 'Vehicles', fields: ['license_plate'] }
  ],
  assets: [
    { 
      id: 'a1', tag: 'AF-0001', name: 'MacBook Pro', categoryId: 'c1', serialNumber: 'SN12345', 
      acquisitionDate: '2023-01-15', acquisitionCost: 2000, condition: 'Good', location: 'HQ', 
      isShared: false, status: 'Available' 
    },
    { 
      id: 'a2', tag: 'AF-0002', name: 'Conference Room Projector', categoryId: 'c1', serialNumber: 'SN98765', 
      acquisitionDate: '2022-05-10', acquisitionCost: 500, condition: 'Good', location: 'Room A', 
      isShared: true, status: 'Available' 
    }
  ],
  allocations: [], // { id, assetId, assignedTo (userId/deptId), expectedReturnDate, status: 'Active'|'Returned' }
  transfers: [], // { id, assetId, fromId, toId, status: 'Requested'|'Approved'|'Rejected' }
  bookings: [], // { id, assetId, userId, startTime, endTime, status: 'Upcoming'|'Ongoing'|'Completed'|'Cancelled' }
  maintenance: [], // { id, assetId, requestedBy, issue, priority, status: 'Pending'|'Approved'|'Rejected'|'In Progress'|'Resolved' }
  audits: [], // { id, name, scope, startDate, endDate, auditors: [userIds], status: 'Open'|'Closed' }
  auditItems: [], // { auditId, assetId, status: 'Verified'|'Missing'|'Damaged' }
  notifications: [] // { id, userId, message, date, isRead: false }
};

export const getDB = () => {
  const data = localStorage.getItem('assetflow_db');
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem('assetflow_db', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

export const saveDB = (data) => {
  localStorage.setItem('assetflow_db', JSON.stringify(data));
};

export const resetDB = () => {
  localStorage.setItem('assetflow_db', JSON.stringify(INITIAL_DATA));
};

export const loginUser = (email, password) => {
  const db = getDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('assetflow_currentUser', JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid email or password');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('assetflow_currentUser');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem('assetflow_currentUser');
};
