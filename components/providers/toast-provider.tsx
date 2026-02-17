"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TacticalToast } from "@/components/ui/tactical-toast";
import { AnimatePresence } from "framer-motion";

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
    const supabase = createClient();

    const showToast = (message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        // Listen for live sitreps from HIGH_COMMAND
        const channel = supabase
            .channel('global_briefings')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    // Check if it's from the SYSTEM ID
                    if (payload.new.user_id === '00000000-0000-0000-0000-000000000000') {
                        // Strip the [SITREP: TYPE] prefix for the notification
                        const cleanMessage = payload.new.content.replace(/^\[SITREP: [^\]]+\] /, '');
                        showToast(cleanMessage);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-24 right-6 z-[200] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <TacticalToast
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}
