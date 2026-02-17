"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Shield, Zap, Activity, Award, BarChart3, ChevronRight, Hash, Edit3 } from "lucide-react";
import Image from "next/image";
import { PerformanceGraph, DataPoint } from "@/components/profile/performance-graph";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingScreen from "@/components/ui/loading-screen";
import EditProfileModal from "./components/edit-profile-modal";
import { cn } from "@/lib/utils";
import { TacticalTooltip } from "@/components/ui/tactical-tooltip";
import { Check, Copy } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [statsHistory, setStatsHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            const { data: history } = await supabase
                .from("user_stats_history")
                .select("*")
                .eq("user_id", user.id)
                .order("recorded_at", { ascending: true })
                .limit(10);

            setProfile(profile);
            setStatsHistory(history || []);
            setLoading(false);
        }
        fetchProfile();
    }, []);

    if (loading) return <LoadingScreen />;
    if (!profile) return <div className="min-h-screen flex items-center justify-center font-black uppercase">Operative Data Not Found</div>;

    const graphData: DataPoint[] = statsHistory.map(s => ({
        label: new Date(s.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: s.rank_points
    }));

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Personnel Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-panel p-8 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                <div className="w-full h-full rounded-full border-2 border-primary p-1 bg-background relative z-10 overflow-hidden">
                                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.gamertag} className="w-full h-full object-cover" />
                                        ) : (
                                            <Activity className="w-12 h-12 text-primary" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black uppercase tracking-tight mb-1">{profile.gamertag}</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Operative Status: {profile.is_verified ? 'ACTIVE' : 'SUSPENDED'}</p>

                            <div className="flex justify-center gap-2 mb-8 flex-wrap">
                                <StatBadge label="Level" value={Math.floor((profile.wins * 10 + profile.total_kills) / 5) || 1} />
                                <StatBadge label="Rank" value={profile.rank_tier || "RECRUIT"} />
                                <StatBadge label="Sector" value={profile.primary_game || "General"} />
                            </div>

                            <div className="space-y-4 text-left border-t border-border/50 pt-8">
                                <TacticalTooltip label="Action Available" content="Click to copy unique operative identifier to tactical clipboard.">
                                    <button
                                        onClick={() => {
                                            if (profile.tactical_id) {
                                                navigator.clipboard.writeText(profile.tactical_id);
                                                alert("Operative ID Synchronized to Clipboard");
                                            }
                                        }}
                                        className="w-full group"
                                    >
                                        <ProfileDetail
                                            label="Personnel ID"
                                            value={profile.tactical_id || "PENDING"}
                                            interactive
                                        />
                                    </button>
                                </TacticalTooltip>
                                <ProfileDetail label="Specialization" value={profile.specialization || "Unassigned"} />
                                <ProfileDetail label="Commissioned" value={new Date(profile.updated_at).toLocaleDateString()} />
                            </div>

                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="w-full mt-8 bg-foreground text-background py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-[1.02] transition-all shadow-2xl"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Dossier
                            </button>
                        </div>

                        <div className="glass-panel p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Service Medals
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <TacticalTooltip label="Earning Req" content="Master 10 Arena Victories to unlock Legend status.">
                                    <Medal icon={Trophy} color={profile.wins >= 10 ? "text-amber-500" : "text-muted-foreground/20"} title="Arena Legend" unlocked={profile.wins >= 10} />
                                </TacticalTooltip>
                                <TacticalTooltip label="Earning Req" content="Eliminate 100 targets in active deployment.">
                                    <Medal icon={Target} color={profile.total_kills >= 100 ? "text-red-500" : "text-muted-foreground/20"} title="Precision Operative" unlocked={profile.total_kills >= 100} />
                                </TacticalTooltip>
                                <TacticalTooltip label="Earning Req" content="Verify identity with High Command.">
                                    <Medal icon={Shield} color={profile.is_verified ? "text-primary" : "text-muted-foreground/20"} title="Defensive Core" unlocked={profile.is_verified} />
                                </TacticalTooltip>
                                <TacticalTooltip label="Earning Req" content="Deploy in 50 tactical matches.">
                                    <Medal icon={Zap} color={profile.matches_played >= 50 ? "text-purple-500" : "text-muted-foreground/20"} title="Rapid Response" unlocked={profile.matches_played >= 50} />
                                </TacticalTooltip>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tactical Intelligence */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Performance Intelligence */}
                        <div className="glass-panel p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                        Tactical <span className="text-foreground/40">Performance</span>
                                    </h2>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Real-time skill trajectory analysis</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Combat Grade</div>
                                    <div className="text-3xl font-black text-primary italic">S+</div>
                                </div>
                            </div>

                            <div className="h-64">
                                <PerformanceGraph data={graphData.length > 0 ? graphData : []} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-t border-border/50 pt-10">
                                <MacroStat label="Target Kills" value={profile.total_kills.toString()} />
                                <MacroStat label="Engagements" value={profile.matches_played.toString()} />
                                <MacroStat label="Wins" value={profile.wins.toString()} />
                                <MacroStat label="Combat Ratio" value={profile.matches_played > 0 ? (profile.total_kills / profile.matches_played).toFixed(2) : "0.00"} />
                            </div>
                        </div>

                        {/* Bio / Background */}
                        <div className="glass-panel p-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2">
                                Operative Intelligence & Bio
                            </h3>
                            <p className="text-muted-foreground leading-relaxed font-bold uppercase tracking-widest text-[10px] opacity-60">
                                {profile.bio || "No background intelligence recorded for this operative. Dossier pending further high-command evaluation."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                profile={profile}
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    window.location.reload(); // Simple refresh to show new data
                }}
            />
        </div>
    );
}

function StatBadge({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/5 inline-block shrink-0">
            <div className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</div>
            <div className="text-xs font-black">{value}</div>
        </div>
    );
}

function ProfileDetail({ label, value, interactive }: { label: string, value: string, interactive?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between py-1 transition-colors",
            interactive && "group-hover:bg-primary/5 rounded px-1 -mx-1"
        )}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{value}</span>
                {interactive && <Copy className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
        </div>
    );
}

function Medal({ icon: Icon, color, title, unlocked }: { icon: any, color: string, title: string, unlocked?: boolean }) {
    return (
        <div
            className={cn(
                "aspect-square rounded-2xl border flex items-center justify-center transition-all cursor-help relative overflow-hidden group",
                unlocked
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 shadow-lg shadow-primary/5"
                    : "bg-white/5 border-white/10 opacity-50 grayscale hover:grayscale-0"
            )}
            title={title}
        >
            {unlocked && (
                <div className="absolute inset-0 bg-primary/20 animate-pulse-slow pointer-events-none" />
            )}
            <Icon className={cn("w-6 h-6 z-10", color)} />
        </div>
    );
}

function MacroStat({ label, value, trend }: { label: string, value: string, trend?: string }) {
    return (
        <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{label}</div>
            <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black uppercase">{value}</div>
                {trend && (
                    <span className={cn(
                        "text-[9px] font-bold",
                        trend.startsWith('+') ? "text-emerald-500" : "text-red-500"
                    )}>{trend}</span>
                )}
            </div>
        </div>
    );
}
