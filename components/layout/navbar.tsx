"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, LayoutDashboard, Menu, X, Moon, Sun, Zap, User, ShieldAlert, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tournaments", href: "/tournaments", icon: Trophy },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Comms", href: "/chat", icon: MessageSquare },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
                if (profile?.role === 'HIGH_COMMAND' || profile?.role === 'ADMIN') {
                    setIsAdmin(true);
                }
            }
        }
        checkRole();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const themes = [
        { id: 'midnight', icon: Moon, color: 'text-cyan-400' },
        { id: 'day', icon: Sun, color: 'text-indigo-600' },
        { id: 'golden', icon: Zap, color: 'text-amber-500' },
    ] as const;

    return (
        <div className="fixed top-8 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "pointer-events-auto relative flex items-center gap-2 md:gap-4 p-2 rounded-full border border-foreground/10 transition-all duration-500",
                    isScrolled
                        ? "bg-background/80 scale-95 shadow-2xl backdrop-blur-xl border-foreground/20"
                        : "bg-background/40 backdrop-blur-md"
                )}
            >
                {/* Logo */}
                <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-heading font-black tracking-tighter text-lg uppercase hidden sm:block">
                        Gamer<span className="text-primary italic">NotFound</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1 bg-foreground/5 p-1 rounded-full border border-foreground/5">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="relative px-4 py-2 text-[0.65rem] tracking-[0.2em] uppercase font-black group"
                            >
                                <span className={cn(
                                    "relative z-10 transition-colors duration-300",
                                    isActive ? "text-background" : "text-foreground/50 group-hover:text-foreground"
                                )}>
                                    {link.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-foreground rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-full border border-foreground/5">
                    {/* Admin Link */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={cn(
                                "relative w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-red-500/20 group",
                                pathname === "/admin" && "bg-red-500/20 text-red-500"
                            )}
                            title="High Command"
                        >
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    )}

                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "relative w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                theme === t.id ? "bg-foreground/10 scale-110" : "hover:bg-foreground/5 opacity-40 hover:opacity-100"
                            )}
                        >
                            <t.icon className={cn("w-3.5 h-3.5 z-10", theme === t.id ? t.color : "text-foreground/30")} />
                            {theme === t.id && (
                                <motion.div
                                    layoutId="active-theme"
                                    className="absolute inset-0 bg-foreground/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Auth / Profile */}
                <Link
                    href="/account"
                    className={cn(
                        "ml-1 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center group overflow-hidden transition-all",
                        pathname === "/account"
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--blob-1),0.4)]"
                            : "bg-foreground text-background hover:scale-110"
                    )}
                >
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>

                {/* Mobile Menu Trigger */}
                <button
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-foreground/10"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-[120%] left-4 right-4 bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-[2rem] p-4 shadow-3xl flex flex-col gap-2 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "px-6 py-4 rounded-2xl text-[0.7rem] uppercase tracking-[0.2em] font-black transition-all",
                                    pathname === link.href ? "bg-foreground text-background" : "bg-foreground/5 text-foreground/50"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "px-6 py-4 rounded-2xl text-[0.7rem] uppercase tracking-[0.2em] font-black transition-all bg-red-500/10 text-red-500",
                                )}
                            >
                                HIGH COMMAND
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
