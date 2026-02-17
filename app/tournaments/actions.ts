"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/intelligence/actions";

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

    await logActivity('SYSTEM', `New Arena Initialized: ${title}`, { tournament_id: data[0].id });

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

export async function updateMatchScore(matchId: string, resultA: number, resultB: number) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    // 1. Fetch match and tournament details for authorization
    const { data: match, error: mError } = await supabase
        .from("matches")
        .select("*, tournament:tournaments(creator_id, id)")
        .eq("id", matchId)
        .single();

    if (mError || !match) throw new Error("Match not found");

    // Authorization: Only creator or admin
    if (match.tournament.creator_id !== userData.user.id) {
        throw new Error("Only the Arena Architect can log scores.");
    }

    const winnerId = resultA > resultB ? match.team_a_id : match.team_b_id;

    // 2. Update current match
    const { error: uError } = await supabase
        .from("matches")
        .update({
            result_a: resultA,
            result_b: resultB,
            winner_id: winnerId,
            status: 'COMPLETED'
        })
        .eq("id", matchId);

    if (uError) throw new Error(uError.message);

    // Activity Log
    const { data: teamA } = await supabase.from("teams").select("name").eq("id", match.team_a_id!).single();
    const { data: teamB } = await supabase.from("teams").select("name").eq("id", match.team_b_id!).single();
    const winnerName = resultA > resultB ? teamA?.name : teamB?.name;

    await logActivity('MATCH_WIN', `${winnerName} has secured victory in Match #${match.match_index}`, {
        match_id: matchId,
        tournament_id: match.tournament.id,
        score: `${resultA}-${resultB}`
    });

    // 3. Advance to parent match if exists
    if (match.parent_match_id) {
        // Determine if we are team_a or team_b of the parent based on match_index parity
        const isTeamA = match.match_index % 2 === 0;

        const updateData: any = {};
        if (isTeamA) updateData.team_a_id = winnerId;
        else updateData.team_b_id = winnerId;

        await supabase
            .from("matches")
            .update(updateData)
            .eq("id", match.parent_match_id);
    }

    revalidatePath(`/tournaments/${match.tournament.id}`);
    return { success: true };
}

export async function startTournament(tournamentId: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    // 1. Fetch participants (Teams)
    const { data: participants } = await supabase
        .from("tournament_participants")
        .select("team_id")
        .eq("tournament_id", tournamentId);

    if (!participants || participants.length < 2) {
        throw new Error("Insufficient participants (minimum 2 teams required or Phase 31 not fully initialized).");
    }

    // Extract unique team IDs
    const teamIds = Array.from(new Set(participants.map(p => p.team_id).filter(Boolean))) as string[];

    // 2. Determine Bracket Depth
    const numRounds = Math.ceil(Math.log2(teamIds.length));

    let parentRoundMatches: any[] = [];

    for (let r = 0; r < numRounds; r++) {
        const matchesCount = Math.pow(2, r);
        const matchesToInsert = [];

        for (let i = 0; i < matchesCount; i++) {
            matchesToInsert.push({
                tournament_id: tournamentId,
                round_index: r,
                match_index: i,
                status: 'PENDING'
            });
        }

        const { data: insertedMatches, error: iError } = await supabase
            .from("matches")
            .insert(matchesToInsert)
            .select();

        if (iError) throw new Error(iError.message);

        if (r > 0 && parentRoundMatches.length > 0) {
            for (const childMatch of insertedMatches) {
                const parentIndex = Math.floor(childMatch.match_index / 2);
                const parentMatch = parentRoundMatches.find(m => m.match_index === parentIndex);

                if (parentMatch) {
                    await supabase
                        .from("matches")
                        .update({ parent_match_id: parentMatch.id })
                        .eq("id", childMatch.id);
                }
            }
        }

        if (r === numRounds - 1) {
            for (const match of insertedMatches) {
                const tA = teamIds[match.match_index * 2];
                const tB = teamIds[match.match_index * 2 + 1];

                await supabase
                    .from("matches")
                    .update({
                        team_a_id: tA || null,
                        team_b_id: tB || null
                    })
                    .eq("id", match.id);
            }
        }

        parentRoundMatches = insertedMatches;
    }

    // 3. Mark Tournament as LIVE
    await supabase
        .from("tournaments")
        .update({ status: 'LIVE' })
        .eq("id", tournamentId);

    await logActivity('TOURNAMENT_START', `Operation LIVE: ${tournamentId.slice(0, 8)} has commenced mapping.`, { tournament_id: tournamentId });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
}
