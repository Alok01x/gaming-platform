"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Shield, Zap, Activity, Award, BarChart3, ChevronRight, Hash } from "lucide-react";
import Image from "next/image";
import { PerformanceGraph } from "@/components/profile/performance-graph";

export default function ProfilePage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Personnel Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-panel p-8 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                <div className="w-full h-full rounded-full border-2 border-primary p-1 bg-background relative z-10">
                                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                                        <Activity className="w-12 h-12 text-primary" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Ghost_Unit_01</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Operative Status: Active</p>

                            <div className="flex justify-center gap-4 mb-8">
                                <StatBadge label="Level" value="48" />
                                <StatBadge label="Rank" value="Elite" />
                                <StatBadge label="Role" value="Duelist" />
                            </div>

                            <div className="space-y-4 text-left border-t border-border/50 pt-8">
                                <ProfileDetail label="Personnel ID" value="#GA-9928-TX" />
                                <ProfileDetail label="Affiliation" value="Neon Shadows Org" />
                                <ProfileDetail label="Commissioned" value="Feb 12, 2026" />
                            </div>

                            <button className="w-full mt-8 bg-foreground text-background py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-[1.02] transition-all shadow-2xl">
                                Request Engagement
                            </button>
                        </div>

                        <div className="glass-panel p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Service Medals
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <Medal icon={Trophy} color="text-amber-500" title="Arena Legend" />
                                <Medal icon={Target} color="text-red-500" title="Precision Operative" />
                                <Medal icon={Shield} color="text-primary" title="Defensive Core" />
                                <Medal icon={Zap} color="text-purple-500" title="Rapid Response" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tactical Intelligence */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Performance Intelligence */}
                        <div className="glass-panel p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                        Tactical <span className="text-foreground/40">Performance</span>
                                    </h2>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Real-time skill trajectory analysis</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Operational Grade</div>
                                    <div className="text-3xl font-black text-primary italic">S+</div>
                                </div>
                            </div>

                            <PerformanceGraph />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-t border-border/50 pt-10">
                                <MacroStat label="Target Accuracy" value="32.4%" trend="+2.1%" />
                                <MacroStat label="Conflict Rate" value="1.42" trend="-0.08" />
                                <MacroStat label="Win Frequency" value="68%" trend="+5%" />
                                <MacroStat label="Tactical XP" value="2.4M" />
                            </div>
                        </div>

                        {/* Operational Log */}
                        <div className="glass-panel p-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Mission History</h3>
                            <div className="space-y-4">
                                <MissionLogEntry
                                    operation="Elite Masters Cup"
                                    result="CHAMPION"
                                    impact="+250 RP"
                                    date="02.14.26"
                                />
                                <MissionLogEntry
                                    operation="ShatterPoint Pro"
                                    result="TOP 4"
                                    impact="+85 RP"
                                    date="02.10.26"
                                />
                                <MissionLogEntry
                                    operation="Ranked Scrimmage"
                                    result="VICTORY"
                                    impact="+12 RP"
                                    date="02.08.26"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBadge({ label, value }: { label: string, value: string }) {
    return (
        <div className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/5">
            <div className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</div>
            <div className="text-xs font-black">{value}</div>
        </div>
    );
}

function ProfileDetail({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{label}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{value}</span>
        </div>
    );
}

function Medal({ icon: Icon, color, title }: { icon: any, color: string, title: string }) {
    return (
        <div className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-help" title={title}>
            <Icon className={cn("w-6 h-6", color)} />
        </div>
    );
}

function MacroStat({ label, value, trend }: { label: string, value: string, trend?: string }) {
    return (
        <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{label}</div>
            <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black">{value}</div>
                {trend && (
                    <span className={cn(
                        "text-[9px] font-bold",
                        trend.startsWith('+') ? "text-emerald-500" : "text-red-500"
                    )}>{trend}</span>
                )}
            </div>
        </div>
    );
}

function MissionLogEntry({ operation, result, impact, date }: { operation: string, result: string, impact: string, date: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-foreground/5 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-[10px] text-primary">
                    <Activity className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-xs font-black uppercase tracking-tight">{operation}</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">{date}</div>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Impact</div>
                    <div className="text-xs font-black text-emerald-500">{impact}</div>
                </div>
                <div className="px-4 py-2 rounded-full bg-foreground/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-background transition-colors">
                    {result}
                </div>
            </div>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
