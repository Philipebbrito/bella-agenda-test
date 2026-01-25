
import { createClient } from '@supabase/supabase-js';

// Using process.env as configured in vite.config.ts to avoid issues with import.meta.env in certain environments
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Variáveis do Supabase não encontradas. Verifique seu arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
