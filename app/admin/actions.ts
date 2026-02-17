"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// HARDBALL SECURITY: Only this specific email can ever execute these commands.
// Even if someone hacks the DB and changes their role to HIGH_COMMAND, 
// they cannot use these server actions unless they are also logged into THIS email.
const SUPREME_COMMANDER_EMAIL = "alokkg3620@gmail.com";

async function verifyClearance() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== SUPREME_COMMANDER_EMAIL) {
        throw new Error("UNAUTHORIZED: ACCESS DENIED. INCIDENT LOGGED.");
    }

    // Double check DB role just to be sure
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'HIGH_COMMAND') {
        throw new Error("UNAUTHORIZED: INSUFFICIENT RANK.");
    }

    return true;
}

export async function banUser(userId: string) {
    await verifyClearance();
    const admin = createAdminClient();

    // 1. Ban in Auth (Prevents Login)
    const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" }); // 100 years
    if (authError) throw new Error(authError.message);

    // 2. Mark in Profile (Visual)
    const { error: dbError } = await admin.from("profiles").update({ is_verified: false, bio: "[BANNED BY HIGH COMMAND]" }).eq("id", userId);
    if (dbError) throw new Error(dbError.message);

    revalidatePath("/admin");
    return { success: true };
}

export async function toggleVerification(userId: string, currentStatus: boolean) {
    await verifyClearance();
    const admin = createAdminClient();

    const { error } = await admin.from("profiles").update({ is_verified: !currentStatus }).eq("id", userId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    return { success: true };
}

export async function disbandTeam(teamId: string) {
    await verifyClearance();
    const admin = createAdminClient();

    // Cascade delete handles members via DB constraints usually, but let's be explicit if needed.
    // Assuming 'teams' has ON DELETE CASCADE for members.
    const { error } = await admin.from("teams").delete().eq("id", teamId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    return { success: true };
}
