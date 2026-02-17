import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Trophy, Calendar, Users, Shield, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { joinTournament } from "../actions";

interface PageProps {
    params: { id: string };
}

export default async function TournamentDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: tournament, error } = await supabase
        .from("tournaments")
        .select("*, tournament_participants(count)")
        .eq("id", id)
        .single();

    if (error || !tournament) {
        notFound();
    }

    const { data: userData } = await supabase.auth.getUser();
    const isCreator = userData.user?.id === tournament.creator_id;

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/tournaments"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-3 py-1 bg-foreground/10 text-foreground border border-foreground/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {tournament.game_type}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    tournament.status === "LIVE" ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-green-500/10 text-green-500"
                                )}>
                                    {tournament.status}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-6 leading-[0.9]">
                                {tournament.title}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <StatCard icon={Trophy} label="Prize Pool" value={tournament.prize_pool || "$0"} />
                            <StatCard icon={Users} label="Enlisted" value={tournament.tournament_participants[0]?.count || 0} />
                            <StatCard icon={Calendar} label="Commencement" value={new Date(tournament.start_date).toLocaleDateString()} />
                            <StatCard icon={Zap} label="Format" value="Double Elim" />
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-widest">Rules of Engagement</h3>
                            <div className="glass-panel p-8 whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {tournament.rules}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="glass-panel p-8 sticky top-40 border-foreground/20">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-muted-foreground">Action Center</h4>

                            <form action={async () => {
                                "use server";
                                await joinTournament(tournament.id);
                            }}>
                                <button className="w-full h-14 bg-foreground text-background font-black uppercase tracking-widest text-xs rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl mb-4">
                                    Join Arena
                                </button>
                            </form>

                            <button className="w-full h-14 bg-secondary border border-border text-foreground font-black uppercase tracking-widest text-xs rounded-full hover:bg-foreground/5 transition-all">
                                Share Intel
                            </button>

                            {isCreator && (
                                <div className="mt-8 pt-8 border-t border-border">
                                    <button className="w-full h-12 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-red-500/20 transition-all">
                                        Terminate Operation
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border border-border rounded-2xl bg-foreground/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-5 h-5 text-foreground/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Security Verified</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
                                This arena is protected by Elite Anti-Cheat protocols. All participants must undergo verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="p-6 bg-secondary/50 border border-border rounded-2xl">
            <Icon className="w-5 h-5 text-foreground/40 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-lg font-black tracking-tight">{value}</p>
        </div>
    );
}
