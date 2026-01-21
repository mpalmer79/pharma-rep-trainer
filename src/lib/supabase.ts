import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create a mock client that returns empty results when Supabase isn't configured
// This allows the app to work in demo mode
let supabaseClient: SupabaseClient<Database>;

if (isSupabaseConfigured) {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  // Create a placeholder that will log warnings but not crash the app
  console.warn('⚠️ Supabase not configured. Running in demo mode with localStorage only.');
  console.warn('To enable cloud sync, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // Create client with placeholder values - it won't work but won't crash
  supabaseClient = createClient<Database>(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const supabase = supabaseClient;

// Helper to create a server-side client (for API routes)
export const createServerClient = () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured for server-side use');
    return supabaseClient;
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export default supabase;
