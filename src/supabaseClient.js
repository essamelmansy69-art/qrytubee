import { createClient } from '@supabase/supabase-js';

// Support both server-side process.env and client-side Vite import.meta.env
const supabaseUrl = 
  (typeof process !== 'undefined' && process?.env?.SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && import.meta?.env?.SUPABASE_URL) || 
  'https://your-project.supabase.co';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process?.env?.SUPABASE_ANON_KEY) || 
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof import.meta !== 'undefined' && import.meta?.env?.SUPABASE_ANON_KEY) || 
  '';

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('[Supabase] Warning: SUPABASE_URL is not configured or using default placeholder.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
