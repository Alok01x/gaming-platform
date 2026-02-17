"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Hash, Settings, Mic, Headphones, Plus, Users, Search, MessageSquare, UserPlus, Check, X as XIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/ui/loading-screen";
import { motion } from "framer-motion";
import ChatStream from "./components/chat-stream";
import { sendMessage } from "./actions";
import { sendFriendRequest, acceptFriendRequest, createDMChannel } from "@/app/social/actions";
import { getTacticalColor, getTacticalBadge } from "@/lib/utils/tactical-id";

export default function ChatPage() {
    const [channels, setChannels] = useState<any[]>([]);
    const [dms, setDms] = useState<any[]>([]);
    const [activeChannel, setActiveChannel] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'CHANNELS' | 'FRIENDS'>('CHANNELS');
    const [addFriendInput, setAddFriendInput] = useState("");
    const supabase = createClient();

    useEffect(() => {
        async function fetchIntel() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.log("ChatPage: No user found");
                    setLoading(false);
                    return;
                }

                console.log("ChatPage: Fetching channels...");
                // 1. Fetch Public Channels
                const { data: publicChannels, error: channelsError } = await supabase
                    .from("channels")
                    .select("*")
                    .eq("category", "PUBLIC")
                    .order("created_at");

                if (channelsError) {
                    console.error("ChatPage: Error fetching channels:", channelsError);
                }

                // 2. Fetch DMs
                const { data: myDMs, error: dmsError } = await supabase
                    .from("channel_members")
                    .select(`
                        channel:channels!inner(*),
                        user:profiles!inner(*)
                    `)
                    .eq("user_id", user.id);

                if (dmsError) {
                    console.error("ChatPage: Error fetching DMs:", dmsError);
                }

                setChannels(publicChannels || []);
                setActiveChannel(publicChannels?.[0] || null);
            } catch (error) {
                console.error("ChatPage: Critical error in fetchIntel:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchIntel();
    }, []);

    // Fetch members when active channel changes
    useEffect(() => {
        if (!activeChannel) return;

        async function fetchMembers() {
            const { data: memberData } = await supabase
                .from("channel_members")
                .select(`
                    role,
                    profile:profiles(*)
                `)
                .eq("channel_id", activeChannel.id);

            if (memberData && memberData.length > 0) {
                setMembers(memberData.map(m => ({ ...m.profile, role: m.profile.role, member_role: m.role })));
            } else {
                // Fallback for public channels if no explicit members
                const { data: allProfiles } = await supabase.from("profiles").select("*").limit(10);
                if (allProfiles) setMembers(allProfiles);
            }
        }
        fetchMembers();
    }, [activeChannel]);

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("Enter Target UUID directly for now (Gamertag lookup pending Phase 31)");
        await sendFriendRequest(addFriendInput);
        setAddFriendInput("");
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="fixed inset-0 pt-24 pb-4 px-4 flex gap-4 overflow-hidden">
            {/* Left Sidebar: Nav */}
            <div className="w-64 glass-panel flex flex-col hidden md:flex">
                <div className="p-4 border-b border-border/20 flex items-center justify-between">
                    <h2 className="font-black uppercase tracking-widest text-xs">Comms Uplink</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setView('CHANNELS')} className={cn("p-1.5 rounded", view === 'CHANNELS' ? "bg-primary/20 text-primary" : "text-muted-foreground")}><Hash className="w-4 h-4" /></button>
                        <button onClick={() => setView('FRIENDS')} className={cn("p-1.5 rounded", view === 'FRIENDS' ? "bg-primary/20 text-primary" : "text-muted-foreground")}><Users className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {/* Public Channels */}
                    <div>
                        <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Frequency</h3>
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all",
                                    activeChannel?.id === channel.id
                                        ? "bg-primary/20 text-primary"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <Hash className="w-4 h-4 opacity-70" />
                                {channel.name}
                            </button>
                        ))}
                    </div>

                    {/* Private Channels (DMs) */}
                    <div>
                        <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Direct Links</h3>
                        <div className="px-3 py-2 text-[10px] text-muted-foreground italic opacity-50">No encrypted links active.</div>
                    </div>
                </div>

                {/* User Status */}
                <div className="p-3 bg-black/20 mt-auto border-t border-border/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground">OP</div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[10px] font-black uppercase tracking-wider truncate">Operative</div>
                            <div className="text-[8px] text-muted-foreground truncate">Online</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {view === 'CHANNELS' ? (
                <div className="flex-1 glass-panel flex flex-col relative overflow-hidden">
                    <div className="h-14 border-b border-border/20 flex items-center px-6 justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Hash className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-black uppercase tracking-tight text-sm">{activeChannel?.name}</h3>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{activeChannel?.description}</p>
                            </div>
                        </div>
                    </div>
                    <ChatStream channelId={activeChannel?.id} />
                    <div className="p-4 bg-background/20 shrink-0">
                        <form
                            action={async (formData) => {
                                const content = formData.get('content') as string;
                                if (!content.trim() || !activeChannel) return;
                                await sendMessage(activeChannel.id, content);
                                const form = document.getElementById('chat-form') as HTMLFormElement;
                                if (form) form.reset();
                            }}
                            id="chat-form"
                            className="relative"
                        >
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                            <input
                                name="content"
                                type="text"
                                autoComplete="off"
                                placeholder={`Message #${activeChannel?.name}`}
                                className="w-full bg-secondary/50 border border-border/50 rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:font-normal placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all"
                            />
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 glass-panel flex flex-col p-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Social Grid</h2>

                    <div className="bg-secondary/20 p-6 rounded-2xl border border-border/50 mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Add Operative</h3>
                        <form onSubmit={handleSendRequest} className="flex gap-4">
                            <input
                                value={addFriendInput}
                                onChange={(e) => setAddFriendInput(e.target.value)}
                                placeholder="Enter Target UUID"
                                className="flex-1 bg-black/40 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                            />
                            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wide hover:bg-primary/90">
                                Send Signal
                            </button>
                        </form>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted-foreground">Pending Signals</h3>
                        <div className="text-sm text-muted-foreground italic">No incoming signals.</div>
                    </div>
                </div>
            )}

            {/* Right Sidebar: Members */}
            {view === 'CHANNELS' && (
                <div className="w-60 glass-panel hidden lg:flex flex-col">
                    <div className="p-4 border-b border-border/20">
                        <h2 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Active Operatives</h2>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto">
                        {members.map(member => (
                            <div key={member.id} className="px-2 py-1.5 rounded hover:bg-white/5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[10px] overflow-hidden">
                                    {member.avatar_url ? <img src={member.avatar_url} alt={member.gamertag} className="w-full h-full object-cover" /> : (member.gamertag?.[0] || "?")}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className={cn("text-xs font-bold truncate", getTacticalColor(member.tactical_id))}>
                                        {member.gamertag || "Unknown"}
                                    </div>
                                    <div className="text-[8px] text-muted-foreground truncate">{member.tactical_id || "UNREGISTERED"}</div>
                                </div>
                                {(() => {
                                    const badge = getTacticalBadge(member.member_role || member.role);
                                    if (badge) return <div className={cn("text-[6px] px-1 border rounded ml-auto", badge.color)}>{badge.label}</div>
                                    return null;
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
