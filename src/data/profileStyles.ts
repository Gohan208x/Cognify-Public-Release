/**
 * Profile Customization Utility
 * Provides functions to get CSS classes for user's profile customizations
 * Used across Sidebar, DoubtPanel, Chat, and other components
 */

import { getItemById } from './shopData';

// Theme color mappings for text colors
export const THEME_TEXT_COLORS: Record<string, string> = {
    'theme-dark': 'text-white',
    'theme-blue': 'text-blue-400',
    'theme-purple': 'text-purple-400',
    'theme-green': 'text-emerald-400',
    'theme-red': 'text-red-400',
    'theme-gold': 'text-yellow-400',
    'theme-neon': 'text-pink-400',
    'theme-rainbow': 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-green-400',
};

// Theme accent colors for borders/highlights
export const THEME_ACCENT_COLORS: Record<string, string> = {
    'theme-dark': 'border-slate-600',
    'theme-blue': 'border-blue-500',
    'theme-purple': 'border-purple-500',
    'theme-green': 'border-emerald-500',
    'theme-red': 'border-red-500',
    'theme-gold': 'border-yellow-400',
    'theme-neon': 'border-pink-500',
    'theme-rainbow': 'border-gradient-rainbow',
};

// Border effect styles (some animated)
export const BORDER_STYLES: Record<string, string> = {
    'border-slate-600': 'border-slate-600',
    'border-blue-500': 'border-blue-500 shadow-blue-500/30',
    'border-emerald-500': 'border-emerald-500 shadow-emerald-500/30',
    'border-purple-500': 'border-purple-500 shadow-purple-500/30',
    'border-pink-500': 'border-pink-500 shadow-pink-500/30',
    'border-orange-500': 'border-orange-500 shadow-orange-500/30',
    'border-yellow-400': 'border-yellow-400 shadow-yellow-400/30',
    'border-gradient-rainbow': 'border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 animate-pulse',
    'border-gradient-neon': 'border-transparent bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse',
    'border-gradient-fire': 'border-transparent bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-pulse',
};

/**
 * Get the border CSS class from a user's profileBorder setting
 */
export function getBorderClass(profileBorderId: string | undefined): string {
    if (!profileBorderId) return 'border-slate-600';

    const item = getItemById(profileBorderId);
    if (!item) return 'border-slate-600';

    // Return the value which is the CSS class
    return BORDER_STYLES[item.value] || item.value || 'border-slate-600';
}

/**
 * Get the theme text color from user's profileTheme setting
 */
export function getThemeTextColor(profileThemeId: string | undefined): string {
    if (!profileThemeId) return 'text-white';

    const item = getItemById(profileThemeId);
    if (!item) return 'text-white';

    return THEME_TEXT_COLORS[item.value] || 'text-white';
}

/**
 * Get the theme accent color from user's profileTheme setting
 */
export function getThemeAccentColor(profileThemeId: string | undefined): string {
    if (!profileThemeId) return 'border-slate-600';

    const item = getItemById(profileThemeId);
    if (!item) return 'border-slate-600';

    return THEME_ACCENT_COLORS[item.value] || 'border-slate-600';
}

/**
 * Get the banner gradient class from user's profileBanner setting
 */
export function getBannerGradient(profileBannerId: string | undefined): string {
    if (!profileBannerId) return 'from-slate-800 to-slate-900';

    const item = getItemById(profileBannerId);
    if (!item) return 'from-slate-800 to-slate-900';

    return item.value || 'from-slate-800 to-slate-900';
}

/**
 * Check if a border has animation
 */
export function isBorderAnimated(profileBorderId: string | undefined): boolean {
    if (!profileBorderId) return false;

    const item = getItemById(profileBorderId);
    return item?.animated || false;
}

/**
 * Get complete profile styles for a user (for use in components)
 */
export function getProfileStyles(user: {
    profileBorder?: string;
    profileTheme?: string;
    profileBanner?: string;
}) {
    return {
        borderClass: getBorderClass(user.profileBorder),
        textColor: getThemeTextColor(user.profileTheme),
        accentColor: getThemeAccentColor(user.profileTheme),
        bannerGradient: getBannerGradient(user.profileBanner),
        isAnimated: isBorderAnimated(user.profileBorder),
    };
}

/**
 * Get inline style for gradient borders (for avatar rings)
 */
export function getGradientBorderStyle(profileBorderId: string | undefined): React.CSSProperties | undefined {
    if (!profileBorderId) return undefined;

    const item = getItemById(profileBorderId);
    if (!item?.value?.includes('gradient')) return undefined;

    // Map gradient types to CSS gradients
    const gradientMap: Record<string, string> = {
        'border-gradient-rainbow': 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6)',
        'border-gradient-neon': 'linear-gradient(90deg, #ec4899, #8b5cf6)',
        'border-gradient-fire': 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444)',
    };

    const gradient = gradientMap[item.value];
    if (!gradient) return undefined;

    return {
        background: gradient,
        padding: '2px',
    };
}
