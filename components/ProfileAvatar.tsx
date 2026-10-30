/**
 * ProfileAvatar Component
 * A reusable component that displays a user's avatar with their equipped border effect
 * Includes proper color-changing animations for rainbow, neon, and fire borders
 */

import React from 'react';
import { getItemById } from '../src/data/shopData';

interface ProfileAvatarProps {
    avatar: string;
    profilePictureUrl?: string; // Custom image URL takes priority over emoji avatar
    profileBorder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

// Size configurations
const SIZES: Record<string, { outer: string; inner: string; text: string; ringWidth: number }> = {
    'xs': { outer: 'w-6 h-6', inner: 'w-5 h-5', text: 'text-sm', ringWidth: 1 },
    'sm': { outer: 'w-8 h-8', inner: 'w-6 h-6', text: 'text-lg', ringWidth: 2 },
    'md': { outer: 'w-10 h-10', inner: 'w-8 h-8', text: 'text-xl', ringWidth: 2 },
    'lg': { outer: 'w-14 h-14', inner: 'w-11 h-11', text: 'text-2xl', ringWidth: 3 },
    'xl': { outer: 'w-20 h-20', inner: 'w-16 h-16', text: 'text-4xl', ringWidth: 4 },
};

// Solid border colors
const SOLID_COLORS: Record<string, { color: string; shadow?: string }> = {
    'border-slate-600': { color: '#475569' },
    'border-blue-500': { color: '#3b82f6', shadow: '0 0 12px rgba(59,130,246,0.6)' },
    'border-emerald-500': { color: '#10b981', shadow: '0 0 12px rgba(16,185,129,0.6)' },
    'border-purple-500': { color: '#a855f7', shadow: '0 0 12px rgba(168,85,247,0.6)' },
    'border-pink-500': { color: '#ec4899', shadow: '0 0 12px rgba(236,72,153,0.6)' },
    'border-orange-500': { color: '#f97316', shadow: '0 0 12px rgba(249,115,22,0.6)' },
    'border-yellow-400': { color: '#facc15', shadow: '0 0 12px rgba(250,204,21,0.6)' },
};

// Unique ID generator for keyframes
let keyframeId = 0;
const getUniqueId = () => `avatar-${++keyframeId}`;

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    avatar,
    profilePictureUrl,
    profileBorder,
    size = 'md',
    className = ''
}) => {
    const sizeConfig = SIZES[size];
    const uniqueId = React.useMemo(() => getUniqueId(), []);

    // Determine what to display - prioritize custom URL image over emoji
    const isCustomImage = profilePictureUrl?.startsWith('http://') || profilePictureUrl?.startsWith('https://');
    const displayAvatar = isCustomImage ? profilePictureUrl : (avatar || '🎓');

    // Get the border style from shop data
    let borderValue = 'border-slate-600';
    if (profileBorder) {
        const item = getItemById(profileBorder);
        if (item?.value) {
            borderValue = item.value;
        }
    }

    // Check if it's a gradient border
    const isGradient = borderValue.includes('gradient');

    if (isGradient) {
        // Determine gradient type and animation config
        let keyframes = '';
        let animationName = '';
        let gradient = '';
        let shadow = '';
        let backgroundSize = '100% 100%';
        let duration = '3s';

        if (borderValue === 'border-gradient-rainbow') {
            // Rainbow: Wide gradient that sweeps through all colors visibly
            animationName = `rainbow-${uniqueId}`;
            // Create a wide repeating gradient
            gradient = 'linear-gradient(90deg, #ef4444, #f97316, #facc15, #22c55e, #14b8a6, #3b82f6, #8b5cf6, #ec4899, #ef4444, #f97316, #facc15)';
            backgroundSize = '300% 100%';
            shadow = '0 0 12px rgba(168, 85, 247, 0.7)';
            duration = '2s';
            keyframes = `
                @keyframes ${animationName} {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
            `;
        } else if (borderValue === 'border-gradient-neon') {
            // Neon: Pulsing pink/purple/blue with strong glow
            animationName = `neon-${uniqueId}`;
            gradient = 'linear-gradient(90deg, #ec4899, #a855f7, #3b82f6, #06b6d4, #3b82f6, #a855f7, #ec4899)';
            backgroundSize = '300% 100%';
            duration = '2s';
            keyframes = `
                @keyframes ${animationName} {
                    0% { 
                        background-position: 0% 50%; 
                        box-shadow: 0 0 15px rgba(236, 72, 153, 0.9);
                    }
                    50% { 
                        background-position: 50% 50%; 
                        box-shadow: 0 0 25px rgba(59, 130, 246, 1);
                    }
                    100% { 
                        background-position: 100% 50%; 
                        box-shadow: 0 0 15px rgba(236, 72, 153, 0.9);
                    }
                }
            `;
        } else if (borderValue === 'border-gradient-fire') {
            // Fire: Flickering between yellow/orange/red with glow changes
            animationName = `fire-${uniqueId}`;
            gradient = 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444, #dc2626, #ef4444, #f97316, #fbbf24)';
            backgroundSize = '300% 100%';
            duration = '1s';
            keyframes = `
                @keyframes ${animationName} {
                    0% { 
                        background-position: 0% 50%;
                        box-shadow: 0 0 15px rgba(251, 191, 36, 0.9);
                    }
                    33% { 
                        background-position: 33% 50%;
                        box-shadow: 0 0 20px rgba(249, 115, 22, 1);
                    }
                    66% { 
                        background-position: 66% 50%;
                        box-shadow: 0 0 18px rgba(239, 68, 68, 0.9);
                    }
                    100% { 
                        background-position: 100% 50%;
                        box-shadow: 0 0 15px rgba(251, 191, 36, 0.9);
                    }
                }
            `;
        }

        return (
            <>
                <style>{keyframes}</style>
                <div
                    className={`${sizeConfig.outer} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
                    style={{
                        background: gradient,
                        backgroundSize: backgroundSize,
                        padding: `${sizeConfig.ringWidth}px`,
                        animation: `${animationName} ${duration} linear infinite`,
                        boxShadow: shadow,
                    }}
                >
                    <div className={`${sizeConfig.inner} rounded-full bg-slate-800 flex items-center justify-center ${sizeConfig.text} overflow-hidden`}>
                        {isCustomImage ? (
                            <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            displayAvatar
                        )}
                    </div>
                </div>
            </>
        );
    }

    // Solid color border
    const solidConfig = SOLID_COLORS[borderValue] || SOLID_COLORS['border-slate-600'];

    return (
        <div
            className={`${sizeConfig.outer} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
            style={{
                background: solidConfig.color,
                padding: `${sizeConfig.ringWidth}px`,
                boxShadow: solidConfig.shadow,
            }}
        >
            <div className={`${sizeConfig.inner} rounded-full bg-slate-700 flex items-center justify-center ${sizeConfig.text} overflow-hidden`}>
                {isCustomImage ? (
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    displayAvatar
                )}
            </div>
        </div>
    );
};

/**
 * Format coins to K/M format for display
 */
export const formatCoins = (coins: number): string => {
    if (coins >= 1000000) {
        const millions = coins / 1000000;
        return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    }
    if (coins >= 1000) {
        const thousands = coins / 1000;
        return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return coins.toString();
};

/**
 * Get themed username class based on profile theme
 */
export const getThemedUsernameClass = (profileTheme?: string): string => {
    if (!profileTheme) return 'text-white';

    const item = getItemById(profileTheme);
    if (!item?.value) return 'text-white';

    const themeColors: Record<string, string> = {
        'theme-dark': 'text-white',
        'theme-blue': 'text-blue-400',
        'theme-purple': 'text-purple-400',
        'theme-green': 'text-emerald-400',
        'theme-red': 'text-red-400',
        'theme-gold': 'text-yellow-400',
        'theme-neon': 'text-pink-400',
        'theme-rainbow': 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400',
    };

    return themeColors[item.value] || 'text-white';
};

/**
 * Get profile background inline style from profileBackground setting
 * Returns CSS properties for background styling (matches Profile.tsx getContainerBgStyle)
 */
export const getProfileBackgroundStyle = (profileBackground?: string): React.CSSProperties => {
    if (!profileBackground) return { background: 'rgba(30, 41, 59, 0.5)' };

    const item = getItemById(profileBackground);
    if (!item?.value) return { background: 'rgba(30, 41, 59, 0.5)' };

    // Map background values to inline styles
    const bgStyles: Record<string, React.CSSProperties> = {
        'bg-slate-950': { background: '#020617' },
        'bg-grid-pattern': { background: '#1e293b' },
        'bg-dots-pattern': { background: '#334155' },
        'bg-wave-pattern': { background: '#164e63' },
        'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950': { background: 'linear-gradient(135deg, #020617 0%, #1e3a5f 50%, #020617 100%)' },
        'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950': { background: 'linear-gradient(135deg, #020617 0%, #3b1d5e 50%, #020617 100%)' },
        'bg-stars-pattern': { background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' },
        'bg-matrix-pattern': { background: 'linear-gradient(135deg, #14532d 0%, #0f172a 100%)' },
        'bg-aurora-pattern': { background: 'linear-gradient(135deg, #15803d 0%, #0891b2 50%, #7e22ce 100%)' },
        'bg-galaxy-pattern': { background: 'linear-gradient(135deg, #6b21a8 0%, #312e81 50%, #0f172a 100%)' },
    };

    return bgStyles[item.value] || { background: 'rgba(30, 41, 59, 0.5)' };
};

/**
 * Get profile background CSS class for animated backgrounds (stars, matrix, aurora, galaxy)
 * These require CSS class for animation patterns
 */
export const getProfileBackgroundClass = (profileBackground?: string): string => {
    if (!profileBackground) return '';

    const item = getItemById(profileBackground);
    if (!item?.value) return '';

    // Map animated background values to CSS class names
    const bgClasses: Record<string, string> = {
        'bg-stars-pattern': 'bg-animated-stars',
        'bg-matrix-pattern': 'bg-matrix',
        'bg-aurora-pattern': 'bg-aurora',
        'bg-galaxy-pattern': 'bg-galaxy',
    };

    return bgClasses[item.value] || '';
};

export default ProfileAvatar;
