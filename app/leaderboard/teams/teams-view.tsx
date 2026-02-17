"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Users, ChevronUp, ChevronDown, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Team {
    id: string;
    name: string;
    tag: string;
    logo_url?: string | null;
    member_count: number;
    wins: number;
    points: number;
    rank: number;
}

export function TeamsView({ teams }: { teams: Team[] }) {
    const router = useRouter();
    // Top 3 for Podium
    const topSquads = [teams[1], teams[0], teams[2]].filter(Boolean);

    return (
        <div className="space-y-16">
            {/* Top 3 Podium */}
            {teams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    {/* 2nd Place */}
                    {teams[1] && <TeamPodiumCard team={teams[1]} position={2} />}
                    {/* 1st Place */}
                    {teams[0] && <TeamPodiumCard team={teams[0]} position={1} highlighted />}
                    {/* 3rd Place */}
                    {teams[2] && <TeamPodiumCard team={teams[2]} position={3} />}
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/20 bg-foreground/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-20">Rank</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Squadron</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Operatives</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Wins</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right pr-12">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team) => (
                                <tr
                                    key={team.id}
                                    onClick={() => router.push(`/teams/${team.id}`)}
                                    className="border-b border-border/10 hover:bg-primary/5 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black italic tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">#{team.rank}</span>
                                            {/* Mock Trend for now */}
                                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-secondary rounded-2xl border border-border flex items-center justify-center overflow-hidden">
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold uppercase text-sm tracking-tight group-hover:text-primary transition-colors">{team.name}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">[{team.tag}]</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-sm font-bold tracking-tight text-muted-foreground">
                                        {team.member_count}
                                    </td>
                                    <td className="px-8 py-6 text-center text-sm font-bold tracking-tight text-foreground">
                                        {team.wins}
                                    </td>
                                    <td className="px-8 py-6 text-right pr-12">
                                        <span className="text-lg font-black tracking-tighter text-primary">{team.points.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TeamPodiumCard({ team, position, highlighted }: { team: Team, position: number, highlighted?: boolean }) {
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

            <Link href={`/teams/${team.id}`} className="group relative mb-8 block">
                <div className={cn(
                    "w-24 h-24 rounded-2xl border-2 flex items-center justify-center bg-secondary overflow-hidden transition-all duration-300",
                    highlighted ? "border-primary shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-105" : "border-border group-hover:border-primary/50"
                )}>
                    {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                        <Users className={cn("w-8 h-8", highlighted ? "text-primary" : "text-muted-foreground")} />
                    )}
                </div>
                <div className="absolute -bottom-3 right-[-10px] bg-background border border-border rounded-full w-10 h-10 flex items-center justify-center font-black italic text-primary shadow-lg">
                    #{position}
                </div>
            </Link>

            <h3 className="text-2xl font-black uppercase tracking-tight mb-1 truncate w-full">{team.name}</h3>
            <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-4">[{team.tag}]</p>

            <div className="grid grid-cols-2 gap-8 w-full border-t border-border/20 pt-6 mt-4">
                <div>
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Members</div>
                    <div className="font-bold tracking-tighter">{team.member_count}</div>
                </div>
                <div>
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Rating</div>
                    <div className="font-bold tracking-tighter text-primary">{team.points.toLocaleString()}</div>
                </div>
            </div>
        </motion.div>
    );
}
