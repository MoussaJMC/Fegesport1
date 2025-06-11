import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'feguiesport-admin'
    }
  }
});

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Enhanced error handling for better debugging
      console.error('Supabase sign in error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Health check function to test Supabase connection
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase health check failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase health check error:', error);
    return false;
  }
};