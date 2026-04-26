import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://xahrwrfttaazplqarcha.supabase.co';
const fallbackSupabasePublishableKey = 'sb_publishable_ukyKpFCh1rDJh9lcsXdZlA_2gEjLmoj';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl).trim();
export const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  fallbackSupabasePublishableKey
).trim();

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const cmsFunctionUrl = `${supabaseUrl}/functions/v1/cms-admin`;
