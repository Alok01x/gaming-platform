import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy, Plus, ShieldCheck, AlertCircle, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { TournamentCard } from "@/components/tournaments/tournament-card";

export default async function OrganizerDashboard() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

    if (!profile || profile.role !== "ORGANIZER") {
        redirect("/dashboard");
    }

    const { data: createdTournaments } = await supabase
        .from("tournaments")
        .select("*")
        .eq("creator_id", userData.user.id);

    if (!profile.is_verified) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="glass-panel p-12 text-center relative overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <ShieldCheck className="w-10 h-10 text-primary" />
                            </div>

                            <h1 className="text-4xl font-black font-heading tracking-tighter uppercase mb-6">
                                Application <span className="text-primary italic">Pending</span>
                            </h1>

                            <p className="text-muted-foreground mb-10 leading-relaxed text-sm uppercase tracking-widest font-bold opacity-80">
                                Your Architect credentials are currently being verified by high-command.
                                Access to arena orchestration is restricted until your clearance is authorized.
                            </p>

                            <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                <div className="p-4 rounded-xl bg-foreground/5 border border-border/50 flex items-center gap-4 text-left">
                                    <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">
                                        Verification typically takes 24-48 operational hours.
                                    </div>
                                </div>
                                <Link href="/" className="w-full p-4 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all">
                                    Return to Neutral Zone
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-4">
                            Architect <span className="text-primary italic">Command</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back, Architect {profile.gamertag}. Oversee your arenas and orchestrate dominance.
                        </p>
                    </div>
                    <Link href="/tournaments/create">
                        <button className="h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                            <Plus className="w-4 h-4" /> Launch New Arena
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    <DashboardStat icon={Trophy} label="Active Arenas" value={createdTournaments?.length || 0} />
                    <DashboardStat icon={LayoutDashboard} label="Global Impact" value="High" />
                    <DashboardStat icon={Settings} label="Operational Status" value="Optimised" />
                </div>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                        <span className="w-8 h-px bg-foreground/20" /> Strategic Arenas
                    </h2>
                    {createdTournaments && createdTournaments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {createdTournaments.map(t => (
                                <TournamentCard key={t.id} tournament={t} isOwner={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-panel border-dashed">
                            <p className="text-muted-foreground uppercase text-xs font-bold tracking-[0.2em] mb-6">No arenas launched under your command.</p>
                            <Link href="/tournaments/create" className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Initialize First Arena &rarr;</Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function DashboardStat({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="glass-panel p-8 hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
    );
}
