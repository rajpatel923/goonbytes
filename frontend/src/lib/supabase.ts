
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// Read Supabase connection info from Vite environment variables.
// Set these in your environment or in a `.env` file used by Vite:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	// Fail fast in development to avoid confusing runtime errors.
	// In production, Vite should inject these env vars at build time.
	console.error("Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
	console.error("Supabase features will be disabled. Please create a .env file with these variables.");
}

// Use placeholder values if env vars are missing to prevent crashes
// The app will still load but Supabase features won't work
export const supabase = createClient<Database>(
	supabaseUrl || 'https://placeholder.supabase.co',
	supabaseAnonKey || 'placeholder-anon-key'
)
