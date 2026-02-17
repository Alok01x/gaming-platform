"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTournament(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const game_type = formData.get("game_type") as string;
    const prize_pool = formData.get("prize_pool") as string;
    const start_date = formData.get("start_date") as string;
    const rules = formData.get("rules") as string;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_verified")
        .eq("id", userData.user.id)
        .single();

    if (profile?.role !== "ORGANIZER" || !profile?.is_verified) {
        throw new Error("Privilege Insufficient: Only verified Architects can launch arenas.");
    }

    const { data, error } = await supabase
        .from("tournaments")
        .insert([
            {
                title,
                game_type,
                prize_pool,
                start_date: new Date(start_date).toISOString(),
                rules,
                creator_id: userData.user.id,
                status: "OPEN"
            },
        ])
        .select();

    if (error) {
        console.error("Error creating tournament:", error);
        return;
    }

    revalidatePath("/tournaments");
    redirect(`/tournaments/${data[0].id}`);
}

export async function joinTournament(tournamentId: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        redirect("/auth/login");
    }

    const { error } = await supabase
        .from("tournament_participants")
        .insert([
            {
                tournament_id: tournamentId,
                user_id: userData.user.id,
            },
        ]);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
}
