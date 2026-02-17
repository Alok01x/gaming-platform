"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { updateMatchScore } from "../actions";
import { Trophy, Shield, Zap, TrendingUp } from "lucide-react";

interface Match {
    id: string;
    round_index: number;
    match_index: number;
    team_a_id: string | null;
    team_b_id: string | null;
    result_a: number;
    result_b: number;
    status: string;
    winner_id?: string | null;
    scheduled_at?: string | null;
    team_a?: any;
    team_b?: any;
}

function MatchTimer({ date }: { date: string }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useState(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("LIVE");
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${mins}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
            <Zap className="w-2.5 h-2.5" />
            T-MINUS {timeLeft}
        </div>
    );
}

export default function BracketView({ tournamentId, matches, isCreator }: { tournamentId: string, matches: Match[], isCreator: boolean }) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);

    // Group matches by round
    const rounds = Array.from(new Set(matches.map(m => m.round_index))).sort((a, b) => b - a);

    const handleScoreUpdate = async () => {
        if (!selectedMatch) return;
        await updateMatchScore(selectedMatch.id, scoreA, scoreB);
        setSelectedMatch(null);
    };

    return (
        <div className="space-y-12 overflow-x-auto pb-12">
            <div className="flex gap-16 min-w-max px-4">
                {rounds.map(roundIdx => (
                    <div key={roundIdx} className="space-y-8 flex flex-col justify-around">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
                            {roundIdx === 0 ? "Grand Finals" : `Round ${roundIdx}`}
                        </h4>
                        {matches
                            .filter(m => m.round_index === roundIdx)
                            .sort((a, b) => a.match_index - b.match_index)
                            .map(match => (
                                <div
                                    key={match.id}
                                    onClick={() => isCreator && setSelectedMatch(match)}
                                    className={cn(
                                        "w-64 glass-panel p-4 border transition-all cursor-pointer group",
                                        match.status === 'COMPLETED' ? "border-green-500/20 shadow-green-500/5" : "border-foreground/10 hover:border-primary/50",
                                        selectedMatch?.id === match.id && "border-primary ring-1 ring-primary/50"
                                    )}
                                >
                                    <div className="space-y-3">
                                        {match.status === 'PENDING' && match.scheduled_at && (
                                            <div className="mb-2">
                                                <MatchTimer date={match.scheduled_at} />
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-5 h-5 rounded-full bg-secondary shrink-0 border border-border" />
                                                <span className={cn("text-[10px] font-bold uppercase truncate", match.winner_id === match.team_a_id && match.team_a_id && "text-primary")}>
                                                    {match.team_a?.name || "TBD"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black">{match.result_a}</span>
                                        </div>
                                        <div className="h-px bg-foreground/5 w-full" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-5 h-5 rounded-full bg-secondary shrink-0 border border-border" />
                                                <span className={cn("text-[10px] font-bold uppercase truncate", match.winner_id === match.team_b_id && match.team_b_id && "text-primary")}>
                                                    {match.team_b?.name || "TBD"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black">{match.result_b}</span>
                                        </div>
                                    </div>

                                    {isCreator && match.status !== 'COMPLETED' && (
                                        <div className="mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary">Input Tactical Data</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {/* Score Input Overlay */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md glass-panel p-8 border-primary/50 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Record Match Outcome</h3>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{selectedMatch.team_a?.name || "Team A"}</p>
                                <input
                                    type="number"
                                    value={scoreA}
                                    onChange={(e) => setScoreA(parseInt(e.target.value))}
                                    className="w-full h-16 bg-secondary/50 border border-border rounded-2xl text-3xl font-black text-center focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-4 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{selectedMatch.team_b?.name || "Team B"}</p>
                                <input
                                    type="number"
                                    value={scoreB}
                                    onChange={(e) => setScoreB(parseInt(e.target.value))}
                                    className="w-full h-16 bg-secondary/50 border border-border rounded-2xl text-3xl font-black text-center focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="flex-1 h-12 border border-border rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleScoreUpdate}
                                className="flex-1 h-12 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                            >
                                Confirm Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
