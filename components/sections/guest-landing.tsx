"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Trophy, Target } from "lucide-react";
import Link from "next/link";

export function GuestLanding() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">
                            Next-Gen Esports Orchestration
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-7xl md:text-9xl font-black font-heading tracking-tight leading-[0.85] mb-8 uppercase"
                    >
                        SCALE. <span className="text-primary italic">MASTERY.</span> <br /> WIN BIG.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-muted-foreground mb-12 leading-relaxed"
                    >
                        The world's most advanced competitive orchestration platform.
                        Precision brackets, real-time analytics, and professional-grade infrastructure for organizations that play to lead.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/auth/register">
                            <button className="h-16 px-12 bg-foreground text-background font-black uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                                START COMPETING <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="/auth/login">
                            <button className="h-16 px-12 bg-secondary border border-border text-foreground font-black uppercase tracking-widest text-sm rounded-full hover:bg-foreground/5 transition-all">
                                Command Center
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
                <ValueProp
                    icon={Target}
                    title="Skill-First"
                    desc="Our engine is built for precision. Advanced matchmaking and objective scoring ensure the best rise to the top."
                />
                <ValueProp
                    icon={Shield}
                    title="Absolute Integrity"
                    desc="Integrated anti-cheat coordination and verified match reporting maintain the purity of competition."
                />
                <ValueProp
                    icon={Zap}
                    title="Real-time Analytics"
                    desc="Deep performance data for every operative. Track KD, objective impact, and tactical consistency."
                />
            </div>

            {/* Platform Stats / Social Proof */}
            <div className="max-w-7xl mx-auto px-6 border-t border-border/20 pt-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <StatItem value="50K+" label="Active Operatives" />
                    <StatItem value="1.2M" label="Matches Orchestrated" />
                    <StatItem value="99.9%" label="Uptime Integrity" />
                    <StatItem value="24/7" label="Tactical Support" />
                </div>
            </div>
        </div>
    );
}

function ValueProp({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="glass-panel p-10 group hover:border-primary/30 transition-all">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}

function StatItem({ value, label }: { value: string, label: string }) {
    return (
        <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-primary">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        </div>
    );
}
