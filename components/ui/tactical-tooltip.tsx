"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TacticalTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    label?: string;
}

export function TacticalTooltip({ children, content, label }: TacticalTooltipProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-block w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[100] w-64 pointer-events-none"
                    >
                        <div className="glass-panel p-4 border-primary/50 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                            {label && (
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                                    {label}
                                </div>
                            )}
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-relaxed">
                                {content}
                            </div>
                        </div>
                        {/* Caret */}
                        <div className="w-3 h-3 bg-secondary border-b border-r border-primary/50 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-[-1]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
