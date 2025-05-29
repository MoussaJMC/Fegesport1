import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database helpers
export const getNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
};

export const getMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*');
  if (error) throw error;
  return data;
};

export const getPartners = async () => {
  const { data, error } = await supabase
    .from('partners')
    .select('*');
  if (error) throw error;
  return data;
};

export const createNewsletterSubscription = async (email: string, whatsapp: string) => {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email, whatsapp }]);
  if (error) throw error;
  return data;
};

export const createContactMessage = async (message: any) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([message]);
  if (error) throw error;
  return data;
};