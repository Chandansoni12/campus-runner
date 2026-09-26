import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Reads Supabase URL and Anon Key across both Vite and Next.js / Node environments.
 */
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  '';

/**
 * Initialized Supabase client instance.
 * If credentials are not yet configured in environment variables, defaults gracefully to null
 * to prevent startup crashes in client environments.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

/**
 * Helper to obtain the Supabase client or lazily instantiate it.
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

export default supabase;
