import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// ✅ Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Using placeholder mode.')
  console.log('📝 To enable Supabase, update your .env.local with your Supabase credentials')
}

// ✅ Create client instance with proper typing
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// ✅ Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')
}

// ✅ Optional: log status
if (isSupabaseConfigured()) {
  console.log('✅ Supabase client initialized:', supabaseUrl)
} else {
  console.log('⚠️ Supabase client in placeholder mode - update .env.local to activate')
}
