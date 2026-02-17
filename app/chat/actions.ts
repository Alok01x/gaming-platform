"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendMessage(channelId: string, content: string) {
    if (!content.trim()) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    await supabase.from("messages").insert({
        channel_id: channelId,
        user_id: user.id,
        content: content.trim()
    });
}
