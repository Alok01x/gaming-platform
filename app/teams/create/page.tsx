"use client";

import { motion } from "framer-motion";
import { AuthForm, AuthInput, AuthButton } from "@/components/auth/auth-form";
import { ChevronLeft, Flag, Hash, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const tag = formData.get("tag") as string;
        const description = formData.get("description") as string;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create Team
            const { data: team, error: teamError } = await supabase
                .from("teams")
                .insert({
                    name,
                    tag: tag.toUpperCase(),
                    description,
                    owner_id: user.id
                })
                .select()
                .single();

            if (teamError) throw teamError;

            // 2. Add Owner as Member
            const { error: memberError } = await supabase
                .from("team_members")
                .insert({
                    team_id: team.id,
                    user_id: user.id,
                    role: 'OWNER'
                });

            if (memberError) throw memberError;

            // 3. Redirect to Team Hub
            router.push(`/teams/${team.id}`);

        } catch (error: any) {
            console.error("Team creation failed:", error);
            alert(`Deployment Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center">
            <div className="max-w-md w-full">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-12"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Command
                </Link>

                <AuthForm
                    title="Form Team"
                    subtitle="Founder an Elite Organization"
                    onSubmit={handleSubmit}
                >
                    <AuthInput
                        label="Organization Name"
                        type="text"
                        placeholder="e.g. Neon Shadows"
                        required
                        name="name"
                    />
                    <AuthInput
                        label="Team Tag"
                        type="text"
                        placeholder="e.g. NEON (3-4 chars)"
                        required
                        name="tag"
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Team Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Primary objective and org background..."
                            className="w-full bg-secondary border border-border rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder:text-muted-foreground/30 min-h-[120px] resize-none"
                        />
                    </div>

                    <AuthButton loading={loading}>Deploy Organization</AuthButton>
                </AuthForm>

                <div className="mt-8 p-6 glass-panel flex gap-4 items-start">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-widest">
                        Founding an organization requires a valid Commander License. As the owner,
                        you will be responsible for roster management and event participation.
                    </p>
                </div>
            </div>
        </div>
    );
}
