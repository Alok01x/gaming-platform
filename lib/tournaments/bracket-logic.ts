/**
 * Recursive bracket generation for single-elimination tournaments.
 * Standardizes match indexing for easier frontend rendering.
 */

export interface MatchNode {
    roundIndex: number;
    matchIndex: number;
    teamA?: string;
    teamB?: string;
    winner?: string;
}

export function generateBracket(participants: string[]): MatchNode[] {
    const count = participants.length;
    const numRounds = Math.ceil(Math.log2(count));
    const bracket: MatchNode[] = [];

    // 1. Initial Round (Round numRounds - 1)
    // Logic scales for power-of-two (8, 16, 32)
    const firstRoundMatches = Math.pow(2, numRounds - 1);

    for (let i = 0; i < firstRoundMatches; i++) {
        bracket.push({
            roundIndex: numRounds - 1,
            matchIndex: i,
            teamA: participants[i * 2] || undefined,
            teamB: participants[i * 2 + 1] || undefined,
        });
    }

    // 2. Subsequent empty rounds
    for (let r = numRounds - 2; r >= 0; r--) {
        const matchesInRound = Math.pow(2, r);
        for (let i = 0; i < matchesInRound; i++) {
            bracket.push({
                roundIndex: r,
                matchIndex: i,
            });
        }
    }

    return bracket;
}
