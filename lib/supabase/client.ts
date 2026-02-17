import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // During build-time, these env vars might be missing. 
    // We provide realistic placeholders to prevent @supabase/ssr from throwing fatal errors.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNoZWhvbGRlciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcyNTMxMjAwLCJleHAiOjE5ODgxMDcyMDB9.placeholder'

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('CRITICAL: Supabase environment variables are missing in production build. Ensure they are set in Vercel settings.')
        } else {
            console.warn('Supabase credentials missing. using placeholders for stability.')
        }
    }

    try {
        return createBrowserClient(supabaseUrl, supabaseKey)
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e)
        // Return a dummy client if initialization fails during build
        return {} as any
    }
}
