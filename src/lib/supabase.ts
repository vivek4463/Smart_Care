import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Build-safe no-op proxy to prevent crashes during SSR/Prerendering when env vars are missing
const createNoOpClient = () => {
  const noop = () => Promise.resolve({ data: {}, error: null });
  return new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'auth') {
        return new Proxy({}, {
          get: () => noop
        });
      }
      return noop;
    }
  }) as any;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoOpClient();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Cloud features will be inactive until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are added to Vercel environment variables.');
}
