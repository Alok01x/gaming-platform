"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, Zap, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrganizationSetupPage() {
    const [loading, setLoading] = useState(true);
    const [deploying, setDeploying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function checkStatus() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data?.role === 'ORGANIZER') {
                router.push("/dashboard/organizer");
                return;
            }

            setProfile(data);
            setLoading(false);
        }
        checkStatus();
    }, [router, supabase]);

    const handleDeploy = async () => {
        if (!profile) return;
        setDeploying(true);

        try {
            // 1. Upgrade Role
            const { error } = await supabase
                .from("profiles")
                .update({ role: 'ORGANIZER' })
                .eq("id", profile.id);

            if (error) throw error;

            // 2. Success State
            setSuccess(true);

            // 3. Brief delay for animation then redirect
            setTimeout(() => {
                router.push("/dashboard/organizer");
            }, 2000);

        } catch (err: any) {
            console.error("Deployment failed:", err);
            alert(`Deployment Failed: ${err.message}`);
            setDeploying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 font-sans flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-10 md:p-14 border-t-4 border-t-primary"
                >
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                            {success ? (
                                <CheckCircle2 className="w-10 h-10 text-primary animate-bounce" />
                            ) : (
                                <Building2 className="w-10 h-10 text-primary" />
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter uppercase mb-4">
                            Deploy <span className="text-primary">Organization</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                            Elevate your operative status to <span className="text-foreground font-bold">Architect</span>.
                            Gain command authorization to orchestrate tournaments and manage elite squads.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <Feature icon={ShieldCheck} title="Verified Authority" desc="Official organizer status." />
                        <Feature icon={Zap} title="Tournament Engine" desc="Full bracket control." />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleDeploy}
                            disabled={deploying || success}
                            className={cn(
                                "w-full py-6 text-sm font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all",
                                success
                                    ? "bg-green-500/20 text-green-500 border border-green-500/50"
                                    : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-2xl hover:shadow-primary/20"
                            )}
                        >
                            {deploying ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Initializing Command Center...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Deployment Successful
                                </>
                            ) : (
                                <>
                                    Initialize Command Center <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                            Warning: This action is irreversible. Field ops authorization will be revoked.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-secondary/30 p-4 rounded-xl border border-white/5 flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <div className="font-bold uppercase tracking-tight text-xs mb-1">{title}</div>
                <div className="text-[10px] text-muted-foreground">{desc}</div>
            </div>
        </div>
    );
}
