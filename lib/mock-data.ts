export interface Tournament {
    id: string;
    title: string;
    game_type: 'BGMI' | 'VALORANT' | 'CS2' | 'LEAGUE OF LEGENDS';
    status: 'OPEN' | 'LIVE' | 'FINISHED' | 'UPCOMING';
    prize_pool: string;
    start_date: string;
    participants: number;
    max_participants: number;
    image?: string;
}

export const MOCK_TOURNAMENTS: Tournament[] = [
    {
        id: '1',
        title: 'Elite Champions Cup',
        game_type: 'VALORANT',
        status: 'OPEN',
        prize_pool: '$50,000',
        start_date: '2024-10-20T18:00:00Z',
        participants: 12,
        max_participants: 32,
    },
    {
        id: '2',
        title: 'Pro Series Season 4',
        game_type: 'BGMI',
        status: 'LIVE',
        prize_pool: '₹10,00,000',
        start_date: '2024-10-15T12:00:00Z',
        participants: 64,
        max_participants: 64,
    },
    {
        id: '3',
        title: 'Global Offensive Masters',
        game_type: 'CS2',
        status: 'UPCOMING',
        prize_pool: '$120,000',
        start_date: '2024-11-05T15:00:00Z',
        participants: 8,
        max_participants: 16,
    },
    {
        id: '4',
        title: 'Summer Rift Clash',
        game_type: 'LEAGUE OF LEGENDS',
        status: 'FINISHED',
        prize_pool: '$25,000',
        start_date: '2024-09-01T10:00:00Z',
        participants: 16,
        max_participants: 16,
    },
    {
        id: '5',
        title: 'Cyberpunk Invitational',
        game_type: 'VALORANT',
        status: 'OPEN',
        prize_pool: '$10,000',
        start_date: '2024-10-25T19:00:00Z',
        participants: 4,
        max_participants: 16,
    },
    {
        id: '6',
        title: 'Underground Battleground',
        game_type: 'BGMI',
        status: 'OPEN',
        prize_pool: '₹5,00,000',
        start_date: '2024-11-10T14:00:00Z',
        participants: 20,
        max_participants: 100,
    }
];
