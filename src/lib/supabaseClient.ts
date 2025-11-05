import { createClient } from '@supabase/supabase-js'

// ✅ Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables missing. Check your .env or Vercel settings.')
}

// ✅ Create client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Optional: log confirmation
console.log('✅ Supabase client initialized:', supabaseUrl)
