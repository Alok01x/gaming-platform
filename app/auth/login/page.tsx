"use client";

import { useState } from "react";
import { AuthForm, AuthInput, AuthButton } from "@/components/auth/auth-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            if (signInError.message.toLowerCase().includes("confirmed")) {
                setError("Email not confirmed. This user was registered before the policy change. Action: In Supabase Dashboard > Authentication > Users, find your email, click the three dots, and select 'Confirm User'. Alternatively, register with a new email.");
            } else {
                setError(signInError.message);
            }
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden pt-20">
            {/* Background Accents */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <Link
                href="/"
                className="absolute top-32 left-8 md:left-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back Home
            </Link>

            <AuthForm
                title="Login"
                subtitle="Sign in to your account"
                onSubmit={handleSubmit}
            >
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm animate-shake">
                        {error}
                    </div>
                )}

                <AuthInput label="Email Address" type="email" placeholder="email@example.com" required name="email" />
                <AuthInput label="Password" type="password" placeholder="••••••••" required name="password" />

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" className="accent-primary" />
                        Remember Me
                    </label>
                    <Link href="#" className="hover:text-primary transition-colors">Forgot Password?</Link>
                </div>

                <AuthButton loading={loading}>Login</AuthButton>

                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-10">
                    New user? <Link href="/auth/register" className="text-primary hover:underline underline-offset-4">Register here</Link>
                </p>
            </AuthForm>
        </div>
    );
}

