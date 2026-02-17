import { createClient } from "@/lib/supabase/server";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Search, Filter, Plus, Target, ShieldAlert, Sword, Zap, Crosshair, Car, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SUPPORTED_GAMES } from "@/lib/constants";

const ICON_MAP: Record<string, any> = {
    Target, ShieldAlert, Sword, Zap, Crosshair, Car, Gamepad2
};

export default async function TournamentsPage({
    searchParams,
}: {
    searchParams: Promise<{ game?: string }>;
}) {
    const { game: activeGame } = await searchParams;
    const supabase = await createClient();

    let query = supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

    if (activeGame) {
        query = query.eq("game_type", activeGame);
    }

    const { data: tournaments } = await query;

    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = userData.user
        ? await supabase.from("profiles").select("role, is_verified").eq("id", userData.user.id).single()
        : { data: null };

    const canLaunch = profile?.role === "ORGANIZER" && profile?.is_verified;

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-4">
                            Active <span className="italic opacity-30">Arenas</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            Join the league of elite competitors. Choose your game, build your team, and dominate the leaderboard.
                        </p>
                    </div>

                    {canLaunch && (
                        <Link href="/tournaments/create">
                            <button className="h-14 px-10 bg-foreground text-background font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                                <Plus className="w-4 h-4" /> Launch Arena
                            </button>
                        </Link>
                    )}
                </div>

                {/* Game Selection Bar */}
                <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
                    <Link
                        href="/tournaments"
                        className={cn(
                            "flex-none px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            !activeGame
                                ? "bg-foreground text-background border-foreground"
                                : "bg-secondary/50 border-border text-muted-foreground hover:border-foreground/30"
                        )}
                    >
                        All Operations
                    </Link>
                    {SUPPORTED_GAMES.map((game) => {
                        const Icon = ICON_MAP[game.icon] || Gamepad2;
                        const isActive = activeGame === game.id;
                        return (
                            <Link
                                key={game.id}
                                href={`/tournaments?game=${game.id}`}
                                className={cn(
                                    "flex-none px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-foreground/30"
                                )}
                            >
                                <Icon className="w-3 H-3" />
                                {game.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Grid */}
                {tournaments && tournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tournaments.map((tournament) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-panel border-dashed">
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em]">
                            No active {activeGame ? activeGame.toUpperCase() : ""} arenas detected in your sector.
                        </p>
                        {canLaunch && (
                            <Link href="/tournaments/create" className="inline-block mt-8 text-foreground font-black uppercase text-[10px] tracking-widest hover:underline underline-offset-8">
                                Create First Intel &rarr;
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
