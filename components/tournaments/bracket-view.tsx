"use client";

import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";

interface team {
    id: string;
    name: string;
    tag: string;
    score?: number;
    winner?: boolean;
}

interface Match {
    id: string;
    teamA?: team;
    teamB?: team;
    status: 'PENDING' | 'LIVE' | 'COMPLETED';
}

interface Round {
    title: string;
    matches: Match[];
}

const MOCK_BRACKET: Round[] = [
    {
        title: "Quarter-Finals",
        matches: [
            { id: '1', teamA: { id: 'a1', name: 'Neon Shadows', tag: 'NEON', score: 2 }, teamB: { id: 'b1', name: 'Ghost Squad', tag: 'GHOST', score: 1 }, status: 'COMPLETED' },
            { id: '2', teamA: { id: 'a2', name: 'Cyber Vipers', tag: 'CYBER', score: 0 }, teamB: { id: 'b2', name: 'Ethereal', tag: 'ETH', score: 2 }, status: 'COMPLETED' },
            { id: '3', teamA: { id: 'a3', name: 'Apex Raiders', tag: 'APEX', score: 2 }, teamB: { id: 'b3', name: 'Void Walkers', tag: 'VOID', score: 1 }, status: 'COMPLETED' },
            { id: '4', teamA: { id: 'a4', name: 'Titan Ops', tag: 'TITAN', score: 1 }, teamB: { id: 'b4', name: 'Nexus Prime', tag: 'NEXUS', score: 2 }, status: 'COMPLETED' },
        ]
    },
    {
        title: "Semi-Finals",
        matches: [
            { id: '5', teamA: { id: 'a1', name: 'Neon Shadows', tag: 'NEON' }, teamB: { id: 'b2', name: 'Ethereal', tag: 'ETH' }, status: 'PENDING' },
            { id: '6', teamA: { id: 'a3', name: 'Apex Raiders', tag: 'APEX' }, teamB: { id: 'b4', name: 'Nexus Prime', tag: 'NEXUS' }, status: 'PENDING' },
        ]
    },
    {
        title: "Grand Finals",
        matches: [
            { id: '7', status: 'PENDING' }
        ]
    }
];

export function BracketView() {
    return (
        <div className="w-full overflow-x-auto pb-12 scrollbar-hide">
            <div className="flex gap-16 min-w-max px-6">
                {MOCK_BRACKET.map((round, roundIdx) => (
                    <div key={round.title} className="flex flex-col gap-8 w-80">
                        {/* Round Header */}
                        <div className="text-center mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{round.title}</h3>
                            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full" />
                        </div>

                        {/* Matches */}
                        <div className="flex flex-col justify-around flex-grow gap-12">
                            {round.matches.map((match, matchIdx) => (
                                <div key={match.id} className="relative">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                                        className="glass-panel overflow-hidden border-border/40 hover:border-primary/50 transition-colors shadow-xl"
                                    >
                                        <div className="p-3 bg-foreground/5 flex items-center justify-between border-b border-border/20">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Match #{match.id}</span>
                                            {match.status === 'LIVE' && (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase text-red-500">Live</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <TeamRow team={match.teamA} opponent={match.teamB} />
                                            <div className="h-px bg-border/20" />
                                            <TeamRow team={match.teamB} opponent={match.teamA} />
                                        </div>
                                    </motion.div>

                                    {/* Connection Lines (Visual logic only) */}
                                    {roundIdx < MOCK_BRACKET.length - 1 && (
                                        <div className="absolute top-1/2 -right-16 w-16 h-px bg-border/40" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamRow({ team, opponent }: { team?: team, opponent?: team }) {
    const isWinner = team && opponent && team.score !== undefined && opponent.score !== undefined && team.score > opponent.score;
    const isLoser = team && opponent && team.score !== undefined && opponent.score !== undefined && team.score < opponent.score;

    return (
        <div className={cn(
            "flex items-center justify-between gap-4 transition-opacity",
            !team && "opacity-30",
            isLoser && "opacity-40"
        )}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-black text-[10px] text-primary">
                    {team?.tag || "?"}
                </div>
                <span className="text-xs font-bold uppercase tracking-tight truncate w-32">
                    {team?.name || "TBD"}
                </span>
            </div>
            <span className={cn(
                "text-sm font-black tracking-tighter",
                isWinner ? "text-primary" : "text-muted-foreground"
            )}>
                {team?.score ?? "--"}
            </span>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
