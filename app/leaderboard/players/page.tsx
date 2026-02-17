"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Target, Zap, ChevronUp, ChevronDown } from "lucide-react";

const RADIANT_LEADERS = [
    { rank: 1, name: "GHOST_PRO", team: "NEON", kills: 1420, wins: 45, points: 12500, trend: 'up' },
    { rank: 2, name: "XenonHunter", team: "VOID", kills: 1380, wins: 42, points: 11200, trend: 'up' },
    { rank: 3, name: "ViperKing", team: "ETH", kills: 1250, wins: 38, points: 10800, trend: 'down' },
    { rank: 4, name: "Shadow01", team: "NEON", kills: 1100, wins: 35, points: 9500, trend: 'up' },
    { rank: 5, name: "MortalFlame", team: "TITAN", kills: 1050, wins: 32, points: 8900, trend: 'down' },
    { rank: 6, name: "CyberNinja", team: "RONIN", kills: 980, wins: 30, points: 8500, trend: 'up' },
    { rank: 7, name: "FrostBite", team: "ICE", kills: 920, wins: 28, points: 8100, trend: 'down' },
    { rank: 8, name: "NeonSpectre", team: "NEON", kills: 890, wins: 27, points: 7800, trend: 'up' },
    { rank: 9, name: "VoidWalker", team: "VOID", kills: 850, wins: 25, points: 7500, trend: 'up' },
    { rank: 10, name: "TitanSlayer", team: "TITAN", kills: 820, wins: 24, points: 7200, trend: 'down' },
    { rank: 11, name: "StormBreaker", team: "ETH", kills: 780, wins: 22, points: 6900, trend: 'up' },
    { rank: 12, name: "PhoenixRise", team: "SOL", kills: 750, wins: 20, points: 6600, trend: 'up' },
];

export default function LeaderboardPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight uppercase mb-4">
                            Global <span className="text-primary italic">Elite</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl font-bold uppercase tracking-widest text-[10px] opacity-60">
                            Hall of Commanders • All Platforms • Seasonal Rankings
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <select className="bg-secondary border border-border rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-colors">
                            <option>All Games</option>
                            <option>VALORANT</option>
                            <option>BGMI</option>
                            <option>CS2</option>
                        </select>
                    </div>
                </div>

                {/* Top 3 Podium (Conceptual Social Proof) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <PodiumCard leader={RADIANT_LEADERS[1]} position={2} />
                    <PodiumCard leader={RADIANT_LEADERS[0]} position={1} highlighted />
                    <PodiumCard leader={RADIANT_LEADERS[2]} position={3} />
                </div>

                {/* Leaderboard Table */}
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/20 bg-foreground/5">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-20">Rank</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Commander</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Kills</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Wins</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right pr-12">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RADIANT_LEADERS.map((leader) => (
                                    <tr key={leader.name} className="border-b border-border/10 hover:bg-primary/5 transition-colors cursor-pointer group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-black italic tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">#{leader.rank}</span>
                                                {leader.trend === 'up' ? <ChevronUp className="w-3 h-3 text-green-500" /> : <ChevronDown className="w-3 h-3 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-secondary rounded-full border border-border flex items-center justify-center font-bold text-xs">
                                                    {leader.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold uppercase text-sm tracking-tight">{leader.name}</div>
                                                    <div className="text-[10px] font-bold text-primary tracking-widest uppercase">[{leader.team}]</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-sm font-bold tracking-tight">{leader.kills.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-center text-sm font-bold tracking-tight">{leader.wins}</td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            <span className="text-lg font-black tracking-tighter text-primary">{leader.points.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

function PodiumCard({ leader, position, highlighted }: { leader: any, position: number, highlighted?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: position * 0.1 }}
            className={cn(
                "glass-panel p-8 text-center relative overflow-hidden flex flex-col items-center",
                highlighted && "border-primary/50 bg-primary/5 scale-105 z-10"
            )}
        >
            {highlighted && (
                <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
            )}
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-6">Rank #{position}</div>
            <div className="relative mb-8">
                <div className={cn(
                    "w-24 h-24 rounded-full border-2 flex items-center justify-center bg-secondary",
                    highlighted ? "border-primary shadow-[0_0_30px_rgba(6,182,212,0.3)]" : "border-border"
                )}>
                    {position === 1 ? <Medal className="w-10 h-10 text-primary" /> : <Trophy className="w-8 h-8 opacity-40" />}
                </div>
                <div className="absolute -bottom-2 right-0 bg-background border border-border rounded-full w-10 h-10 flex items-center justify-center font-black italic text-primary">
                    +{leader.wins}
                </div>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{leader.name}</h3>
            <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-4">[{leader.team}]</p>
            <div className="grid grid-cols-2 gap-8 w-full border-t border-border/20 pt-6 mt-4">
                <div>
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Kills</div>
                    <div className="font-bold tracking-tighter">{leader.kills.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Points</div>
                    <div className="font-bold tracking-tighter">{leader.points.toLocaleString()}</div>
                </div>
            </div>
        </motion.div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
