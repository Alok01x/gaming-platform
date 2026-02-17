import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Shield, Plus, ArrowRight, LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch Profile & Team Data
    const { data: profile } = await supabase
        .from("profiles")
        .select("gamertag, role")
        .eq("id", user.id)
        .single();

    const { data: teamMember } = await supabase
        .from("team_members")
        .select("team_id, role, teams(name, tag)")
        .eq("user_id", user.id)
        .maybeSingle();

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter uppercase mb-6">
                        Command <span className="text-primary italic">Interface</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Welcome back, <span className="text-foreground font-bold">{profile?.gamertag || "Operative"}</span>.
                        Select your operational context.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option 1: Personal Dashboard */}
                    <Link href="/dashboard/player" className="group">
                        <div className="h-full glass-panel p-10 relative overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_50px_rgba(var(--blob-1),0.2)]">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <User className="w-40 h-40" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                    <User className="w-8 h-8 text-primary" />
                                </div>

                                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
                                    Personal <br /> Dossier
                                </h2>
                                <p className="text-muted-foreground mb-12 flex-grow">
                                    Access your individual service record, combat statistics, and career progression.
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                                    Enter Dossier <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Option 2: Team Dashboard / Create Team */}
                    {teamMember ? (
                        <Link href={`/teams/${teamMember.team_id}`} className="group">
                            <div className="h-full glass-panel p-10 relative overflow-hidden transition-all duration-500 hover:border-secondary-foreground/50 hover:shadow-[0_0_50px_rgba(var(--blob-2),0.2)]">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Shield className="w-40 h-40" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-8 border border-secondary/30 group-hover:scale-110 transition-transform duration-500">
                                        <Shield className="w-8 h-8 text-secondary-foreground" />
                                    </div>

                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
                                        {(teamMember.teams as any)?.name || "Squad"} <br /> Command
                                    </h2>
                                    <p className="text-muted-foreground mb-12 flex-grow">
                                        Manage your roster, active deployments, and organization logistics.
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-secondary-foreground group-hover:gap-4 transition-all">
                                        Enter Command <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/teams/create" className="group">
                            <div className="h-full glass-panel p-10 relative overflow-hidden transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Plus className="w-40 h-40" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                        <Plus className="w-8 h-8 text-emerald-500" />
                                    </div>

                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-emerald-500">
                                        Deploy <br /> Organization
                                    </h2>
                                    <p className="text-muted-foreground mb-12 flex-grow">
                                        Founder a new elite organization. Draft operatives and compete for dominance.
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-500 group-hover:gap-4 transition-all">
                                        Initialize Deployment <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
