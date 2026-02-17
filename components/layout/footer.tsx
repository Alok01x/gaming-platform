"use client";

import Link from "next/link";
import { Trophy, Twitter, Github, Mail, Globe } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-card border-t border-border pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tighter uppercase italic">
                                Gamer<span className="text-primary italic-none tracking-normal ml-1">NotFound</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Next-generation esports orchestration platform. Built for organizations, designed for excellence.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Github} href="#" />
                            <SocialLink icon={Mail} href="#" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Discovery</h4>
                        <ul className="space-y-4">
                            <FooterLink href="/tournaments">Tournaments</FooterLink>
                            <FooterLink href="/teams">Active Teams</FooterLink>
                            <FooterLink href="/leaderboards">Global Rankings</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#">Partner Program</FooterLink>
                            <FooterLink href="#">Documentation</FooterLink>
                            <FooterLink href="#">API Access</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Newsletter</h4>
                        <p className="text-muted-foreground text-xs mb-4 uppercase tracking-wider">Get the latest tournament updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="commander@gamerfound.com"
                                className="bg-secondary border border-border rounded-sm px-4 py-2 text-xs w-full focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button className="bg-primary text-primary-foreground p-2 rounded-sm hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#0891b2] active:translate-x-0 active:translate-y-0 active:shadow-none">
                                <Globe className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground gap-4">
                    <p>© 2024 GAMERNOTFOUND ORCHESTRATION. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ icon: Icon, href }: { icon: any; href: string }) {
    return (
        <a href={href} className="w-8 h-8 rounded-sm bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
            <Icon className="w-4 h-4" />
        </a>
    );
}
