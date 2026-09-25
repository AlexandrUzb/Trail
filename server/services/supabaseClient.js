import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  '';

const SUPABASE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[SupabaseServer] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY not set.');
}

let supabaseInstance = null;

export function getSupabaseServerClient() {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.warn('[SupabaseServer] Client initialization warning:', err.message);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Verify a user's Supabase JWT access token on the server side
 */
export async function verifySupabaseToken(token) {
  if (!token) return { valid: false, error: 'Token missing' };
  const sb = getSupabaseServerClient();
  if (!sb) return { valid: false, error: 'Supabase server not configured' };

  try {
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) {
      return { valid: false, error: error?.message || 'Invalid user token' };
    }
    return { valid: true, user };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export default getSupabaseServerClient;
