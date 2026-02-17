import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // During build-time, these env vars might be missing. 
    // We provide realistic placeholders to prevent @supabase/ssr from throwing fatal errors.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNoZWhvbGRlciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcyNTMxMjAwLCJleHAiOjE5ODgxMDcyMDB9.placeholder'

    // Hard-fail on client if placeholders are detected in production to prevent "Invalid API Key" confusion
    const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')

    if (isPlaceholder && process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL ERROR: Supabase is initialized with placeholder keys. TRIGGER A REDEPLOY ON VERCEL.')
    }

    try {
        return createBrowserClient(supabaseUrl, supabaseKey)
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e)
        return {} as any
    }
}
