import { Hero } from "@/components/sections/hero";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Zap, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";

export async function AuthenticatedHome() {
    const supabase = await createClient();

    const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .limit(3)
        .order("created_at", { ascending: false });

    return (
        <main>
            <Hero />

            {/* Featured Tournaments */}
            <section className="py-24 px-6 bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight uppercase mb-4">
                                Elite <span className="text-primary italic">Live</span> Events
                            </h2>
                            <p className="text-muted-foreground max-w-xl">
                                The most high-stakes competition happens here. Join active tournaments and prove your dominance.
                            </p>
                        </div>
                        <Link href="/tournaments" className="text-sm font-bold uppercase tracking-widest text-primary hover:underline underline-offset-8">
                            View All Arenas &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tournaments && tournaments.map((t) => (
                            <TournamentCard key={t.id} tournament={t} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tight uppercase mb-6">
                            Built for <span className="text-primary italic">Champions</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            GamerNotFound provides the professional-grade tools required to run, track, and win high-performance esports events at scale.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={Zap}
                            title="Real-time Stats"
                            description="Automated kill tracking and placement logic for BGMI, Valorant, and more."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Anti-Cheat Ops"
                            description="Proprietary monitoring and verification systems to ensure fair play."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Advanced Analytics"
                            description="Deep-dive into player performance with professional-grade data visualization."
                        />
                        <FeatureCard
                            icon={Trophy}
                            title="Instant Payouts"
                            description="Secure, automated prize pool distribution to winners via integrated secure gateways."
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-8 glass-panel group hover:bg-primary/5 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-8 border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    )
}
