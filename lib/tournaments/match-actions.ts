import { createClient } from "@/lib/supabase/server";

/**
 * Advanced match orchestration logic for automated bracket progression.
 */

export async function advanceWinner(matchId: string, winnerTeamId: string) {
    const supabase = await createClient();

    // 1. Mark current match as completed
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .update({
            winner_id: winnerTeamId,
            status: 'COMPLETED',
            updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select('parent_match_id, tournament_id')
        .single();

    if (matchError || !match.parent_match_id) return;

    // 2. Locate parent match for advancement
    const { data: parentMatch, error: parentError } = await supabase
        .from('matches')
        .select('team_a_id, team_b_id')
        .eq('id', match.parent_match_id)
        .single();

    if (parentError) return;

    // 3. Update parent match with the winner
    // If team_a_id is empty, winner takes that slot. Else team_b_id.
    const updatePayload = !parentMatch.team_a_id
        ? { team_a_id: winnerTeamId }
        : { team_b_id: winnerTeamId };

    await supabase
        .from('matches')
        .update(updatePayload)
        .eq('id', match.parent_match_id);

    console.log(`Advancing team ${winnerTeamId} to match ${match.parent_match_id}`);
}
