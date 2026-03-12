import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Build-safe no-op to prevent crashes during SSR/Prerendering when env vars are missing
const createNoOpClient = () => {
  const chain: any = () => chain;
  chain.then = (cb: any) => Promise.resolve({ data: { user: null }, error: null }).then(cb);
  
  const client: any = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signUp: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ data: {}, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => chain,
    channel: () => ({ subscribe: () => {} }),
  };

  return client;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoOpClient();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Cloud features will be inactive until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are added to Vercel environment variables.');
}
