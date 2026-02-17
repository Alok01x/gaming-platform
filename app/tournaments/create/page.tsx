import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form";
import { ChevronLeft, Flag } from "lucide-react";
import Link from "next/link";

export default async function CreateTournamentPage() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_verified")
        .eq("id", userData.user.id)
        .single();

    if (profile?.role !== "ORGANIZER" || !profile?.is_verified) {
        redirect("/tournaments");
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/tournaments"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Arenas
                </Link>

                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center">
                            <Flag className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter uppercase">
                            Launch <span className="italic opacity-50">Operation</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Orchestrate a new competitive landscape. Set the rules, define the stakes, and lead the recruitment of top-tier talent.
                    </p>
                </div>

                <div className="glass-panel p-8 md:p-12">
                    <CreateTournamentForm />
                </div>
            </div>
        </div>
    );
}
