"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkClearance() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === 'HIGH_COMMAND' || profile?.role === 'ADMIN') {
                setAuthorized(true);
            } else {
                router.push("/dashboard");
            }
            setLoading(false);
        }

        checkClearance();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Verifying Security Clearance...
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
