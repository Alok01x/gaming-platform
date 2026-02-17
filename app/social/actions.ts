"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendFriendRequest(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    if (user.id === targetUserId) throw new Error("Cannot add yourself.");

    // Check existing
    const { data: existing } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${user.id})`)
        .single();

    if (existing) {
        if (existing.status === 'PENDING') return { message: "Request already pending." };
        if (existing.status === 'ACCEPTED') return { message: "Already friends." };
        if (existing.status === 'BLOCKED') return { message: "Cannot send request." };
    }

    const { error } = await supabase.from("friendships").insert({
        user_id_1: user.id,
        user_id_2: targetUserId,
        status: 'PENDING'
    });

    if (error) throw new Error(error.message);
    revalidatePath("/chat");
    return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("friendships")
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq("id", friendshipId);

    if (error) throw new Error(error.message);
    revalidatePath("/chat");
    return { success: true };
}

export async function declineFriendRequest(friendshipId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

    if (error) throw new Error(error.message);
    revalidatePath("/chat");
    return { success: true };
}

export async function createDMChannel(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Create Channel
    const { data: channel, error: cError } = await supabase
        .from("channels")
        .insert({
            name: `dm-${user.id.slice(0, 4)}-${targetUserId.slice(0, 4)}`,
            type: 'TEXT',
            category: 'DM',
            description: 'Direct Encrypted Link'
        })
        .select()
        .single();

    if (cError) throw new Error(cError.message);

    // 2. Add Members
    const { error: mError } = await supabase
        .from("channel_members")
        .insert([
            { channel_id: channel.id, user_id: user.id },
            { channel_id: channel.id, user_id: targetUserId }
        ]);

    if (mError) throw new Error(mError.message);

    revalidatePath("/chat");
    return { channelId: channel.id };
}
