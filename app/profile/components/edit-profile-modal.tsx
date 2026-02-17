"use client";

import { useState } from "react";
import { X, Shield, Target, User, Zap, Camera } from "lucide-react";
import { updateProfile } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfileModal({ profile, isOpen, onClose }: { profile: any, isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            await updateProfile(formData);
            onClose();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg glass-panel p-8 border-primary/30 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Personnel <span className="text-primary italic">Dossier</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Modify Operative Parameters</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Callsign (Gamertag)</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <input
                                        name="gamertag"
                                        defaultValue={profile?.gamertag}
                                        className="w-full bg-secondary border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specialization</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <input
                                        name="specialization"
                                        defaultValue={profile?.specialization}
                                        placeholder="e.g. Entry Fragger"
                                        className="w-full bg-secondary border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deployment Sector (Primary Game)</label>
                            <select
                                name="primary_game"
                                defaultValue={profile?.primary_game || "General"}
                                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none"
                            >
                                <option value="General">General Ops</option>
                                <option value="VALORANT">VALORANT</option>
                                <option value="CS2">CS2</option>
                                <option value="BGMI">BGMI</option>
                                <option value="DOTA2">DOTA 2</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dossier Bio</label>
                            <textarea
                                name="bio"
                                defaultValue={profile?.bio}
                                className="w-full bg-secondary border border-border rounded-xl py-4 px-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                                placeholder="Operative background and objective status..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Avatar Interface (URL)</label>
                            <div className="relative">
                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                <input
                                    name="avatar_url"
                                    defaultValue={profile?.avatar_url}
                                    placeholder="https://..."
                                    className="w-full bg-secondary border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 rounded-full border border-border text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-12 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Updating..." : "Synchronize Data"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
