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
  },
  // Add retry configuration for better error handling
  db: {
    schema: 'public'
  },
  // Configure realtime with better error handling
  realtime: {
    params: {
      eventsPerSecond: 10
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

// Enhanced health check function with better error handling
export const checkSupabaseHealth = async (): Promise<{ 
  isHealthy: boolean; 
  error?: string; 
  details?: any 
}> => {
  try {
    // Test basic connectivity first
    const startTime = Date.now();
    
    // Simple query to test connection
    const { data, error } = await Promise.race([
      supabase.from('profiles').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]) as any;
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.error('Supabase health check failed:', error);
      
      let errorMessage = 'Database connection failed';
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error - check CORS settings and internet connection';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout - database may be slow or unreachable';
      }
      
      return {
        isHealthy: false,
        error: errorMessage,
        details: {
          originalError: error.message,
          responseTime,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return {
      isHealthy: true,
      details: {
        responseTime,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('Supabase health check error:', error);
    
    let errorMessage = 'Unknown connection error';
    if (error.message?.includes('Failed to fetch')) {
      errorMessage = 'Network error - check CORS settings and internet connection';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout';
    }
    
    return {
      isHealthy: false,
      error: errorMessage,
      details: {
        originalError: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};

// Utility function to test specific table access
export const testTableAccess = async (tableName: string): Promise<{
  accessible: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
    
    return { accessible: true };
  } catch (error: any) {
    return {
      accessible: false,
      error: error.message || 'Unknown error'
    };
  }
};

// Function to get connection diagnostics
export const getConnectionDiagnostics = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
    supabaseKey: supabaseAnonKey ? 'Set' : 'Missing',
    healthCheck: await checkSupabaseHealth(),
    tableAccess: {} as Record<string, any>
  };
  
  // Test access to key tables
  const tables = ['profiles', 'members', 'events', 'news', 'partners'];
  for (const table of tables) {
    diagnostics.tableAccess[table] = await testTableAccess(table);
  }
  
  return diagnostics;
};