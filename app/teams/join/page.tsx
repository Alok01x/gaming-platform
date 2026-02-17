"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Key, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JoinTeamPage() {
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const code = inviteCode.trim();
            if (code.length < 6) throw new Error("Invalid security code format.");

            // 1. Verify Authentication
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login?next=/teams/join");
                return;
            }

            // 2. Find Team by Code
            const { data: team, error: teamError } = await supabase
                .from("teams")
                .select("id, name, tag")
                .eq("invite_code", code)
                .single();

            if (teamError || !team) throw new Error("Security code invalid or expired.");

            // 3. Join Team
            const { error: joinError } = await supabase
                .from("team_members")
                .insert({
                    team_id: team.id,
                    user_id: user.id,
                    role: 'PLAYER'
                });

            if (joinError) {
                if (joinError.code === '23505') throw new Error("You are already an operative of this squad.");
                throw joinError;
            }

            setSuccess(`Successfully enlisted in [${team.tag}] ${team.name}`);
            setTimeout(() => router.push("/dashboard/player"), 2000);

        } catch (err: any) {
            setError(err.message || "Encryption handshake failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border mb-6"
                    >
                        <Shield className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-black font-heading uppercase tracking-tight mb-2">
                        Enlist via <span className="text-primary">Code</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter the encrypted 8-digit sequence provided by your Squad Captain.
                    </p>
                </div>

                <div className="glass-panel p-8">
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Security Sequence
                            </label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="e.g. 7f3b9a2c"
                                    className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 font-mono text-lg outline-none focus:border-primary transition-all placeholder:text-muted-foreground/20"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !inviteCode}
                            className={cn(
                                "w-full py-4 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2",
                                (loading || !inviteCode) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {loading ? "Decrypting..." : "Authenticate & Join"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
