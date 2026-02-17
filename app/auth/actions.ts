"use client";

// Note: In a real Next.js app, these would be 'use server' actions.
// For this demo, we'll keep the logic clean and ready for Supabase.

import { createClient } from "@/lib/supabase/client";

export async function signIn(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        },
    });
    return { data, error };
}

export async function signUp(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password: "TemporaryPassword123!", // Supabase usually requires a password or OTP
    });
    return { data, error };
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
}
