"use client";

import { createClient } from "@/lib/supabase/client";

export async function searchOperatives(query: string) {
    if (!query || query.length < 2) return [];

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("profiles")
        .select("id, gamertag, tactical_id, avatar_url, role")
        .ilike("gamertag", `%${query}%`)
        .neq("id", user.id) // Don't search for self
        .limit(5);

    if (error) {
        console.error("Search failed:", error);
        return [];
    }

    return data;
}
