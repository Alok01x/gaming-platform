"use client";

import AdminGuard from "@/components/auth/admin-guard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Shield, Users, Trophy, Activity, Ban, CheckCircle, Trash2 } from "lucide-react";
import { banUser, toggleVerification } from "@/app/admin/actions";


export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminDashboard />
        </AdminGuard>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, teams: 0, tournaments: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchIntel() {
            // Fetch Counts
            const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
            const { count: teamCount } = await supabase.from("teams").select("*", { count: 'exact', head: true });
            const { count: tournCount } = await supabase.from("tournaments").select("*", { count: 'exact', head: true });

            setStats({
                users: userCount || 0,
                teams: teamCount || 0,
                tournaments: tournCount || 0
            });

            // Fetch Recent Users
            const { data: recentUsers } = await supabase
                .from("profiles")
                .select("*")
                .order("updated_at", { ascending: false })
                .limit(10);

            setUsers(recentUsers || []);
            setLoading(false);
        }

        fetchIntel();
    }, []);

    const handleBan = async (id: string) => {
        if (!confirm("CONFIRM BAN PROTOCOL? This is irreversible.")) return;
        try {
            await banUser(id);
            alert("Ban Protocol Executed Successfully.");
            // Optimistic Update
            setUsers(users.filter(u => u.id !== id));
        } catch (e: any) {
            alert("Access Denied: " + e.message);
        }
    };

    const handleVerify = async (id: string, currentStatus: boolean) => {
        try {
            await toggleVerification(id, currentStatus);
            // Optimistic Update
            setUsers(users.map(u => u.id === id ? { ...u, is_verified: !currentStatus } : u));
        } catch (e: any) {
            alert("Access Denied: " + e.message);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight uppercase mb-4 text-red-500">
                            High <span className="text-foreground italic">Command</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl font-bold uppercase tracking-widest text-[10px] opacity-60">
                            Restricted Access • Clearance Level 5 • Oversight Protocol
                        </p>
                    </div>
                    <Shield className="w-16 h-16 text-red-500 opacity-20" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard icon={Users} label="Operatives" value={stats.users} color="text-primary" />
                    <StatCard icon={Users} label="Squadrons" value={stats.teams} color="text-amber-500" />
                    <StatCard icon={Trophy} label="Arenas" value={stats.tournaments} color="text-emerald-500" />
                </div>

                {/* Operations Console */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Management */}
                    <div className="lg:col-span-2 glass-panel p-6">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-red-500" /> Live Operative Feed
                        </h2>

                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                            {user.gamertag?.[0] || "?"}
                                        </div>
                                        <div>
                                            <div className="font-bold uppercase text-sm tracking-tight">{user.gamertag}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground tracking-widest">{user.role} • {user.tactical_id}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVerify(user.id, user.is_verified)}
                                            className={`p-2 rounded-lg border transition-all ${user.is_verified ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-secondary border-border text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                                            title="Toggle Verification"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBan(user.id)}
                                            className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
                                            title="Ban User"
                                        >
                                            <Ban className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Log Mock */}
                    <div className="glass-panel p-6 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <h2 className="text-xl font-black uppercase tracking-tight mb-6">System Log</h2>
                        <div className="space-y-6 relative z-10">
                            {[1].map((i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-1 h-full min-h-[40px] bg-border relative">
                                        <div className="absolute top-1.5 -left-[3px] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    </div>
                                    <div className="pb-6 border-b border-border/20 w-full">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
                                            Security Alert • LIVE
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            High Command clearance detected. Admin Protocols engaged.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-panel p-6 flex items-center justify-between hover:border-foreground/20 transition-all">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
                <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
