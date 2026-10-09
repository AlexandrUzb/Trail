import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of ESM import hoisting
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const DEFAULT_SUPABASE_URL = 'https://gkztwgxxcahwmzwvimzi.supabase.co';

function getCredentials() {
  const url = 
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    DEFAULT_SUPABASE_URL;

  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    '';

  return { url, key };
}

let supabaseInstance = null;

export function getSupabaseServerClient() {
  if (!supabaseInstance) {
    const { url, key } = getCredentials();
    if (url && key) {
      try {
        supabaseInstance = createClient(url, key, {
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
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { url, key } = getCredentials();
  return Boolean(url && key);
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
    let role = 'user';
    try {
      const { data: profile } = await sb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile && profile.role) {
        role = profile.role;
      }
    } catch {
      // Retain default 'user' if lookup fails
    }

    return { valid: true, user: { ...user, role } };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export default getSupabaseServerClient;
