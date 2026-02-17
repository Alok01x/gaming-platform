"use client";

import { motion } from "framer-motion";

export function Background() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background transition-colors duration-1000">
            {/* Tactical Grid Overlay */}
            <div
                className="absolute inset-0 z-10 opacity-[0.4] mix-blend-overlay"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Micro Dot Matrix */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    backgroundImage: `radial-gradient(var(--grid-color) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    opacity: 'var(--dot-opacity)'
                }}
            />

            {/* Animated Mesh Blobs */}
            <div className="absolute inset-0 z-0 opacity-[var(--blob-opacity)] transition-opacity duration-1000">
                {/* Blob 1 */}
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -150, 100, 0],
                        scale: [1, 1.3, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[80px] md:blur-[160px] transition-colors duration-1000"
                    style={{
                        backgroundColor: 'rgb(var(--blob-1))',
                    }}
                />

                {/* Blob 2 */}
                <motion.div
                    animate={{
                        x: [0, -120, 80, 0],
                        y: [0, 100, -120, 0],
                        scale: [1, 0.8, 1.2, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[80px] md:blur-[160px] transition-colors duration-1000"
                    style={{
                        backgroundColor: 'rgb(var(--blob-2))',
                    }}
                />

                {/* Blob 3 */}
                <motion.div
                    animate={{
                        x: [0, 80, -100, 0],
                        y: [0, 150, 50, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-[20%] left-[20%] w-[55%] h-[55%] rounded-full blur-[80px] md:blur-[160px] transition-colors duration-1000"
                    style={{
                        backgroundColor: 'rgb(var(--blob-3))',
                    }}
                />
            </div>

            {/* Noise Texture Overlay */}
            <div
                className="absolute inset-0 z-20 opacity-[0.03] md:opacity-[0.05] mix-blend-soft-light pointer-events-none"
                style={{
                    backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                }}
            />
        </div>
    );
}
