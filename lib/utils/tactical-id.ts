export function getTacticalColor(id: string | null | undefined) {
    if (!id) return "text-muted-foreground";

    // Check constraints strictly based on DB generation logic
    if (id.startsWith("AR-")) return "text-blue-500"; // Architect (Organizer)
    if (id.startsWith("TC-")) return "text-amber-500"; // Tactician (Coach)
    if (id.startsWith("OP-")) {
        if (id.includes("-VAL-")) return "text-rose-500"; // Valorant
        if (id.includes("-CS2-")) return "text-yellow-500"; // CS2
        if (id.includes("-BGM-")) return "text-emerald-500"; // BGMI
        return "text-cyan-500"; // Generic Operative
    }

    return "text-foreground";
}

export function getTacticalBadge(role: string | null) {
    switch (role) {
        case 'HIGH_COMMAND': return { label: 'ADM', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
        case 'ORGANIZER': return { label: 'ARC', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
        case 'COACH': return { label: 'TAC', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
        default: return null;
    }
}
