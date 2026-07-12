import { supabase } from '../lib/supabase';

const isMock = true; // FORCE MOCK DATA FOR HACKATHON

const INITIAL_DATA = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@assetflow.com', role: 'Admin', department: 'IT' },
    { id: '2', name: 'John Doe', email: 'john@assetflow.com', role: 'Employee', department: 'Engineering' }
  ],
  assets: [
    { id: '101', tag: 'MAC-2023-01', name: 'MacBook Pro M2', category: 'c1', location: 'HQ - Floor 3', status: 'Allocated', purchaseDate: '2023-01-15', cost: 2499, supplier: 'Apple Inc' },
    { id: '102', tag: 'DEL-2022-14', name: 'Dell XPS 15', category: 'c1', location: 'HQ - Floor 2', status: 'Available', purchaseDate: '2022-08-22', cost: 1899, supplier: 'Dell' },
    { id: '103', tag: 'SRV-DB-01', name: 'Production Database Server', category: 'c1', location: 'Data Center A', status: 'Available', purchaseDate: '2021-11-05', cost: 8500, supplier: 'HP Enterprise' },
    { id: '104', tag: 'VEH-TRK-05', name: 'Ford Transit Delivery Van', category: 'c3', location: 'Warehouse Parking', status: 'Maintenance', purchaseDate: '2020-03-10', cost: 35000, supplier: 'Ford Motors' },
    { id: '105', tag: 'FUR-DSK-42', name: 'Ergonomic Standing Desk', category: 'c2', location: 'HQ - Floor 3', status: 'Available', purchaseDate: '2023-05-12', cost: 650, supplier: 'Herman Miller' }
  ],
  bookings: [
    { id: 'b1', assetId: '102', userId: '1', startDate: '2023-11-01T09:00:00Z', endDate: '2023-11-05T17:00:00Z', status: 'Approved', purpose: 'Client Presentation' }
  ],
  maintenance: [
    { id: 'm1', assetId: '104', requestedBy: '1', issue: 'Engine light is on, needs oil change', priority: 'High', status: 'In Progress', requestDate: '2023-10-25T10:00:00Z' }
  ],
  notifications: [
    { id: 'n1', userId: '1', title: 'Maintenance Overdue', message: 'Vehicle VEH-TRK-05 is past its scheduled maintenance date.', type: 'alert', read: false, date: '2023-10-26T08:30:00Z' }
  ],
  departments: [
    { id: 'd1', name: 'Engineering', headId: '1', parentId: null, status: 'Active' },
    { id: 'd2', name: 'HR', headId: null, parentId: null, status: 'Active' }
  ],
  categories: [
    { id: 'c1', name: 'Electronics', fields: ['warranty'] },
    { id: 'c2', name: 'Furniture', fields: [] },
    { id: 'c3', name: 'Vehicles', fields: ['license_plate'] }
  ],
  allocations: [
    { id: 'a1', assetId: '101', userId: '1', date: '2023-01-20T10:00:00Z', status: 'Active' }
  ],
  transfers: [
    { id: 't1', assetId: '102', fromUserId: '1', toUserId: '2', requestDate: '2023-11-01T10:00:00Z', status: 'Pending', reason: 'Project reallocation' }
  ],
  audits: [
    { id: 'au1', name: 'Annual IT Audit 2023', startDate: '2023-11-01', endDate: '2023-11-15', status: 'In Progress', createdBy: '1' }
  ],
  auditItems: [
    { id: 'ai1', auditId: 'au1', assetId: '101', status: 'Verified', notes: 'In good condition', verifiedBy: '1', verifiedAt: '2023-11-02T10:00:00Z' },
    { id: 'ai2', auditId: 'au1', assetId: '102', status: 'Pending', notes: '', verifiedBy: null, verifiedAt: null }
  ]
};

const getLocalDb = () => {
  const data = localStorage.getItem('assetflow_mock_db_v3');
  if (data) return JSON.parse(data);
  localStorage.setItem('assetflow_mock_db_v3', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

const saveLocalDb = (data) => {
  localStorage.setItem('assetflow_mock_db_v3', JSON.stringify(data));
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
