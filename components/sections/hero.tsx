"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                            Live Tournament Engine v2.0
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-[0.9] mb-8 uppercase"
                    >
                        SCALE. <span className="text-primary italic">DOMINATE.</span> <br /> EXCEL.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl text-lg text-muted-foreground mb-12 leading-relaxed"
                    >
                        The world's most advanced competitive orchestration platform.
                        Precision brackets, real-time analytics, and professional-grade infrastructure for organizations that play to lead.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link href="/tournaments">
                            <button className="h-16 px-12 bg-foreground text-background font-black uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                                START COMPETING <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Tournament Ticker */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <TournCard
                        game="VALORANT"
                        title="Elite Champions Cup"
                        prize="$50,000"
                        status="OPEN"
                    />
                    <TournCard
                        game="BGMI"
                        title="Pro Series Season 4"
                        prize="₹10,00,000"
                        status="LIVE"
                        isLive
                    />
                    <TournCard
                        game="CS2"
                        title="Global Offensive Masters"
                        prize="$120,000"
                        status="UPCOMING"
                    />
                </motion.div>
            </div>
        </section>
    );
}

function TournCard({ game, title, prize, status, isLive }: { game: string, title: string, prize: string, status: string, isLive?: boolean }) {
    return (
        <div className="glass-panel p-6 group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black tracking-widest text-primary/60">{game}</span>
                <div className={cn(
                    "px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-widest border",
                    isLive ? "bg-accent/10 border-accent/20 text-accent animate-pulse" : "bg-muted border-border text-muted-foreground"
                )}>
                    {status}
                </div>
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">Total Prize: <span className="text-foreground font-bold">{prize}</span></p>

            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Arena <ArrowRight className="w-3 h-3" />
            </div>
        </div>
    )
}
