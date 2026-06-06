import { createClient } from '@supabase/supabase-js';

// Retrieve values strictly from client-side imports
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key';

// Safely mask credentials for logging
const maskValue = (val) => {
  if (!val) return 'empty';
  if (val.startsWith('https://your-project') || val === 'placeholder-anon-key') return 'placeholder (not set)';
  return `${val.substring(0, 8)}...${val.substring(val.length - 4)}`;
};

console.log('[Supabase Client Initialization]');
console.log(' - URL:', maskValue(supabaseUrl));
console.log(' - Anon Key:', maskValue(supabaseAnonKey));
console.log(' - Is properly configured:', !!isConfigured);

export const supabase = createClient(supabaseUrl || 'https://your-project.supabase.co', supabaseAnonKey || 'placeholder-anon-key');

// Trigger a direct runtime sanity query test and display outcome in the console immediately
if (isConfigured) {
  console.log('[Supabase Setup] Triggering database connection handshake...');
  supabase.from('links').select('*').limit(1).then(({ data, error }) => {
    if (error) {
      console.error('[Supabase Handshake] Connection failed:', error.message, error);
    } else {
      console.log('[Supabase Handshake] Connection verified successfully! Retrieved rows count:', data?.length);
    }
  }).catch(e => {
    console.error('[Supabase Handshake] Connection exception:', e);
  });
}

/**
 * Simple test function to verify Connection with Supabase.
 * Queries a single row from the 'links' table and logs the output in the console.
 */
export async function testSupabaseConnection() {
  if (!isConfigured) {
    const msg = '[Supabase] Connection test skipped because SUPABASE_URL and/or SUPABASE_ANON_KEY are not configured yet.';
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



