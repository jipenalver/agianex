import { createClient } from '@supabase/supabase-js'

// Extend global interface for build-time injected variables
declare global {
  const __VITE_SUPABASE_URL__: string | undefined
  const __VITE_SUPABASE_ANON_KEY__: string | undefined
  const __VITE_SUPABASE_SERVICE_ROLE__: string | undefined
}

// Get environment variables with fallbacks for production builds
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof __VITE_SUPABASE_URL__ !== 'undefined' ? __VITE_SUPABASE_URL__ : '')

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof __VITE_SUPABASE_ANON_KEY__ !== 'undefined' ? __VITE_SUPABASE_ANON_KEY__ : '')

const supabaseServiceRole =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE ||
  (typeof __VITE_SUPABASE_SERVICE_ROLE__ !== 'undefined' ? __VITE_SUPABASE_SERVICE_ROLE__ : '')

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    env: import.meta.env.MODE,
  })
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Log configuration status (without sensitive keys)
console.log('Supabase configuration loaded:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceRole: !!supabaseServiceRole,
  env: import.meta.env.MODE,
})

// 👉 Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 👉 Create a single supabase admin client for interacting auth users
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRole || supabaseAnonKey, // Fallback to anon key if service role not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
