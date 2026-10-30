/**
 * Badge System
 * 
 * Defines achievement badges that users can earn.
 * All badges are circular with hover descriptions.
 */

import React, { useState } from 'react';
import {
    Sparkles, Flame, Trophy, Star, Crown, Zap,
    Medal, Target, Clock, Rocket, Award, Heart
} from 'lucide-react';

// Badge definition interface
export interface Badge {
    id: string;
    name: string;
    description: string;
    howToEarn: string;
    icon: React.ReactNode;
    color: string; // Tailwind gradient classes
    borderColor: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// All available badges
export const BADGE_DEFINITIONS: Badge[] = [
    // === WELCOME BADGE (Everyone gets on first login) ===
    {
        id: 'welcome_genius',
        name: 'Smartest in the Room',
        description: 'Welcome to Cognify! You took the first step.',
        howToEarn: 'Create an account and log in for the first time',
        icon: <Sparkles size={20} />,
        color: 'from-blue-500 to-cyan-400',
        borderColor: 'border-blue-400',
        rarity: 'common'
    },

    // === CHALLENGE BADGES ===
    {
        id: 'challenger_10',
        name: 'Challenge Accepted',
        description: 'Completed 10 challenges!',
        howToEarn: 'Complete 10 daily challenges',
        icon: <Target size={20} />,
        color: 'from-green-500 to-emerald-400',
        borderColor: 'border-green-400',
        rarity: 'common'
    },
    {
        id: 'challenger_50',
        name: 'Challenge Warrior',
        description: 'Completed 50 challenges!',
        howToEarn: 'Complete 50 daily challenges',
        icon: <Medal size={20} />,
        color: 'from-purple-500 to-violet-400',
        borderColor: 'border-purple-400',
        rarity: 'rare'
    },
    {
        id: 'challenger_100',
        name: 'Challenge Legend',
        description: 'Completed 100 challenges!',
        howToEarn: 'Complete 100 daily challenges',
        icon: <Crown size={20} />,
        color: 'from-yellow-500 to-orange-400',
        borderColor: 'border-yellow-400',
        rarity: 'legendary'
    },

    // === STREAK BADGES ===
    {
        id: 'streak_10',
        name: 'On Fire',
        description: '10 days of consistent studying!',
        howToEarn: 'Maintain a 10-day login streak',
        icon: <Flame size={20} />,
        color: 'from-orange-500 to-red-400',
        borderColor: 'border-orange-400',
        rarity: 'common'
    },
    {
        id: 'streak_30',
        name: 'Unstoppable',
        description: '30 days straight! You\'re committed.',
        howToEarn: 'Maintain a 30-day login streak',
        icon: <Zap size={20} />,
        color: 'from-amber-500 to-yellow-400',
        borderColor: 'border-amber-400',
        rarity: 'rare'
    },
    {
        id: 'streak_180',
        name: 'Half-Year Hero',
        description: '6 months of dedication!',
        howToEarn: 'Maintain a 180-day login streak',
        icon: <Star size={20} />,
        color: 'from-pink-500 to-rose-400',
        borderColor: 'border-pink-400',
        rarity: 'epic'
    },
    {
        id: 'streak_365',
        name: 'Year-Long Warrior',
        description: 'A full year of studying! Incredible!',
        howToEarn: 'Maintain a 365-day login streak',
        icon: <Trophy size={20} />,
        color: 'from-gradient-gold via-yellow-400 to-amber-500',
        borderColor: 'border-yellow-300',
        rarity: 'legendary'
    },

    // === ACTIVITY BADGE ===
    {
        id: 'super_active',
        name: 'Super Scholar',
        description: 'Highly active power user!',
        howToEarn: 'Be active for 50+ hours total study time',
        icon: <Rocket size={20} />,
        color: 'from-indigo-500 to-blue-400',
        borderColor: 'border-indigo-400',
        rarity: 'epic'
    },
];

// Get badge by ID
export const getBadgeById = (id: string): Badge | undefined => {
    return BADGE_DEFINITIONS.find(b => b.id === id);
};

// Check which badges user has earned based on their stats
export const calculateEarnedBadges = (stats: {
    hasLoggedIn: boolean;
    challengesCompleted: number;
    currentStreak: number;
    totalStudyHours: number;
}): string[] => {
    const earned: string[] = [];

    // Welcome badge - everyone gets it
    if (stats.hasLoggedIn) {
        earned.push('welcome_genius');
    }

    // Challenge badges
    if (stats.challengesCompleted >= 10) earned.push('challenger_10');
    if (stats.challengesCompleted >= 50) earned.push('challenger_50');
    if (stats.challengesCompleted >= 100) earned.push('challenger_100');

    // Streak badges
    if (stats.currentStreak >= 10) earned.push('streak_10');
    if (stats.currentStreak >= 30) earned.push('streak_30');
    if (stats.currentStreak >= 180) earned.push('streak_180');
    if (stats.currentStreak >= 365) earned.push('streak_365');

    // Activity badge
    if (stats.totalStudyHours >= 50) earned.push('super_active');

    return earned;
};

// === BADGE COMPONENT ===
interface BadgeIconProps {
    badge: Badge;
    size?: 'sm' | 'md' | 'lg';
    locked?: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge, size = 'md', locked = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-14 h-14',
        lg: 'w-20 h-20'
    };

