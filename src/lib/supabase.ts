import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lhtymbwluznknpatdkmo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodHltYndsdXpua25wYXRka21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDcyMDIsImV4cCI6MjA4ODU4MzIwMn0.JVzbgawvm4zLJz9eLVc3-8pvwZJcdNUIQZjXBGm52RE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
