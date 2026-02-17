"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Trophy } from "lucide-react";

export default function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: "Global Elite", href: "/leaderboard/players", icon: Trophy },
        { name: "Top Squads", href: "/leaderboard/teams", icon: Users },
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight uppercase mb-4">
                        Ranking <span className="text-primary italic">Protocol</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl font-bold uppercase tracking-widest text-[10px] opacity-60">
                        Global Assessment • Performance Metrics • Elite Status
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-12 border-b border-border/40 pb-1">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "px-6 py-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                <tab.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>

                {children}
            </div>
        </main>
    );
}
