"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTacticalColor, getTacticalBadge } from "@/lib/utils/tactical-id";

export default function ChatStream({ channelId }: { channelId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!channelId) return;

        setLoading(true);
        const fetchMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select(`
                    *,
                    profiles (
                        gamertag,
                        avatar_url,
                        role,
                        tactical_id
                    )
                `)
                .eq("channel_id", channelId)
                .order("created_at", { ascending: true })
                .limit(50);

            if (data) setMessages(data);
            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        const channel = supabase
            .channel(`room:${channelId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
                async (payload) => {
                    // Fetch the full profile for the new message
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("gamertag, avatar_url, role, tactical_id")
                        .eq("id", payload.new.user_id)
                        .single();

                    const newMessage = { ...payload.new, profiles: profile };
                    setMessages((current) => [...current, newMessage]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelId]);

    const scrollToBottom = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                    <p className="text-[10px] uppercase font-black tracking-widest">Secure Channel Established. Silence on verify.</p>
                </div>
            ) : (
                messages.map((msg, idx) => {
                    const isSystem = msg.user_id === 'SYSTEM'; // Future proofing
                    const isMe = false; // logic later
                    const showHeader = idx === 0 || messages[idx - 1].user_id !== msg.user_id || (new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 300000);

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("group flex items-start gap-4", showHeader ? "mt-4" : "mt-1")}
                        >
                            {showHeader ? (
                                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 mt-1">
                                    {msg.profiles?.avatar_url ? (
                                        <img src={msg.profiles.avatar_url} alt={msg.profiles.gamertag} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="font-bold text-xs uppercase">{msg.profiles?.gamertag?.[0] || "?"}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-10 shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                                {showHeader && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "font-black uppercase text-xs tracking-tight",
                                            getTacticalColor(msg.profiles?.tactical_id)
                                        )}>
                                            {msg.profiles?.gamertag || "Unknown"}
                                        </span>
                                        {(() => {
                                            const badge = getTacticalBadge(msg.profiles?.role);
                                            if (badge) return (
                                                <span className={cn("text-[8px] px-1 rounded uppercase font-bold tracking-widest border", badge.color)}>
                                                    {badge.label}
                                                </span>
                                            );
                                            return null;
                                        })()}
                                        {msg.profiles?.tactical_id && (
                                            <span className="text-[8px] text-muted-foreground font-mono opacity-50">{msg.profiles.tactical_id}</span>
                                        )}
                                        <span className="text-[10px] text-muted-foreground ml-auto opacity-40 font-mono">
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </span>
                                    </div>
                                )}
                                <p className={cn("text-sm text-foreground/80 leading-relaxed break-words", !showHeader && "opacity-90")}>
                                    {msg.content}
                                </p>
                            </div>
                        </motion.div>
                    );
                })
            )}
            <div ref={bottomRef} />
        </div>
    );
}
