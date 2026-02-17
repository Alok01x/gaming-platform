import { createClient } from "@/lib/supabase/server";
import { TeamsView } from "./teams-view";

export default async function TeamsPage() {
    const supabase = await createClient();
    const { data: teams } = await supabase
        .from("teams")
        .select("id, name, tag, logo_url, created_at, team_members(count)")
        .order("created_at", { ascending: false });

    // Map data to Team interface
    const dbTeams = teams?.map((team, index) => ({
        id: team.id,
        name: team.name,
        tag: team.tag,
        logo_url: team.logo_url,
        member_count: (team.team_members as any)?.[0]?.count || 0,
        wins: 0, // TODO: Fetch from team_stats
        points: 1000 + (index * -50), // Mock descending points for now
        rank: index + 1
    })) || [];

    // Mock Teams for Prototype
    const mockTeams = [
        { id: "mock-1", name: "Nebula Strikers", tag: "NEON", logo_url: null, member_count: 5, wins: 12, points: 2400, rank: 1 },
        { id: "mock-2", name: "Void Vanguard", tag: "VOID", logo_url: null, member_count: 4, wins: 10, points: 2100, rank: 2 },
        { id: "mock-3", name: "Titan Protocol", tag: "TITAN", logo_url: null, member_count: 6, wins: 8, points: 1800, rank: 3 },
        { id: "mock-4", name: "Ronin Syndicate", tag: "RONIN", logo_url: null, member_count: 3, wins: 7, points: 1650, rank: 4 },
        { id: "mock-5", name: "Solar Flare", tag: "SOL", logo_url: null, member_count: 5, wins: 6, points: 1500, rank: 5 },
        { id: "mock-6", name: "Ice Legion", tag: "ICE", logo_url: null, member_count: 4, wins: 5, points: 1350, rank: 6 },
        { id: "mock-7", name: "Ether Dynasties", tag: "ETH", logo_url: null, member_count: 7, wins: 4, points: 1200, rank: 7 },
        { id: "mock-8", name: "Cyber Command", tag: "CYBER", logo_url: null, member_count: 3, wins: 3, points: 1050, rank: 8 },
    ];

    // Combine Real & Mock (Mock first if DB is empty, or append if just filling)
    // For prototype, let's prioritize mocks if DB is empty, or mix them.
    // Let's Recalculate ranks after merging
    const allTeams = [...dbTeams, ...mockTeams].sort((a, b) => b.points - a.points).map((t, i) => ({ ...t, rank: i + 1 }));

    // Use allTeams instead of formattedTeams
    const formattedTeams = allTeams;

    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header is now handled by layout tabs, but we might want a specific title here if Layout is just tabs */}
                {/* Actually, Layout has "Ranking Protocol", so we just render the view here */}
                <TeamsView teams={formattedTeams} />
            </div>
        </main>
    );
}
