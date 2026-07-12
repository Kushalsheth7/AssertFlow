import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL').trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY').trim();

console.log("USING KEY:", supabaseKey.substring(0, 15) + "...");

export const supabase = createClient(supabaseUrl, supabaseKey);
