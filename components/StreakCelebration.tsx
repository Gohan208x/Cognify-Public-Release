import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface StreakCelebrationProps {
    streak: number;
    showCelebration: boolean;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({ streak, showCelebration }) => {
    const [phase, setPhase] = useState<'idle' | 'counting' | 'complete'>('idle');
    const [displayNumber, setDisplayNumber] = useState(streak > 0 ? streak - 1 : 0);
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        if (showCelebration && streak > 0) {
            setPhase('counting');
            setDisplayNumber(streak > 1 ? streak - 1 : 0);
            setParticles([1, 2, 3, 4, 5, 6]);

            const countTimer = setTimeout(() => {
                setDisplayNumber(streak);
                setPhase('complete');
            }, 600);

            const particleTimer = setTimeout(() => {
                setParticles([]);
            }, 1200);

            return () => {
                clearTimeout(countTimer);
                clearTimeout(particleTimer);
            };
        } else {
            setPhase('complete');
            setDisplayNumber(streak);
        }
    }, [showCelebration, streak]);

    // Tier thresholds
    const tiers = [
        { name: 'Starter', min: 0, max: 6, color: 'orange' },
        { name: 'Rising', min: 7, max: 29, color: 'emerald' },
        { name: 'Pro', min: 30, max: 99, color: 'blue' },
        { name: 'Master', min: 100, max: 364, color: 'purple' },
        { name: 'Legendary', min: 365, max: Infinity, color: 'amber' },
    ];

    // Get current tier
    const getCurrentTier = () => {
        return tiers.find(t => streak >= t.min && streak <= t.max) || tiers[0];
    };

    const tier = getCurrentTier();

    // Calculate progress within current tier (0-100%)
    const getTierProgress = () => {
        const progress = (streak - tier.min) / (tier.max - tier.min + 1);
        return Math.min(Math.max(progress, 0), 1) * 100;
    };

    // Color mappings
    const colorMap: Record<string, { bg: string; border: string; text: string; ring: string; glow: string }> = {
        orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400', ring: 'stroke-orange-400', glow: 'shadow-orange-500/30' },
        emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', ring: 'stroke-emerald-400', glow: 'shadow-emerald-500/30' },
        blue: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400', ring: 'stroke-blue-400', glow: 'shadow-blue-500/30' },
        purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-400', ring: 'stroke-purple-400', glow: 'shadow-purple-500/30' },
        amber: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', ring: 'stroke-amber-400', glow: 'shadow-amber-500/30' },
    };

    const colors = colorMap[tier.color];
    const progress = getTierProgress();
    const circumference = 2 * Math.PI * 22; // radius 22
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative p-4 rounded-xl ${colors.bg} border ${colors.border} overflow-hidden transition-all hover:scale-[1.02] group`}>
            {/* Celebration particles */}
            {particles.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    {particles.map(p => (
                        <div
                            key={p}
                            className="absolute animate-particle-rise"
                            style={{
                                left: `${15 + p * 12}%`,
                                bottom: '10px',
                                animationDelay: `${p * 0.08}s`
                            }}
                        >
                            <Flame size={10} className={colors.text} />
                        </div>
                    ))}
                </div>
            )}

            <div className="relative z-10 flex items-center gap-3">
                {/* Ring with flame */}
                <div className="relative w-14 h-14 shrink-0">
                    {/* Background ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                        <circle
                            cx="24" cy="24" r="22"
                            fill="none"
                            strokeWidth="3"
                            className="stroke-slate-700/50"
                        />
                        {/* Progress ring */}
                        <circle
                            cx="24" cy="24" r="22"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className={`${colors.ring} transition-all duration-700`}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    {/* Center flame */}
                    <div className={`absolute inset-0 flex items-center justify-center ${phase === 'counting' ? 'animate-pulse' : ''}`}>
                        <Flame size={22} className={`${colors.text} drop-shadow-lg`} />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${colors.text} tabular-nums ${phase === 'counting' ? 'streak-pop' : ''}`}>
                            {displayNumber}
                        </span>
                        <span className="text-xs text-slate-500">days</span>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                        {tier.name}
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                @keyframes particleRise {
                    0% { opacity: 0; transform: translateY(0) scale(0.5); }
                    30% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(-40px) scale(1); }
                }
                .animate-particle-rise {
                    animation: particleRise 0.8s ease-out forwards;
                }
                @keyframes pop {
                    0% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .streak-pop {
                    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
        </div>
    );
};
