import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy, Users, Star, Activity, BarChart3, Clock, Target, ShieldCheck, Map, Radar } from "lucide-react";
import Link from "next/link";
import { PerformanceGraph, DataPoint } from "@/components/profile/performance-graph";
import { cn } from "@/lib/utils";

export default async function PlayerDashboard() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        redirect("/auth/login");
    }

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

    // 2. Fetch Tournament History (with classification and placement)
    const { data: tournamentHistory } = await supabase
        .from("tournament_participants")
        .select(`
            status,
            placement,
            tournament_kills,
            joined_at,
            tournaments (
                id,
                title,
                game_type,
                classification,
                status,
                start_date
            )
        `)
        .eq("user_id", userData.user.id)
        .order("joined_at", { ascending: false });

    // Fetch Team Memberships with Team Invite Codes
    const { data: teamMemberships } = await supabase
        .from("team_members")
        .select(`
            role,
            joined_at,
            teams (
                id,
                name,
                tag,
                logo_url,
                invite_code
            )
        `)
        .eq("user_id", userData.user.id);

    // 4. Fetch Stats History for the Graph
    const { data: statsHistory } = await supabase
        .from("user_stats_history")
        .select("recorded_at, rank_points")
        .eq("user_id", userData.user.id)
        .order("recorded_at", { ascending: true })
        .limit(10);

    // Transform stats history for graph
    const graphData: DataPoint[] = statsHistory?.map(s => ({
        label: new Date(s.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: s.rank_points
    })) || [
            { label: "Phase 1", value: 10 },
            { label: "Phase 2", value: 25 },
            { label: "Phase 3", value: 45 },
            { label: "Phase 4", value: 60 },
            { label: "Phase 5", value: 85 }
        ];

    const activeEngagements = (tournamentHistory as any[])?.filter(h => {
        const t = Array.isArray(h.tournaments) ? h.tournaments[0] : h.tournaments;
        return t?.status === 'OPEN' || t?.status === 'LIVE';
    }) || [];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            {profile?.tactical_id && (
                                <div className="px-3 py-1 bg-secondary text-foreground/80 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-border">
                                    ID: {profile.tactical_id}
                                </div>
                            )}
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Active since {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-4">
                            Career <span className="text-foreground/40 italic">Dossier</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Commander {profile?.gamertag}. Objective: Global Dominance.
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                            RANK: {profile?.rank_tier || "RECRUIT"}
                        </div>
                        <Link href="/tournaments" className="px-8 py-4 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all shadow-xl">
                            Find Arena
                        </Link>
                        <Link href="/teams/join" className="px-8 py-4 bg-secondary text-foreground font-black uppercase tracking-widest text-[10px] rounded-full border border-border hover:border-primary/50 transition-all">
                            Join Squad
                        </Link>
                        <Link href="/teams/create" className="px-8 py-4 bg-secondary text-foreground font-black uppercase tracking-widest text-[10px] rounded-full border border-border hover:border-primary/50 transition-all">
                            Create Squad
                        </Link>
                    </div>
                </div>

                {/* Tactical Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
                    <DashboardStat icon={Trophy} label="Arena Wins" value={profile?.wins || 0} color="text-amber-500" />
                    <DashboardStat icon={Target} label="Combat Kills" value={profile?.total_kills || 0} color="text-primary" />
                    <DashboardStat icon={Clock} label="Engagements" value={profile?.matches_played || 0} />
                    <DashboardStat icon={Map} label="Classifications" value={activeEngagements.length} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Intelligence Sector */}
                    <div className="lg:col-span-8 space-y-20">
                        {/* Career Timeline */}
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                                <span className="w-8 h-px bg-foreground/20" /> Engagement Timeline
                            </h2>

                            {/* Active Mission Status */}
                            {activeEngagements.length > 0 && (
                                <div className="mb-20 space-y-8">
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                        <Radar className="w-4 h-4 animate-pulse" /> Active Mission Parameters
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {activeEngagements.map((item: any, idx) => {
                                            const t = Array.isArray(item.tournaments) ? item.tournaments[0] : item.tournaments;
                                            return (
                                                <Link key={idx} href={`/tournaments/${t?.id}`} className="group">
                                                    <div className="glass-panel p-8 border-primary/20 bg-primary/5 hover:border-primary/50 transition-all relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                            <Target className="w-20 h-20" />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Operation</span>
                                                            </div>
                                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{t?.title}</h3>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Status: {t?.status} | Rounds Clear: {item.placement || 0}</p>

                                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                                                Re-Engage Area <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {tournamentHistory && tournamentHistory.length > 0 ? (
                                    tournamentHistory.map((item: any, idx) => {
                                        const t = Array.isArray(item.tournaments) ? item.tournaments[0] : item.tournaments;
                                        return (
                                            <div key={idx} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs",
                                                        t?.classification === 'MAJOR' ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                                    )}>
                                                        {t?.classification?.charAt(0) || 'M'}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                                            {t?.classification} | {t?.game_type}
                                                        </div>
                                                        <h3 className="font-black uppercase tracking-tight text-lg">{t?.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Result</div>
                                                        <div className="font-black text-xl">
                                                            {item.placement ? `#${item.placement}` : t?.status}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kills</div>
                                                        <div className="font-black text-xl">{item.tournament_kills || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-20 glass-panel border-dashed opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Data Recorded</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Squad Roster */}
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                                <span className="w-8 h-px bg-foreground/20" /> Tactical Squads
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {teamMemberships && teamMemberships.length > 0 ? (
                                    teamMemberships.map((membership: any, idx) => {
                                        const team = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams;
                                        return (
                                            <div key={idx} className="glass-panel p-6 group hover:border-primary/50 transition-all">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-foreground/5 rounded-2xl flex items-center justify-center overflow-hidden">
                                                            {team?.logo_url ? (
                                                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Users className="w-6 h-6 text-foreground/20" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Link href={`/teams/${team?.id}`} className="hover:underline underline-offset-4 decoration-primary/50">
                                                                <h3 className="font-black uppercase tracking-tighter text-xl">[{team?.tag}] {team?.name}</h3>
                                                            </Link>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{membership.role}</p>
                                                                {membership.role === 'OWNER' && team?.invite_code && (
                                                                    <span className="text-[8px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono tracking-widest">
                                                                        CODE: {team.invite_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <span>Joined {new Date(membership.joined_at).toLocaleDateString()}</span>
                                                    <Link href={`/teams/${team?.id}`}>
                                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 cursor-pointer" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-20 glass-panel border-dashed opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Squad Affiliations Found</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Intelligence */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="glass-panel p-8 sticky top-32">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
                                <Activity className="w-4 h-4" /> Trajectory Mapping
                            </h2>

                            <div className="mb-8">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Rank Potency Over Time</div>
                                <div className="h-48">
                                    <PerformanceGraph data={graphData} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-border">
                                <SidebarDetail label="Global Standing" value="#1,245" />
                                <SidebarDetail label="Regional Power" value="#82" />
                                <SidebarDetail label="Specialization" value="Tactical Duelist" />
                            </div>

                            <button className="w-full mt-10 p-4 bg-foreground text-background rounded-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                Export Intelligence <BarChart3 className="w-4 h-4" />
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardStat({ icon: Icon, label, value, color = "text-foreground" }: { icon: any, label: string, value: string | number, color?: string }) {
    return (
        <div className="glass-panel p-8 hover:border-foreground/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className={cn("w-6 h-6", color.includes("text-") ? color : "text-foreground/60")} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
    );
}

function SidebarDetail({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{value}</span>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    )
}
