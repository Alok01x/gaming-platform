"use client";

import { useState } from "react";
import { AuthForm, AuthInput, AuthButton } from "@/components/auth/auth-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<"PLAYER" | "ORGANIZER">("PLAYER");
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const gamertag = formData.get("gamertag") as string;
        const full_name = formData.get("full_name") as string;

        if (email.toLowerCase() === gamertag.toLowerCase()) {
            setError("Gamertag and Email cannot be identical for security reasons.");
            return;
        }

        setLoading(true);

        // 1. Pre-check Gamertag Uniqueness
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("gamertag")
            .eq("gamertag", gamertag)
            .maybeSingle();

        if (existingProfile) {
            setError("Gamertag is already occupied by another operative. Choose a unique handle.");
            setLoading(false);
            return;
        }

        // 2. Proceed with Signup
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    gamertag,
                    role,
                },
            },
        });

        if (signUpError) {
            if (signUpError.message.toLowerCase().includes("already registered")) {
                setError("This email is already associated with an active operative account.");
            } else {
                setError(signUpError.message);
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
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <Link
                href="/"
                className="absolute top-32 left-8 md:left-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back Home
            </Link>

            <AuthForm
                title="Register"
                subtitle="Create your account"
                onSubmit={handleSubmit}
            >
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm animate-shake">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AuthInput label="Full Name" type="text" placeholder="John Doe" required name="full_name" />
                    <AuthInput label="Gamertag" type="text" placeholder="GHOST_PRO" required name="gamertag" />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        Operational Intent
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole("PLAYER")}
                            className={cn(
                                "p-4 rounded-2xl border transition-all text-left group",
                                role === "PLAYER"
                                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                    : "bg-secondary/50 border-border hover:border-primary/30"
                            )}
                        >
                            <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-primary transition-colors",
                                role === "PLAYER" ? "text-primary" : "text-muted-foreground"
                            )}>Operative</div>
                            <div className="text-[9px] text-muted-foreground/60 leading-tight">Join arenas and scale your potency.</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("ORGANIZER")}
                            className={cn(
                                "p-4 rounded-2xl border transition-all text-left group",
                                role === "ORGANIZER"
                                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                    : "bg-secondary/50 border-border hover:border-primary/30"
                            )}
                        >
                            <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-primary transition-colors",
                                role === "ORGANIZER" ? "text-primary" : "text-muted-foreground"
                            )}>Architect</div>
                            <div className="text-[9px] text-muted-foreground/60 leading-tight">Launch and orchestrate high-stakes arenas.</div>
                        </button>
                    </div>
                </div>

                <AuthInput label="Email Address" type="email" placeholder="example@email.com" required name="email" />
                <AuthInput label="Password" type="password" placeholder="••••••••" required name="password" />

                <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
                    By registering, you agree to the <span className="text-foreground font-bold">Terms of Service</span> and privacy policy.
                </p>

                <AuthButton loading={loading}>Register</AuthButton>

                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-10">
                    Already have an account? <Link href="/auth/login" className="text-primary hover:underline underline-offset-4">Sign in</Link>
                </p>
            </AuthForm>
        </div>
    );
}
