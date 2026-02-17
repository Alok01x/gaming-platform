"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { Users, Trophy, Target, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamProfilePage() {
    const params = useParams();
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewerRole, setViewerRole] = useState<'OWNER' | 'CAPTAIN' | 'PLAYER' | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchTeamIntel() {
            if (!params.teamId) return;

            // 1. Fetch Team Details
            const { data: teamData, error } = await supabase
                .from("teams")
                .select("*")
                .eq("id", params.teamId)
                .single();

            if (error) {
                console.error("Intel retrieval failed:", error);
                setLoading(false);
                return;
            }
            setTeam(teamData);

            // 2. Fetch Roster
            const { data: rosterData } = await supabase
                .from("team_members")
                .select(`
                    role,
                    joined_at,
                    profiles (
                        id,
                        gamertag,
                        avatar_url,
                        rank_tier,
                        total_kills
                    )
                `)
                .eq("team_id", params.teamId)
                .order("role", { ascending: true }); // OWNER first usually if alphabetical, but we might want custom sort later

            setMembers(rosterData || []);

            // 3. Check Viewer Role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const viewer = rosterData?.find((m: any) => m.profiles?.id === user.id);
                if (viewer) {
                    setViewerRole(viewer.role);
                }
            }

            setLoading(false);
        }

        fetchTeamIntel();
    }, [params.teamId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-primary">
                    Decrypting Squad Intel...
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center text-center">
                <div>
                    <h1 className="text-4xl font-black uppercase text-muted-foreground mb-4">404 // MIA</h1>
                    <p className="text-sm font-bold uppercase tracking-widest">Squad not found in registry.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header / Banner */}
                <div className="relative mb-20">
                    <div className="h-64 w-full bg-gradient-to-r from-secondary to-background border-b border-border/50 rounded-3xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-background to-transparent">
                            <div className="flex items-end gap-8">
                                <div className="w-32 h-32 bg-background rounded-2xl border-2 border-border flex items-center justify-center overflow-hidden shadow-2xl">
                                    {team.logo_url ? (
                                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="w-12 h-12 text-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="mb-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
                                        Established {new Date(team.created_at).getFullYear()}
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter loading-none">
                                        <span className="text-muted-foreground/50 mr-2">[{team.tag}]</span>
                                        {team.name}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Command Controls (Owner/Captain Only) */}
                    {(viewerRole === 'OWNER' || viewerRole === 'CAPTAIN') && (
                        <div className="lg:col-span-12 mb-8 glass-panel p-6 border-l-4 border-l-primary flex items-center justify-between">
                            <div>
                                <h3 className="font-black uppercase tracking-tight text-lg mb-1">Command Authorization Active</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Level 4 Clearance Granted</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="h-10 px-6 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-lg hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                                    <User className="w-4 h-4" /> Recruit
                                </button>
                                <button className="h-10 px-6 bg-secondary border border-border font-black uppercase tracking-widest text-xs rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2">
                                    Edit Intel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Roster Column */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary" /> Active Roster
                            </h2>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {members.length} Operatives
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.map((member: any) => (
                                <div key={member.profiles?.id} className="glass-panel p-6 flex items-center gap-4 hover:border-primary/30 transition-all">
                                    <div className="w-12 h-12 bg-secondary rounded-full border border-border flex items-center justify-center overflow-hidden">
                                        {member.profiles?.avatar_url ? (
                                            <img src={member.profiles.avatar_url} alt={member.profiles.gamertag} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold uppercase tracking-tight">{member.profiles?.gamertag || "Unknown"}</h3>
                                            {member.role === 'OWNER' && (
                                                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-black uppercase tracking-widest">CDR</span>
                                            )}
                                            {member.role === 'CAPTAIN' && (
                                                <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-black uppercase tracking-widest">CPT</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                                            <span>{member.profiles?.rank_tier}</span>
                                            <span className="w-1 h-1 bg-border rounded-full" />
                                            <span>{member.profiles?.total_kills} Kills</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-panel p-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Squad Metrics</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                                        <Trophy className="w-4 h-4 text-amber-500" /> Championships
                                    </div>
                                    <div className="text-xl font-black">0</div>
                                    {/* TODO: Connect to real team stats */}
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                                        <Target className="w-4 h-4 text-primary" /> Win Ratio
                                    </div>
                                    <div className="text-xl font-black">--%</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                                        <Calendar className="w-4 h-4 text-muted-foreground" /> Next Match
                                    </div>
                                    <div className="text-xs font-black uppercase text-muted-foreground">TBD</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border border-dashed border-border rounded-xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                                Squad Description
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                {team.description || "No tactical briefing available."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