    const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : 28;

    const rarityGlow = {
        common: '',
        rare: 'shadow-lg shadow-purple-500/30',
        epic: 'shadow-lg shadow-pink-500/40',
        legendary: 'shadow-xl shadow-yellow-400/50 animate-pulse'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Badge Circle */}
            <div
                className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center
          border-2 ${badge.borderColor}
          bg-gradient-to-br ${badge.color}
          ${locked ? 'grayscale opacity-40' : rarityGlow[badge.rarity]}
          transition-all duration-300
          hover:scale-110
          cursor-pointer
        `}
            >
                <div className="text-white drop-shadow-md" style={{ fontSize: iconSize }}>
                    {badge.icon}
                </div>
            </div>

            {/* Tooltip on hover */}
            {showTooltip && (
                <div className="absolute z-50 bottom-full left-0 mb-2 w-48 animate-fade-in pointer-events-none">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl">
                        <div className="text-sm font-bold text-white mb-1">{badge.name}</div>
                        <div className="text-xs text-slate-400 mb-2">{badge.description}</div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                            {locked ? `🔒 ${badge.howToEarn}` : '✓ Unlocked!'}
                        </div>
                        {/* Rarity indicator */}
                        <div className={`text-[9px] uppercase tracking-wider mt-1 font-bold ${badge.rarity === 'legendary' ? 'text-yellow-400' :
                            badge.rarity === 'epic' ? 'text-pink-400' :
                                badge.rarity === 'rare' ? 'text-purple-400' :
                                    'text-slate-500'
                            }`}>
                            {badge.rarity}
                        </div>
                    </div>
                    {/* Arrow - positioned to point at badge center */}
                    <div className="absolute top-full left-6 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
            )}
        </div>
    );
};

// === BADGES DISPLAY GRID ===
interface BadgesDisplayProps {
    earnedBadgeIds: string[];
    showLocked?: boolean;
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ earnedBadgeIds, showLocked = false }) => {
    const earnedBadges = earnedBadgeIds.map(id => getBadgeById(id)).filter(Boolean) as Badge[];
    const lockedBadges = showLocked ? BADGE_DEFINITIONS.filter(b => !earnedBadgeIds.includes(b.id)) : [];

    return (
        <div className="space-y-4">
            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        🏆 Badges ({earnedBadges.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {earnedBadges.map(badge => (
                            <BadgeIcon key={badge.id} badge={badge} />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges (if showing) */}
            {showLocked && lockedBadges.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">
                        🔒 Locked ({lockedBadges.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {lockedBadges.map(badge => (
                            <BadgeIcon key={badge.id} badge={badge} locked />
                        ))}
                    </div>
                </div>
            )}

            {earnedBadges.length === 0 && !showLocked && (
                <div className="text-slate-500 text-sm italic">No badges earned yet</div>
            )}
        </div>
    );
};
