"use client";

import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                    Establishing Uplink...
                </p>
            </div>
        </div>
    );
}
