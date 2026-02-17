"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Hash, Settings, Mic, Headphones, Plus, Users, Search, MessageSquare, UserPlus, Check, X as XIcon, Lock, Megaphone, Zap, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/ui/loading-screen";
import { motion } from "framer-motion";
import ChatStream from "./components/chat-stream";
import { sendMessage } from "./actions";
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, createDMChannel } from "@/app/social/actions";
import { searchOperatives } from "@/app/social/search-action";
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
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
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

                // 0. Fetch Current User Profile
                try {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .maybeSingle();
                    setCurrentUserProfile(profile);
                } catch (pErr) {
                    console.error("ChatPage: Error fetching profile:", pErr);
                }

                console.log("ChatPage: Fetching intel...");
                // 1. Fetch Public Channels
                let { data: publicChannels, error: channelsError } = await supabase
                    .from("channels")
                    .select("*")
                    .eq("category", "PUBLIC")
                    .order("created_at");

                // If it worked, try to sort by is_announcement if it exists
                if (!channelsError && publicChannels) {
                    publicChannels = [...publicChannels].sort((a, b) => {
                        if (a.is_announcement === b.is_announcement) return 0;
                        return a.is_announcement ? -1 : 1;
                    });
                }

                if (channelsError) {
                    console.error("ChatPage: Error fetching channels:", channelsError);
                    // Fallback to minimal fetch if ordering failed
                    const { data: fallbackChannels } = await supabase
                        .from("channels")
                        .select("*")
                        .limit(10);
                    publicChannels = fallbackChannels;
                }

                // 2. Fetch DMs
                const { data: myDMs, error: dmsError } = await supabase
                    .from("channel_members")
                    .select(`
                        channel:channels!inner(*),
                        user:profiles!inner(*)
                    `)
                    .eq("user_id", user.id);

                if (dmsError) console.error("ChatPage: Error fetching DMs:", dmsError);

                // 3. Fetch Friendships
                const { data: allFriendships, error: fError } = await supabase
                    .from("friendships")
                    .select(`
                        *,
                        user1:profiles!user_id_1(*),
                        user2:profiles!user_id_2(*)
                    `)
                    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

                if (fError) console.error("ChatPage: Error fetching friendships:", fError);

                if (allFriendships) {
                    const accepted = allFriendships.filter(f => f.status === 'ACCEPTED');
                    const pending = allFriendships.filter(f => f.status === 'PENDING' && f.user_id_2 === user.id);

                    setFriends(accepted.map(f => f.user_id_1 === user.id ? f.user2 : f.user1));
                    setPendingRequests(pending);
                }

                setChannels(publicChannels || []);
                setDms(myDMs || []);
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
                setMembers(memberData.map((m: any) => {
                    const prof = Array.isArray(m.profile) ? m.profile[0] : m.profile;
                    return { ...prof, role: prof.role, member_role: m.role };
                }));
            } else {
                // Fallback for public channels if no explicit members
                const { data: allProfiles } = await supabase.from("profiles").select("*").limit(10);
                if (allProfiles) setMembers(allProfiles);
            }
        }
        fetchMembers();
    }, [activeChannel]);

    const handleSearch = async (val: string) => {
        setAddFriendInput(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const results = await searchOperatives(val);
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleSendRequest = async (targetId: string) => {
        const res = await sendFriendRequest(targetId);
        if (res.success) {
            setAddFriendInput("");
            setSearchResults([]);
            alert("Signal dispatched.");
        }
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
                    {/* Tactical Feeds (Sitreps) */}
                    {channels.some(c => c.name === 'sitreps') && (
                        <div>
                            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
                                <Radar className="w-3 h-3 text-primary animate-pulse" />
                                Tactical Feeds
                            </h3>
                            {channels.filter(c => c.name === 'sitreps').map(channel => (
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
                                    <Radar className="w-4 h-4 opacity-70" />
                                    {channel.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Public Channels (Excluding Sitreps) */}
                    <div>
                        <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Frequency</h3>
                        {channels.filter(c => c.name !== 'sitreps').map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all",
                                    activeChannel?.id === channel.id
                                        ? (channel.is_announcement ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary")
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                                    channel.is_announcement && activeChannel?.id !== channel.id && "text-red-500/60"
                                )}
                            >
                                {channel.is_announcement ? <Megaphone className="w-4 h-4 opacity-70" /> : <Hash className="w-4 h-4 opacity-70" />}
                                {channel.name}
                            </button>
                        ))}
                    </div>

                    {/* Private Channels (DMs) */}
                    <div>
                        <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Direct Links</h3>
                        {dms.length === 0 ? (
                            <div className="px-3 py-2 text-[10px] text-muted-foreground italic opacity-50">No encrypted links active.</div>
                        ) : (
                            dms.map(dm => (
                                <button
                                    key={dm.channel.id}
                                    onClick={() => {
                                        setActiveChannel(dm.channel);
                                        setView('CHANNELS');
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all",
                                        activeChannel?.id === dm.channel.id
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    {dm.channel.name.startsWith('dm-') ? 'SECURE_CHANNEL' : dm.channel.name}
                                </button>
                            ))
                        )}
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
                        {activeChannel?.is_announcement && currentUserProfile?.role === 'PLAYER' ? (
                            <div className="w-full bg-red-500/5 border border-red-500/20 rounded-xl py-3 px-4 flex items-center gap-3">
                                <Lock className="w-4 h-4 text-red-500/50" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">
                                    Broadcast Mode: Frequency restricted to High Command.
                                </span>
                            </div>
                        ) : (
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
                                    placeholder={activeChannel?.is_announcement ? "Post high-command announcement..." : `Message #${activeChannel?.name}`}
                                    className="w-full bg-secondary/50 border border-border/50 rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:font-normal placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all"
                                />
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 glass-panel flex flex-col p-8 overflow-y-auto">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Social Grid</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Search & Add */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Tactical Search</h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    value={addFriendInput}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search Gamertag..."
                                    className="w-full bg-black/40 border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-top-2">
                                    {searchResults.map(result => (
                                        <div key={result.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[10px] overflow-hidden">
                                                    {result.avatar_url ? <img src={result.avatar_url} alt={result.gamertag} className="w-full h-full object-cover" /> : result.gamertag[0]}
                                                </div>
                                                <div>
                                                    <div className={cn("text-xs font-bold", getTacticalColor(result.tactical_id))}>{result.gamertag}</div>
                                                    <div className="text-[10px] text-muted-foreground">{result.tactical_id}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSendRequest(result.id)}
                                                className="p-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted-foreground mt-8">Active Connections</h3>
                            <div className="space-y-2">
                                {friends.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic opacity-50">No active links found.</div>
                                ) : (
                                    friends.map(friend => (
                                        <div key={friend.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[10px] overflow-hidden">
                                                    {friend.avatar_url ? <img src={friend.avatar_url} alt={friend.gamertag} className="w-full h-full object-cover" /> : friend.gamertag[0]}
                                                </div>
                                                <div>
                                                    <div className={cn("text-xs font-bold", getTacticalColor(friend.tactical_id))}>{friend.gamertag}</div>
                                                    <div className="text-[10px] text-muted-foreground">Level {friend.rank_tier || 'RECRUIT'}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const res = await createDMChannel(friend.id);
                                                    if (res.channelId) setView('CHANNELS');
                                                }}
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pending Requests */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted-foreground">Pending Signals</h3>
                            <div className="space-y-2">
                                {pendingRequests.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic opacity-50">No incoming signals.</div>
                                ) : (
                                    pendingRequests.map(req => (
                                        <div key={req.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs overflow-hidden">
                                                    {req.user1.avatar_url ? <img src={req.user1.avatar_url} alt={req.user1.gamertag} className="w-full h-full object-cover" /> : req.user1.gamertag[0]}
                                                </div>
                                                <div>
                                                    <div className={cn("text-sm font-bold", getTacticalColor(req.user1.tactical_id))}>{req.user1.gamertag}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{req.user1.tactical_id}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => await acceptFriendRequest(req.id)}
                                                    className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async () => await declineFriendRequest(req.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
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
