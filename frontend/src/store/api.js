import { supabase } from '../lib/supabase';

const isMock = import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL' || !import.meta.env.VITE_SUPABASE_URL;

const INITIAL_DATA = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@assetflow.com', role: 'Admin', department: 'IT' }
  ],
  assets: [],
  bookings: [],
  maintenance: [],
  notifications: [],
  departments: [
    { id: 'd1', name: 'Engineering', headId: '3', parentId: null, status: 'Active' },
    { id: 'd2', name: 'HR', headId: null, parentId: null, status: 'Active' }
  ],
  categories: [
    { id: 'c1', name: 'Electronics', fields: ['warranty'] },
    { id: 'c2', name: 'Furniture', fields: [] },
    { id: 'c3', name: 'Vehicles', fields: ['license_plate'] }
  ],
  allocations: [],
  transfers: [],
  audits: [],
  auditItems: []
};

const getLocalDb = () => {
  const data = localStorage.getItem('assetflow_mock_db');
  if (data) return JSON.parse(data);
  localStorage.setItem('assetflow_mock_db', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

const saveLocalDb = (data) => {
  localStorage.setItem('assetflow_mock_db', JSON.stringify(data));
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
