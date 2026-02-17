"use client";

import { motion } from "framer-motion";
import { Users, Shield, Zap, Settings, UserPlus, Trophy, MoreVertical } from "lucide-react";
import { useState } from "react";

interface Member {
    id: string;
    name: string;
    role: 'OWNER' | 'CAPTAIN' | 'PLAYER';
    avatar?: string;
    status: 'online' | 'offline';
}

const MOCK_MEMBERS: Member[] = [
    { id: '1', name: 'GHOST_PRO', role: 'OWNER', status: 'online' },
    { id: '2', name: 'NeonViper', role: 'PLAYER', status: 'online' },
    { id: '3', name: 'ShadowStrike', role: 'PLAYER', status: 'offline' },
];

export function TeamHub({ teamName, teamTag }: { teamName: string, teamTag: string }) {
    const [members] = useState<Member[]>(MOCK_MEMBERS);

    return (
        <div className="space-y-8">
            {/* Team Header */}
            <div className="glass-panel p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-secondary border border-border rounded-2xl flex items-center justify-center text-4xl font-black italic text-primary">
                            {teamTag}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black uppercase tracking-tight">{teamName}</h1>
                                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">
                                    Verified Org
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-60">
                                Elite Command Operations • Established Feb 2026
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-11 px-6 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Recruit Member
                        </button>
                        <button className="w-11 h-11 bg-secondary border border-border rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roster & Recruitment */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Active Roster</h2>
                        <span className="text-[10px] font-bold text-primary">{members.length} / 12 Operatives</span>
                    </div>

                    <div className="grid gap-3">
                        {members.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-panel p-4 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-secondary rounded-full border border-border flex items-center justify-center font-bold text-xs">
                                            {member.name[0]}
                                        </div>
                                        <div className={cn(
                                            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                                            member.status === 'online' ? "bg-green-500" : "bg-zinc-600"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="font-bold uppercase text-sm tracking-tight">{member.name}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            {member.role === 'OWNER' && <span className="text-primary">Operational Lead</span>}
                                            {member.role === 'PLAYER' && <span>Elite Operative</span>}
                                        </div>
                                    </div>
                                </div>

                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Team Stats & Activity */}
                <div className="space-y-8">
                    <div className="glass-panel p-6 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Org Performance</h2>

                        <div className="space-y-4">
                            <StatBox icon={Trophy} label="Event Wins" value="12" color="text-amber-400" />
                            <StatBox icon={Zap} label="Win Rate" value="68%" color="text-primary" />
                            <StatBox icon={Shield} label="Avg Placement" value="#4" color="text-purple-400" />
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Recent Operations</h2>
                        <div className="space-y-4">
                            <ActivityItem title="Victory in CS2 Masters" date="2 days ago" />
                            <ActivityItem title="Recruited ShadowStrike" date="4 days ago" />
                            <ActivityItem title="Registered for Pro Series" date="1 week ago" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-foreground/5">
            <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</span>
            </div>
            <span className="text-lg font-black tracking-tighter">{value}</span>
        </div>
    );
}

function ActivityItem({ title, date }: { title: string, date: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-[10px] font-black uppercase tracking-tight">{title}</div>
            <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{date}</div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
