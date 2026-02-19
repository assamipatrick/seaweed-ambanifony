
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://kxujxjcuyfbvmzahyzcv.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dWp4amN1eWZidm16YWh5emN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzY4ODIsImV4cCI6MjA1NTU1Mjg4Mn0.sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Database features will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
