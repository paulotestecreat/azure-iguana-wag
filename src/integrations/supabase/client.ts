import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bwonukkludpkrpzfsbib.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3b251a2tsdWRwa3JwemZzYmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTcxOTIsImV4cCI6MjA3NDc3MzE5Mn0.lpHrZZmaOWXZ0xnb4aFSXkkNPULTCSNr7EEuip3B7_Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);