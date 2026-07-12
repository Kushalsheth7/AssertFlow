import { fetchAllData, createResource, updateResource } from './api';

let memoryDb = null;
let dbPromise = null;

// Initialize the database by fetching from the backend
export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = fetchAllData().then(data => {
      memoryDb = data;
      return data;
    });
  }
  return dbPromise;
};

// Get the current snapshot of the DB for synchronous rendering
export const getDB = () => {
  return memoryDb;
};

// Mock saveDB to prevent components from crashing
// In a full migration, we would replace saveDB calls with addEntity/updateEntity
export const saveDB = (data) => {
  memoryDb = data;
};

// Helper function to sync a specific entity creation to the backend
export const addEntity = async (entityType, entityData) => {
  if (!memoryDb) return;
  
  // Call backend API
  const newEntity = await createResource(entityType, entityData);
  
  // Update local memory cache so UI updates instantly
  memoryDb[entityType].push(newEntity);
  return newEntity;
};

// Helper function to sync a specific entity update to the backend
export const updateEntity = async (entityType, entityId, updatedData) => {
  if (!memoryDb) return;
  
  // Call backend API
  const updatedEntity = await updateResource(entityType, entityId, updatedData);
  
  // Update local memory cache
  const index = memoryDb[entityType].findIndex(item => item.id === entityId);
  if (index !== -1) {
    memoryDb[entityType][index] = updatedEntity;
  }
  return updatedEntity;
};

// Auth stuff
export const loginUser = async (email, password) => {
  // --- EMERGENCY HACKATHON BYPASS ---
  if ((email === 'admin3@assetflow.com' || email === 'admin@assetflow.com') && password === 'AssetFlow2026!') {
    const mockUser = {
      id: 'admin_bypass_123',
      name: 'Admin User',
      email: 'admin3@assetflow.com',
      role: 'Admin',
      department: 'IT',
      status: 'Active'
    };
    localStorage.setItem('assetflow_currentUser', JSON.stringify(mockUser));
    return mockUser;
  }
  // ----------------------------------

  if (import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL' || !import.meta.env.VITE_SUPABASE_URL) {
    const db = await initDB();
    const user = db.users.find(u => u.email === email);
    if (user) {
      localStorage.setItem('assetflow_currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid email or password');
  }

  const { supabase } = await import('../lib/supabase');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;

  // Fetch the user profile from our users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (profileError) throw profileError;
  localStorage.setItem('assetflow_currentUser', JSON.stringify(userProfile));
  return userProfile;
};

export const signUpUser = async (email, password, name) => {
  if (import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL' || !import.meta.env.VITE_SUPABASE_URL) {
    const db = await initDB();
    if (db.users.find(u => u.email === email)) throw new Error('Email already exists');
    
    const newUser = { id: Date.now().toString(), name, email, role: 'Employee', department: null, status: 'Active' };
    db.users.push(newUser);
    saveDB(db);
    localStorage.setItem('assetflow_currentUser', JSON.stringify(newUser));
    return newUser;
  }

  const { supabase } = await import('../lib/supabase');
  const { data, error } = await supabase.auth.signUp({ email, password });
  
  if (error) throw error;

  const userRole = email.startsWith('admin') ? 'Admin' : 'Employee';

  // Create user profile in our users table
  const newUserProfile = {
    id: data.user.id,
    name,
    email,
    role: userRole,
    department: null,
    status: 'Active'
  };

  let { error: profileError } = await supabase.from('users').insert(newUserProfile);
  
  if (profileError && profileError.code === '23505') {
    // If user already exists in public table (from SQL mock data), update it to link with the new Auth ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ id: newUserProfile.id, role: userRole })
      .eq('email', email);
    profileError = updateError;
  }

  if (profileError) throw profileError;

  localStorage.setItem('assetflow_currentUser', JSON.stringify(newUserProfile));
  return newUserProfile;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('assetflow_currentUser');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = async () => {
  localStorage.removeItem('assetflow_currentUser');
  if (import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL' && import.meta.env.VITE_SUPABASE_URL) {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
  }
};
