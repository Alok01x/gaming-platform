"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthFormProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({ title, subtitle, children, onSubmit }: AuthFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="glass-panel p-10 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-3xl translate-y-1/2 -translate-x-1/2 rounded-full" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black font-heading tracking-tight uppercase mb-2">
                        {title.includes(' ') ? (
                            <>
                                {title.split(' ')[0]} <span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span>
                            </>
                        ) : (
                            <span className="text-primary italic">{title}</span>
                        )}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-10 uppercase tracking-widest font-bold opacity-60">
                        {subtitle}
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {children}
                    </form>
                </div>
            </div>
        </motion.div>
    );
}

export function AuthInput({ label, type, placeholder, required, name }: { label: string, type: string, placeholder?: string, required?: boolean, name?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                {label}
            </label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                className="w-full bg-secondary border border-border rounded-full px-6 py-3 text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder:text-muted-foreground/30"
            />
        </div>
    );
}

export function AuthButton({ children, loading }: { children: React.ReactNode, loading?: boolean }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground h-12 font-black uppercase tracking-widest text-xs rounded-full hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#0891b2] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
            {loading ? "Processing..." : children}
        </button>
    );
}
