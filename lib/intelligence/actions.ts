"use server";

import { createClient } from "@/lib/supabase/server";

export type ActivityType = 'TOURNAMENT_START' | 'MATCH_WIN' | 'TEAM_CREATED' | 'RANK_UP' | 'SYSTEM';

export async function logActivity(
    type: ActivityType,
    description: string,
    metadata: any = {}
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Log to activity_log table
    const { data: activity, error } = await supabase
        .from("activity_log")
        .insert({
            event_type: type,
            description,
            actor_id: user?.id || null,
            metadata
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to log activity:", error.message);
        return;
    }

    // 2. Cross-post major sitreps to the Sitreps Chat channel
    if (type !== 'SYSTEM') {
        const { data: sitrepChannel } = await supabase
            .from("channels")
            .select("id")
            .eq("name", "sitreps")
            .single();

        if (sitrepChannel) {
            await supabase
                .from("messages")
                .insert({
                    channel_id: sitrepChannel.id,
                    user_id: '00000000-0000-0000-0000-000000000000', // SYSTEM ID
                    content: `[SITREP: ${type}] ${description}`
                });
        }
    }
}

export async function getRecentActivity(limit = 20) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("activity_log")
        .select(`
            *,
            actor:profiles(gamertag, avatar_url, tactical_id)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Failed to fetch activity:", error.message);
        return [];
    }

    return data;
}
