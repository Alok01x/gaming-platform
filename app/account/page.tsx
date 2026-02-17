"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, Shield, Bell, LogOut, ChevronRight, Mail, Key, Fingerprint, Crosshair, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORTED_GAMES = [
    { id: "VALORANT", label: "VALORANT" },
    { id: "BGMI", label: "BGMI" },
    { id: "CS2", label: "Counter-Strike 2" },
    { id: "DOTA2", label: "Dota 2" },
    { id: "LOL", label: "League of Legends" },
    { id: "APEX", label: "Apex Legends" },
    { id: "COD", label: "Call of Duty" },
];

export default function AccountPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formState, setFormState] = useState({
        primary_game: "General",
        specialization: ""
    });
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile({ ...data, email: user.email });
                setFormState({
                    primary_game: data.primary_game || "General",
                    specialization: data.specialization || ""
                });
            }
            setLoading(false);
        }
        fetchProfile();
    }, [router, supabase]);

    const handleSaveServiceRecord = async () => {
        if (!profile) return;

        setSaving(true);

        // Debug: Log what we are trying to update
        console.log("Attempting update for:", profile.id);
        console.log("New values:", formState);

        const { data, error } = await supabase
            .from("profiles")
            .update({
                primary_game: formState.primary_game,
                specialization: formState.specialization
            })
            .eq("id", profile.id)
            .select(); // Add select to get back the updated row

        if (error) {
            console.error("Supabase Update Error:", error);
            alert(`Update Error: ${error.message}`);
        } else if (!data || data.length === 0) {
            console.error("Update succeeded but returned no data (RLS blocking?)");
            alert("Update Failed: No changes saved. This usually means a permission issue (RLS). Ensure you have run the migration script.");
        } else {
            console.log("Update Success:", data);
            alert("Service Record Updated Successfully!");

            // Re-fetch to get updated tactical_id from trigger
            const { data: updatedProfile } = await supabase
                .from("profiles")
                .select("primary_game, specialization, tactical_id")
                .eq("id", profile.id)
                .single();

            if (updatedProfile) {
                setProfile((prev: any) => ({ ...prev, ...updatedProfile }));
            }
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen py-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter uppercase mb-4">
                        Account <span className="text-foreground/40 italic">Control</span>
                    </h1>
                    <p className="text-muted-foreground">Manage your operative identity and security protocols.</p>
                </div>

                <div className="space-y-6">
                    {/* Identity Card */}
                    <div className="glass-panel p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
                            <User className="w-4 h-4" /> Personnel Identity
                        </h3>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-20 h-20 rounded-full bg-secondary border-2 border-primary/20 p-1">
                                <div className="w-full h-full rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">
                                    {profile?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-foreground/40" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-xl font-black uppercase tracking-tight">
                                    {profile?.gamertag || profile?.email?.split('@')[0] || "Unknown Operator"}
                                </div>
                                <div className="text-xs font-bold text-muted-foreground">{profile?.full_name || "Operative"}</div>
                                {profile?.tactical_id && (
                                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
                                        <Fingerprint className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-mono font-bold text-primary tracking-widest">
                                            {profile.tactical_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Record Configuration */}
                    <div className="glass-panel p-8 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                                <Crosshair className="w-4 h-4 text-primary" /> Service Record
                            </h3>
                            {saving && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Primary Deployment</label>
                                <select
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-all"
                                    value={formState.primary_game}
                                    onChange={(e) => setFormState(prev => ({ ...prev, primary_game: e.target.value }))}
                                >
                                    <option value="General">General Infantry</option>
                                    {SUPPORTED_GAMES.map(g => (
                                        <option key={g.id} value={g.id}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Specialization</label>
                                <input
                                    type="text"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                                    placeholder="e.g. IGL, Sniper, Entry"
                                    value={formState.specialization}
                                    onChange={(e) => setFormState(prev => ({ ...prev, specialization: e.target.value }))}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveServiceRecord}
                            disabled={saving}
                            className="mt-6 w-full py-4 bg-secondary border border-border hover:border-primary/50 text-foreground font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-secondary/80"
                        >
                            <Save className="w-4 h-4" /> Update Service Record
                        </button>
                    </div>

                    {/* Security & Comms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8 flex items-center gap-3">
                                <Shield className="w-4 h-4" /> Security
                            </h3>
                            <div className="space-y-4">
                                <AccountSettingAction icon={Key} label="Access Key" description="Update password" />
                                <AccountSettingAction icon={Shield} label="2FA" description="Two-factor auth" />
                            </div>
                        </div>
                        <div className="glass-panel p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8 flex items-center gap-3">
                                <Bell className="w-4 h-4" /> Comms
                            </h3>
                            <div className="space-y-4">
                                <AccountSettingAction icon={Bell} label="Deployment Alerts" description="Mission updates" />
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="pt-4">
                        <button
                            onClick={handleLogout}
                            className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between group hover:bg-red-500/20 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <LogOut className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase tracking-tight text-red-500">End Operations</div>
                                    <div className="text-[10px] uppercase font-bold text-red-400 opacity-60">De-authorize session</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountSettingAction({ icon: Icon, label, description }: { icon: any, label: string, description: string }) {
    return (
        <button className="w-full flex items-center justify-between py-4 border-b border-border/30 last:border-0 group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-tight">{label}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">{description}</div>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </button>
    );
}
