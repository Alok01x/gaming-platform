"use client";

import { motion } from "framer-motion";

export interface DataPoint {
    label: string;
    value: number;
}

interface PerformanceGraphProps {
    data: DataPoint[];
    label?: string;
    color?: string;
    height?: number;
}

export function PerformanceGraph({
    data,
    label = "Current Potency",
    color = "var(--primary)",
    height: containerHeight = 250
}: PerformanceGraphProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Intelligence Data Insufficient</span>
            </div>
        );
    }

    const width = 800;
    const height = 200;
    const padding = 20;

    const values = data.map(d => d.value);
    const max = Math.max(...values, 100); // Scale to 100 if data is low
    const min = Math.min(...values, 0);

    const range = max - min || 1;
    const step = (width - padding * 2) / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
        const x = padding + i * step;
        const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
        return { x, y };
    });

    const pathData = points.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaData = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const currentValue = data[data.length - 1].value;

    return (
        <div className="w-full relative" style={{ height: containerHeight }}>
            <div className="absolute inset-0 z-0">
                <svg width="100%" height="80%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 1, 2].map(i => (
                        <line
                            key={i}
                            x1="0"
                            y1={(height / 2) * i}
                            x2={width}
                            y2={(height / 2) * i}
                            stroke="currentColor"
                            className="text-foreground/5"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area fill */}
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        d={areaData}
                        fill={color}
                    />

                    {/* Path line */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * i, type: "spring" }}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="var(--background)"
                            stroke={color}
                            strokeWidth="2"
                        />
                    ))}
                </svg>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-0 w-full flex justify-between px-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                        {d.label}
                    </span>
                ))}
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-0 right-0 p-4 text-right">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">{label}</div>
                <div className="text-2xl font-black" style={{ color }}>{currentValue}%</div>
            </div>
        </div>
    );
}
