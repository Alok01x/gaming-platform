"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Authentication required");

    const gamertag = formData.get("gamertag") as string;
    const bio = formData.get("bio") as string;
    const primary_game = formData.get("primary_game") as string;
    const specialization = formData.get("specialization") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const { error } = await supabase
        .from("profiles")
        .update({
            gamertag,
            bio,
            primary_game,
            specialization,
            avatar_url,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard/player");
    return { success: true };
}
