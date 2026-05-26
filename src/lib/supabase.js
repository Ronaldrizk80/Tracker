import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// ============ Domain constants ============

export const ENTITIES = [
  'Cocoa Capital',
  'Gandour KSA',
  'Gandour Lebanon',
  'Gandour India',
  'MAJ Food',
  'Other',
]

export const TYPES = [
  { value: 'delegated', label: 'Delegated' },
  { value: 'email_reply', label: 'Email reply' },
  { value: 'project', label: 'Project' },
]

export const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'done', label: 'Done' },
]
