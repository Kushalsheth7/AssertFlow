import { supabase } from '../lib/supabase';

const isMock = true; // FORCE MOCK DATA FOR HACKATHON

const INITIAL_DATA = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@assetflow.com', role: 'Admin', department: 'IT' },
    { id: '2', name: 'John Doe', email: 'john@assetflow.com', role: 'Employee', department: 'Engineering' },
    { id: '3', name: 'Sarah Connor', email: 'sarah@assetflow.com', role: 'Asset Manager', department: 'Operations' },
    { id: '4', name: 'Michael Scott', email: 'michael@assetflow.com', role: 'Department Head', department: 'Sales' },
    { id: '5', name: 'Dwight Schrute', email: 'dwight@assetflow.com', role: 'Employee', department: 'Sales' },
    { id: '6', name: 'Pam Beesly', email: 'pam@assetflow.com', role: 'Employee', department: 'HR' }
  ],
  assets: [
    { id: '101', tag: 'MAC-2023-01', name: 'MacBook Pro M2 14"', category: 'c1', location: 'HQ - Floor 3', status: 'Allocated', purchaseDate: '2023-01-15', cost: 2499, supplier: 'Apple Inc', isShared: false },
    { id: '102', tag: 'DEL-2022-14', name: 'Dell XPS 15', category: 'c1', location: 'HQ - Floor 2', status: 'Available', purchaseDate: '2022-08-22', cost: 1899, supplier: 'Dell', isShared: false },
    { id: '103', tag: 'SRV-DB-01', name: 'Production Database Server', category: 'c1', location: 'Data Center A', status: 'Available', purchaseDate: '2021-11-05', cost: 8500, supplier: 'HP Enterprise', isShared: false },
    { id: '104', tag: 'VEH-TRK-05', name: 'Ford Transit Delivery Van', category: 'c3', location: 'Warehouse Parking', status: 'Under Maintenance', purchaseDate: '2020-03-10', cost: 35000, supplier: 'Ford Motors', isShared: true },
    { id: '105', tag: 'FUR-DSK-42', name: 'Ergonomic Standing Desk', category: 'c2', location: 'HQ - Floor 3', status: 'Available', purchaseDate: '2023-05-12', cost: 650, supplier: 'Herman Miller', isShared: false },
    { id: '106', tag: 'MAC-2023-02', name: 'MacBook Air M2', category: 'c1', location: 'HQ - Floor 1', status: 'Allocated', purchaseDate: '2023-06-10', cost: 1299, supplier: 'Apple Inc', isShared: false },
    { id: '107', tag: 'PRJ-4K-01', name: 'Sony 4K Laser Projector', category: 'c1', location: 'Conference Room A', status: 'Available', purchaseDate: '2022-01-20', cost: 3200, supplier: 'Sony', isShared: true },
    { id: '108', tag: 'PRJ-4K-02', name: 'Epson Pro Cinema', category: 'c1', location: 'Conference Room B', status: 'Available', purchaseDate: '2022-03-15', cost: 2800, supplier: 'Epson', isShared: true },
    { id: '109', tag: 'VEH-SED-01', name: 'Tesla Model 3 (Company Car)', category: 'c3', location: 'Executive Parking', status: 'Allocated', purchaseDate: '2023-11-01', cost: 45000, supplier: 'Tesla', isShared: true },
    { id: '110', tag: 'MON-32-01', name: 'Dell UltraSharp 32" 4K', category: 'c1', location: 'HQ - Floor 3', status: 'Allocated', purchaseDate: '2023-08-05', cost: 850, supplier: 'Dell', isShared: false },
    { id: '111', tag: 'MON-32-02', name: 'Dell UltraSharp 32" 4K', category: 'c1', location: 'HQ - Floor 3', status: 'Available', purchaseDate: '2023-08-05', cost: 850, supplier: 'Dell', isShared: false },
    { id: '112', tag: 'FUR-CHR-12', name: 'Herman Miller Aeron', category: 'c2', location: 'HQ - Floor 2', status: 'Allocated', purchaseDate: '2022-12-10', cost: 1200, supplier: 'Herman Miller', isShared: false },
    { id: '113', tag: 'FUR-CHR-13', name: 'Steelcase Leap', category: 'c2', location: 'HQ - Floor 1', status: 'Under Maintenance', purchaseDate: '2021-05-20', cost: 950, supplier: 'Steelcase', isShared: false },
    { id: '114', tag: 'NET-RTR-01', name: 'Cisco Enterprise Router', category: 'c1', location: 'Server Room', status: 'Available', purchaseDate: '2020-10-15', cost: 5400, supplier: 'Cisco', isShared: false }
  ],
  bookings: [
    { id: 'b1', assetId: '107', userId: '4', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '11:00', status: 'Upcoming', purpose: 'Q3 Sales Pitch' },
    { id: 'b2', assetId: '109', userId: '2', date: new Date().toISOString().split('T')[0], startTime: '13:00', endTime: '16:00', status: 'Upcoming', purpose: 'Client Meeting Downtown' },
    { id: 'b3', assetId: '108', userId: '6', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '12:00', status: 'Upcoming', purpose: 'HR Onboarding Session' }
  ],
  maintenance: [
    { id: 'm1', assetId: '104', requestedBy: '2', issue: 'Engine light is on, needs immediate oil change and inspection', priority: 'Critical', status: 'In Progress', requestDate: '2023-10-25T10:00:00Z' },
    { id: 'm2', assetId: '113', requestedBy: '5', issue: 'Armrest is broken and hydraulic lift is stuck', priority: 'Medium', status: 'Pending', requestDate: new Date().toISOString() },
    { id: 'm3', assetId: '101', requestedBy: '1', issue: 'Keyboard keys sticky (Spacebar and Enter)', priority: 'Low', status: 'Approved', requestDate: '2023-11-01T08:00:00Z' },
    { id: 'm4', assetId: '114', requestedBy: '3', issue: 'Intermittent packet loss on port 4', priority: 'High', status: 'Technician Assigned', requestDate: '2023-11-02T09:30:00Z' },
    { id: 'm5', assetId: '102', requestedBy: '4', issue: 'Battery drains completely in 30 minutes', priority: 'High', status: 'Resolved', requestDate: '2023-10-15T14:00:00Z' }
  ],
  notifications: [
    { id: 'n1', userId: '1', title: 'Maintenance Overdue', message: 'Vehicle VEH-TRK-05 is past its scheduled maintenance date.', type: 'alert', read: false, date: '2023-10-26T08:30:00Z' },
    { id: 'n2', userId: '1', title: 'New Transfer Request', message: 'Dwight has requested a transfer for MAC-2023-01.', type: 'info', read: false, date: new Date().toISOString() },
    { id: 'n3', userId: '1', title: 'Audit Completed', message: 'Q3 Asset Audit has been submitted by Sarah Connor.', type: 'success', read: true, date: '2023-11-01T16:45:00Z' }
  ],
  departments: [
    { id: 'd1', name: 'Engineering', headId: '1', parentId: null, status: 'Active' },
    { id: 'd2', name: 'HR', headId: '6', parentId: null, status: 'Active' },
    { id: 'd3', name: 'Sales', headId: '4', parentId: null, status: 'Active' },
    { id: 'd4', name: 'Operations', headId: '3', parentId: null, status: 'Active' }
  ],
  categories: [
    { id: 'c1', name: 'Electronics', fields: ['warranty', 'mac_address'] },
    { id: 'c2', name: 'Furniture', fields: ['material'] },
    { id: 'c3', name: 'Vehicles', fields: ['license_plate', 'mileage'] }
  ],
  allocations: [
    { id: 'a1', assetId: '101', userId: '1', assigneeType: 'employee', expectedReturnDate: '2024-01-20', status: 'Active' },
    { id: 'a2', assetId: '106', userId: '6', assigneeType: 'employee', expectedReturnDate: null, status: 'Active' },
    { id: 'a3', assetId: '110', userId: '1', assigneeType: 'employee', expectedReturnDate: null, status: 'Active' },
    { id: 'a4', assetId: '112', userId: '4', assigneeType: 'employee', expectedReturnDate: null, status: 'Active' }
  ],
  transfers: [
    { id: 't1', assetId: '101', fromId: '1', toId: '5', requestDate: new Date().toISOString(), status: 'Requested', reason: 'Project reallocation' }
  ],
  audits: [
    { id: 'au1', name: 'Annual IT Audit 2023', startDate: '2023-11-01', endDate: '2023-11-15', status: 'In Progress', createdBy: '1' }
  ],
  auditItems: [
    { id: 'ai1', auditId: 'au1', assetId: '101', status: 'Verified', notes: 'In good condition', verifiedBy: '1', verifiedAt: '2023-11-02T10:00:00Z' },
    { id: 'ai2', auditId: 'au1', assetId: '102', status: 'Missing', notes: 'Could not locate on Floor 2', verifiedBy: '3', verifiedAt: '2023-11-03T11:00:00Z' },
    { id: 'ai3', auditId: 'au1', assetId: '103', status: 'Pending', notes: '', verifiedBy: null, verifiedAt: null },
    { id: 'ai4', auditId: 'au1', assetId: '114', status: 'Pending', notes: '', verifiedBy: null, verifiedAt: null }
  ]
};

