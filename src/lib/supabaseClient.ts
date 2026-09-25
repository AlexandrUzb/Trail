import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gkztwgxxcahwmzwvimzi.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CujwKGKQIc70VQo4wQZWXw_r3O3Bhk0';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  DEFAULT_SUPABASE_URL;

const supabasePublishableKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

/**
 * Reusable Supabase client for the React / Vite application.
 * Uses publishable / anon key only. Safe for browser execution.
 */
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
