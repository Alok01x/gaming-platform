"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SignalToast, { Signal, SignalType } from "@/components/ui/signal-toast";
import { AnimatePresence } from "framer-motion";

interface SignalContextType {
    sendSignal: (title: string, message: string, type: SignalType) => void;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export function SignalProvider({ children }: { children: React.ReactNode }) {
    const [signals, setSignals] = useState<Signal[]>([]);
    const supabase = createClient();

    const sendSignal = useCallback((title: string, message: string, type: SignalType) => {
        const id = Math.random().toString(36).substring(7);
        setSignals(prev => [...prev, { id, title, message, type }]);
    }, []);

    const removeSignal = useCallback((id: string) => {
        setSignals(prev => prev.filter(s => s.id !== id));
    }, []);

    useEffect(() => {
        let channel: any;

        async function setupRealtime() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Listen for Friend Requests (friendships where I am user_id_2)
            channel = supabase
                .channel('global-signals')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'friendships',
                        filter: `user_id_2=eq.${user.id}`
                    },
                    async (payload) => {
                        console.log("Friend Request Received:", payload);
                        // Fetch the sender's gamertag
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('gamertag')
                            .eq('id', payload.new.user_id_1)
                            .single();

                        sendSignal(
                            "Inbound Signal",
                            `${profile?.gamertag || 'Unknown Operative'} is requesting a tactical link.`,
                            'FRIEND_REQUEST'
                        );
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                    },
                    async (payload) => {
                        // For messages, we only care if we are NOT the sender
                        if (payload.new.user_id === user.id) return;

                        // Check if it's a DM channel or a mentioned channel
                        // For now, let's just fetch channel type
                        const { data: channelData } = await supabase
                            .from('channels')
                            .select('name, category')
                            .eq('id', payload.new.channel_id)
                            .single();

                        if (channelData?.category === 'DM') {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('gamertag')
                                .eq('id', payload.new.user_id)
                                .single();

                            sendSignal(
                                "Encrypted Comms",
                                `New message from ${profile?.gamertag || 'Operative'}`,
                                'DM'
                            );
                        }
                    }
                )
                .subscribe();
        }

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase, sendSignal]);

    return (
        <SignalContext.Provider value={{ sendSignal }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {signals.map(signal => (
                        <SignalToast
                            key={signal.id}
                            signal={signal}
                            onClose={() => removeSignal(signal.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </SignalContext.Provider>
    );
}

export const useSignals = () => {
    const context = useContext(SignalContext);
    if (!context) throw new Error("useSignals must be used within SignalProvider");
    return context;
};
