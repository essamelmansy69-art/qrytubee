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
  'placeholder-anon-key';

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key';

if (!isConfigured) {
  console.warn('[Supabase] Warning: Supabase client is running with placeholder/missing credentials. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your environment/settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Simple test function to verify Connection with Supabase.
 * Queries a single row from the 'links' table and logs the output in the console.
 */
export async function testSupabaseConnection() {
  if (!isConfigured) {
    const msg = '[Supabase] Setup needed: Connection test skipped because SUPABASE_URL and/or SUPABASE_ANON_KEY are not configured yet.';
    console.log(msg);
    return { 
      success: false, 
      error: new Error('Supabase credentials are not configured. please add them to your environment variables.') 
    };
  }

  console.log('[Supabase] Attempting to connect to the "links" table...');
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .limit(1);

    if (error) {
      console.error('[Supabase] Connection failed:', error.message, error);
      return { success: false, error };
    }

    console.log('[Supabase] Connection test successful! Retrieved data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected exception during connection test:', err);
    return { success: false, error: err };
  }
}


