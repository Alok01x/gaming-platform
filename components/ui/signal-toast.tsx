"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, MessageSquare, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SignalType = 'FRIEND_REQUEST' | 'DM' | 'SYSTEM' | 'SUCCESS';

export interface Signal {
    id: string;
    type: SignalType;
    message: string;
    title: string;
}

export default function SignalToast({ signal, onClose }: { signal: Signal; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (signal.type) {
            case 'FRIEND_REQUEST': return <UserPlus className="w-5 h-5 text-primary" />;
            case 'DM': return <MessageSquare className="w-5 h-5 text-cyan-400" />;
            case 'SUCCESS': return <Check className="w-5 h-5 text-green-400" />;
            default: return <Bell className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="w-80 glass-panel p-4 border-l-4 border-primary shadow-2xl flex items-start gap-4 pointer-events-auto"
        >
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">{signal.title}</h4>
                <p className="text-xs font-bold text-foreground leading-tight">{signal.message}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-colors text-muted-foreground">
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    );
}
