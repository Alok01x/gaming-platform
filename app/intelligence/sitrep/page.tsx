import { getRecentActivity } from "@/lib/intelligence/actions";
import { cn } from "@/lib/utils";
import { Shield, Zap, Trophy, Users, Globe, Radar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function SitrepPage() {
    const activities = await getRecentActivity(50);

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                        <Globe className="w-3 h-3 animate-pulse" />
                        Live Feed
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-6 leading-none">
                        Intelligence <span className="text-primary italic">Sitreps</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold opacity-60">
                        Synchronized platform telemetry and operative activity tracking.
                    </p>
                </div>

                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="group relative">
                                <div className="absolute left-[-24px] top-6 w-px h-full bg-border/20 group-last:bg-transparent" />
                                <div className="absolute left-[-32px] top-6 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                </div>

                                <div className="glass-panel p-6 border-foreground/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-start gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                            activity.event_type === 'MATCH_WIN' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                activity.event_type === 'TOURNAMENT_START' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                    activity.event_type === 'TEAM_CREATED' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                                        "bg-primary/10 border-primary/20 text-primary"
                                        )}>
                                            {activity.event_type === 'MATCH_WIN' ? <Trophy className="w-6 h-6" /> :
                                                activity.event_type === 'TOURNAMENT_START' ? <Radar className="w-6 h-6" /> :
                                                    activity.event_type === 'TEAM_CREATED' ? <Shield className="w-6 h-6" /> :
                                                        <Zap className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-grow space-y-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                    {activity.event_type.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <p className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                                                {activity.description}
                                            </p>

                                            {activity.actor && (
                                                <div className="flex items-center gap-2 pt-2">
                                                    <div className="w-5 h-5 rounded-full bg-secondary border border-border" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        Operative: <span className="text-foreground">{activity.actor.gamertag}</span>
                                                    </span>
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-muted-foreground font-mono">
                                                        {activity.actor.tactical_id}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel p-20 text-center space-y-6 border-dashed border-2">
                            <Radar className="w-16 h-16 text-muted-foreground/20 mx-auto animate-spin-slow" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Scan complete. No active signals detected.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
