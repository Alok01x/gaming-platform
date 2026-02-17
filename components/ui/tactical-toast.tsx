"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radar, X, Megaphone } from "lucide-react";

interface TacticalToastProps {
    id: string;
    message: string;
    onClose: (id: string) => void;
}

export function TacticalToast({ id, message, onClose }: TacticalToastProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="w-80 glass-panel p-4 border-primary/50 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] relative overflow-hidden pointer-events-auto"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="absolute top-0 right-0 p-1">
                <button
                    onClick={() => onClose(id)}
                    className="p-1 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Radar className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Megaphone className="w-3 h-3 text-red-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500">
                            High Command Briefing
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-relaxed pr-4">
                        {message}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={() => onClose(id)}
                className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
            />
        </motion.div>
    );
}
