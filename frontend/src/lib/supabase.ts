
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// Use the environment variables from the Supabase integration
const supabaseUrl = 'https://ysyocsycftqmgafytieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzeW9jc3ljZnRxbWdhZnl0aWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTk1MzAsImV4cCI6MjA3NjM3NTUzMH0.mtWwuh21CpZaWI0eWQH4C7yOJtVyLxbN00KPeoysKdI'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
