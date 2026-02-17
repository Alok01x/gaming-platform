"use client";

import { Trophy, Users, ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tournament } from "@/lib/mock-data";
import { motion } from "framer-motion";
import Link from "next/link";
import { SUPPORTED_GAMES } from "@/lib/constants";

interface TournamentCardProps {
    tournament: any;
    isOwner?: boolean;
}

export function TournamentCard({ tournament, isOwner = false }: TournamentCardProps) {
    const isLive = tournament.status === "LIVE";
    const isOpen = tournament.status === "OPEN";

    const game = SUPPORTED_GAMES.find(g => g.id === tournament.game_type);

    return (
        <Link href={`/tournaments/${tournament.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative glass-panel p-6 hover:border-primary/50 transition-all duration-300 h-full overflow-hidden"
            >
                {/* Visual Accent */}
                {game && (
                    <div
                        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-16 -mt-16 transition-all group-hover:opacity-40"
                        style={{ backgroundColor: game.color }}
                    />
                )}

                {/* Status Badge */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <span
                        className="text-[10px] font-black tracking-[0.2em] uppercase"
                        style={{ color: game?.color || 'var(--primary)' }}
                    >
                        {game?.name || tournament.game_type}
                    </span>
                    <div className={cn(
                        "px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border",
                        isLive ? "bg-foreground/10 border-foreground/20 text-foreground animate-pulse" :
                            isOpen ? "bg-foreground/5 border-foreground/10 text-foreground" :
                                "bg-muted border-border text-muted-foreground"
                    )}>
                        {tournament.status}
                    </div>
                </div>

                <h3 className="text-2xl font-black font-heading tracking-tight mb-2 group-hover:text-foreground/80 transition-colors text-foreground">
                    {tournament.title}
                </h3>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-bold">{tournament.prize_pool || "TBD"}</span> Prize Pool
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span suppressHydrationWarning>
                            {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : "Schedule TBD"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className={cn(
                        "px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all",
                        isOwner ? "bg-primary text-primary-foreground group-hover:scale-105" :
                            isOpen ? "bg-foreground text-background group-hover:scale-105" :
                                "bg-muted text-muted-foreground cursor-not-allowed"
                    )}>
                        {isOwner ? "Manage Arena" : isOpen ? "Join Arena" : "View Details"}
                    </div>
                    <div className="text-foreground/50 group-hover:text-foreground transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                        Details <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm" />
            </motion.div>
        </Link>
    );
}