const getLocalDb = () => {
  const data = localStorage.getItem('assetflow_mock_db_v4');
  if (data) return JSON.parse(data);
  localStorage.setItem('assetflow_mock_db_v4', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

const saveLocalDb = (data) => {
  localStorage.setItem('assetflow_mock_db_v4', JSON.stringify(data));
};

export const fetchAllData = async () => {
  if (isMock) {
    console.warn("Using LocalStorage fallback. Please provide Supabase credentials to use live DB.");
    return getLocalDb();
  }

  try {
    const [
      { data: users },
      { data: assets },
      { data: bookings },
      { data: maintenance },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('assets').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('maintenance').select('*'),
      supabase.from('notifications').select('*').order('date', { ascending: false })
    ]);

    return {
      users: users || [],
      assets: assets || [],
      bookings: bookings || [],
      maintenance: maintenance || [],
      notifications: notifications || [],
      departments: INITIAL_DATA.departments,
      categories: INITIAL_DATA.categories,
      allocations: [],
      transfers: [],
      audits: [],
      auditItems: []
    };
  } catch (error) {
    console.error("Error fetching data from Supabase:", error);
    return getLocalDb(); // Fallback to local storage
  }
};

export const createResource = async (table, data) => {
  if (isMock) {
    const db = getLocalDb();
    const newEntity = { ...data, id: Date.now().toString() };
    if (!db[table]) db[table] = [];
    db[table].push(newEntity);
    saveLocalDb(db);
    return newEntity;
  }

  const { data: newEntity, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();
    
  if (error) {
    console.error(`Error creating ${table}:`, error);
    throw error;
  }
  return newEntity;
};

export const updateResource = async (table, id, data) => {
  if (isMock) {
    const db = getLocalDb();
    const index = db[table].findIndex(item => item.id === id);
    if (index !== -1) {
      db[table][index] = { ...db[table][index], ...data };
      saveLocalDb(db);
      return db[table][index];
    }
    throw new Error("Item not found locally");
  }

  const { data: updatedEntity, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
  return updatedEntity;
};

// Supabase Storage
export const uploadFile = async (bucket, file) => {
  if (isMock) {
    console.warn("Storage upload requires real Supabase. Returning mock URL.");
    return URL.createObjectURL(file);
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrlData.publicUrl;
};
