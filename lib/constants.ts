export const SUPPORTED_GAMES = [
    {
        id: "valorant",
        name: "Valorant",
        icon: "Target",
        color: "#ff4655",
        description: "5v5 tactical character-based shooter."
    },
    {
        id: "cs2",
        name: "Counter-Strike 2",
        icon: "ShieldAlert",
        color: "#f39c12",
        description: "The next chapter of the world's premier tactical shooter."
    },
    {
        id: "lol",
        name: "League of Legends",
        icon: "Sword",
        color: "#005a82",
        description: "Fast-paced, competitive MOBA."
    },
    {
        id: "apex",
        name: "Apex Legends",
        icon: "Zap",
        color: "#a7251f",
        description: "Hero-based battle royale action."
    },
    {
        id: "ow2",
        name: "Overwatch 2",
        icon: "Crosshair",
        color: "#f99e1a",
        description: "Team-based action game set in the optimistic future."
    },
    {
        id: "rocket-league",
        name: "Rocket League",
        icon: "Car",
        color: "#00a2ed",
        description: "High-powered hybrid of arcade-style soccer and vehicular mayhem."
    }
] as const;

export type GameId = typeof SUPPORTED_GAMES[number]["id"];
