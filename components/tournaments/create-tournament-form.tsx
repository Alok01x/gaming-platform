"use client";

import { useState } from "react";
import { createTournament } from "@/app/tournaments/actions";
import { AuthInput, AuthButton } from "@/components/auth/auth-form";
import { motion } from "framer-motion";
import { SUPPORTED_GAMES } from "@/lib/constants";

export function CreateTournamentForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setLoading(true);
        // Form action handles the redirect
    }

    return (
        <form action={createTournament} onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
                label="Tournament Title"
                type="text"
                placeholder="Elite Pro Series Season 1"
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        Game Engine
                    </label>
                    <select
                        name="game_type"
                        className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground"
                        required
                    >
                        {SUPPORTED_GAMES.map(game => (
                            <option key={game.id} value={game.id}>
                                {game.name}
                            </option>
                        ))}
                    </select>
                </div>

                <AuthInput
                    label="Prize Pool"
                    type="text"
                    placeholder="e.g. $50,000"
                    required
                />
            </div>

            <AuthInput
                label="Commencement Date"
                type="datetime-local"
                required
            />

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Rules of Engagement
                </label>
                <textarea
                    name="rules"
                    rows={4}
                    placeholder="Define the rules for the elite ranks..."
                    className="w-full bg-secondary border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground resize-none"
                    required
                />
            </div>

            <AuthButton loading={loading}>Deploy Tournament</AuthButton>
        </form>
    );
}
