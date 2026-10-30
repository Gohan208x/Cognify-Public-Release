/**
 * Shop Data - All purchasable items in the marketplace
 * 
 * Categories:
 * - Avatars (20 items)
 * - Titles (20 items)
 * - Profile Borders (12 items)
 * - Profile Banners (10 items)
 * - Profile Themes (8 items)
 * - Profile Backgrounds (10 items)
 * - Bundle Packs (5 items with discounts)
 */

export type ShopItemType = 'AVATAR' | 'TITLE' | 'BORDER' | 'BANNER' | 'THEME' | 'BACKGROUND' | 'BUNDLE';

export interface ShopItem {
    id: string;
    name: string;
    type: ShopItemType;
    cost: number;
    value: string; // Emoji, title text, or CSS class/gradient
    description: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    isDefault?: boolean; // Free default items
    animated?: boolean; // Has animation
}

export interface BundlePack {
    id: string;
    name: string;
    description: string;
    items: string[]; // Item IDs included
    originalPrice: number;
    discountedPrice: number;
    discountPercent: number;
    theme: string; // Gradient class for display
    icon: string;
}

// ============================================
// AVATARS (20 items)
// ============================================
export const AVATARS: ShopItem[] = [
    // Common (50-100 coins)
    { id: 'av_cat', name: 'Cool Cat', type: 'AVATAR', cost: 50, value: '🐱', description: 'Curious and clever.', rarity: 'common' },
    { id: 'av_dog', name: 'Smart Pup', type: 'AVATAR', cost: 50, value: '🐶', description: 'Loyal study buddy.', rarity: 'common' },
    { id: 'av_book', name: 'Bookworm', type: 'AVATAR', cost: 75, value: '📚', description: 'Knowledge seeker.', rarity: 'common' },
    { id: 'av_rocket', name: 'Rocket', type: 'AVATAR', cost: 100, value: '🚀', description: 'Sky is the limit!', rarity: 'common' },
    { id: 'av_sun', name: 'Sunshine', type: 'AVATAR', cost: 100, value: '☀️', description: 'Bright and positive.', rarity: 'common' },

    // Rare (150-300 coins)
    { id: 'av_robot', name: 'Cyberpunk', type: 'AVATAR', cost: 150, value: '🤖', description: 'For the tech savvy.', rarity: 'rare' },
    { id: 'av_wizard', name: 'Wizard', type: 'AVATAR', cost: 200, value: '🧙‍♂️', description: 'Master of knowledge.', rarity: 'rare' },
    { id: 'av_fox', name: 'Clever Fox', type: 'AVATAR', cost: 200, value: '🦊', description: 'Quick and cunning.', rarity: 'rare' },
    { id: 'av_owl', name: 'Wise Owl', type: 'AVATAR', cost: 250, value: '🦉', description: 'Night study expert.', rarity: 'rare' },
    { id: 'av_whale', name: 'Deep Diver', type: 'AVATAR', cost: 300, value: '🐋', description: 'Deep thinker.', rarity: 'rare' },

    // Epic (400-600 coins)
    { id: 'av_alien', name: 'Alien Genius', type: 'AVATAR', cost: 400, value: '👽', description: 'Intelligence from beyond.', rarity: 'epic' },
    { id: 'av_ninja', name: 'Ninja', type: 'AVATAR', cost: 500, value: '🥷', description: 'Silent but studious.', rarity: 'epic' },
    { id: 'av_ufo', name: 'UFO', type: 'AVATAR', cost: 500, value: '🛸', description: 'Out of this world!', rarity: 'epic' },
    { id: 'av_fire', name: 'Inferno', type: 'AVATAR', cost: 600, value: '🔥', description: 'Burning passion!', rarity: 'epic' },
    { id: 'av_diamond', name: 'Diamond Mind', type: 'AVATAR', cost: 600, value: '💎', description: 'Unbreakable focus.', rarity: 'epic' },

    // Legendary (800-1000 coins)
    { id: 'av_king', name: 'King', type: 'AVATAR', cost: 800, value: '👑', description: 'Rule your grades.', rarity: 'legendary' },
    { id: 'av_dragon', name: 'Dragon', type: 'AVATAR', cost: 900, value: '🐉', description: 'Legendary learner.', rarity: 'legendary' },
    { id: 'av_unicorn', name: 'Unicorn', type: 'AVATAR', cost: 900, value: '🦄', description: 'Magical genius.', rarity: 'legendary' },
    { id: 'av_phoenix', name: 'Phoenix', type: 'AVATAR', cost: 1000, value: '🔱', description: 'Rise from any failure.', rarity: 'legendary' },
    { id: 'av_star', name: 'Superstar', type: 'AVATAR', cost: 1000, value: '⭐', description: 'Shine bright always.', rarity: 'legendary' },
];

// ============================================
// TITLES (20 items)
// ============================================
export const TITLES: ShopItem[] = [
    // Common (50-100 coins)
    { id: 'ti_student', name: 'Student', type: 'TITLE', cost: 50, value: 'Student 📖', description: 'Just getting started.', rarity: 'common' },
    { id: 'ti_learner', name: 'Eager Learner', type: 'TITLE', cost: 50, value: 'Eager Learner 📝', description: 'Always curious.', rarity: 'common' },
    { id: 'ti_reader', name: 'Bookworm', type: 'TITLE', cost: 75, value: 'Bookworm 🐛', description: 'You love to read.', rarity: 'common' },
    { id: 'ti_explorer', name: 'Explorer', type: 'TITLE', cost: 100, value: 'Explorer 🧭', description: 'Knowledge adventurer.', rarity: 'common' },
    { id: 'ti_dreamer', name: 'Dreamer', type: 'TITLE', cost: 100, value: 'Dreamer 💭', description: 'Aim for the stars.', rarity: 'common' },

    // Rare (150-400 coins)
    { id: 'ti_scholar', name: 'Scholar', type: 'TITLE', cost: 200, value: 'Scholar 📜', description: 'A serious student.', rarity: 'rare' },
    { id: 'ti_genius', name: 'Genius', type: 'TITLE', cost: 250, value: 'Genius 🧠', description: 'Big brain energy.', rarity: 'rare' },
    { id: 'ti_tech', name: 'Tech Wizard', type: 'TITLE', cost: 300, value: 'Tech Wizard 💻', description: 'Master of the machine.', rarity: 'rare' },
    { id: 'ti_nerd', name: 'Proud Nerd', type: 'TITLE', cost: 300, value: 'Proud Nerd 🤓', description: 'Wear it with pride.', rarity: 'rare' },
    { id: 'ti_night', name: 'Night Owl', type: 'TITLE', cost: 400, value: 'Night Owl 🌙', description: 'Late night grinder.', rarity: 'rare' },

    // Epic (500-1000 coins)
    { id: 'ti_ace', name: 'Ace', type: 'TITLE', cost: 500, value: 'Ace ♠️', description: 'Top of the deck.', rarity: 'epic' },
    { id: 'ti_prodigy', name: 'Prodigy', type: 'TITLE', cost: 600, value: 'Prodigy ✨', description: 'Natural talent.', rarity: 'epic' },
    { id: 'ti_master', name: 'Study Master', type: 'TITLE', cost: 800, value: 'Study Master 🎓', description: 'Mastered the art.', rarity: 'epic' },
    { id: 'ti_elite', name: 'Elite', type: 'TITLE', cost: 900, value: 'Elite 💫', description: 'Top 1% performer.', rarity: 'epic' },
    { id: 'ti_sage', name: 'Sage', type: 'TITLE', cost: 1000, value: 'Sage 🔮', description: 'Ancient wisdom.', rarity: 'epic' },

    // Legendary (1200-2000 coins)  
    { id: 'ti_grand', name: 'Grandmaster', type: 'TITLE', cost: 1200, value: 'Grandmaster 🏆', description: 'Top of the class.', rarity: 'legendary' },
    { id: 'ti_legend', name: 'Legend', type: 'TITLE', cost: 1500, value: 'Legend 🌟', description: 'Your name echoes.', rarity: 'legendary' },
    { id: 'ti_time', name: 'Time Lord', type: 'TITLE', cost: 1800, value: 'Time Lord ⏳', description: 'Master of productivity.', rarity: 'legendary' },
    { id: 'ti_immortal', name: 'Immortal', type: 'TITLE', cost: 2000, value: 'Immortal ♾️', description: 'Forever remembered.', rarity: 'legendary' },
    { id: 'ti_god', name: 'Study God', type: 'TITLE', cost: 2000, value: 'Study God ⚡', description: 'Ultimate achiever.', rarity: 'legendary' },
];

// ============================================
// PROFILE BORDERS (12 items)
// ============================================
export const PROFILE_BORDERS: ShopItem[] = [
    // Free defaults
    { id: 'bd_default', name: 'Classic', type: 'BORDER', cost: 0, value: 'border-slate-600', description: 'Simple and clean.', isDefault: true },
    { id: 'bd_blue', name: 'Ocean', type: 'BORDER', cost: 0, value: 'border-blue-500', description: 'Calm blue border.', isDefault: true },

    // Purchasable
    { id: 'bd_green', name: 'Emerald', type: 'BORDER', cost: 100, value: 'border-emerald-500', description: 'Fresh green glow.', rarity: 'common' },
    { id: 'bd_purple', name: 'Violet', type: 'BORDER', cost: 100, value: 'border-purple-500', description: 'Royal purple edge.', rarity: 'common' },
    { id: 'bd_pink', name: 'Rose', type: 'BORDER', cost: 150, value: 'border-pink-500', description: 'Sweet pink border.', rarity: 'common' },
    { id: 'bd_orange', name: 'Sunset', type: 'BORDER', cost: 150, value: 'border-orange-500', description: 'Warm sunset glow.', rarity: 'rare' },
    { id: 'bd_gold', name: 'Golden', type: 'BORDER', cost: 300, value: 'border-yellow-400', description: 'Prestigious gold.', rarity: 'rare' },
    { id: 'bd_rainbow', name: 'Rainbow', type: 'BORDER', cost: 400, value: 'border-gradient-rainbow', description: 'All the colors!', rarity: 'epic', animated: true },
    { id: 'bd_neon', name: 'Neon Pulse', type: 'BORDER', cost: 450, value: 'border-gradient-neon', description: 'Glowing neon effect.', rarity: 'epic', animated: true },
    { id: 'bd_fire', name: 'Flame Ring', type: 'BORDER', cost: 500, value: 'border-gradient-fire', description: 'Burning hot border!', rarity: 'legendary', animated: true },
];

// ============================================
// PROFILE BANNERS (10 items)
// ============================================
export const PROFILE_BANNERS: ShopItem[] = [
    // Free defaults
    { id: 'bn_default', name: 'Midnight', type: 'BANNER', cost: 0, value: 'from-slate-800 to-slate-900', description: 'Clean dark banner.', isDefault: true },
    { id: 'bn_blue', name: 'Sky Blue', type: 'BANNER', cost: 0, value: 'from-blue-600 to-blue-800', description: 'Clear sky gradient.', isDefault: true },

    // Purchasable
    { id: 'bn_sunrise', name: 'Sunrise', type: 'BANNER', cost: 200, value: 'from-orange-500 via-pink-500 to-purple-600', description: 'Morning dawn colors.', rarity: 'rare' },
    { id: 'bn_ocean', name: 'Deep Ocean', type: 'BANNER', cost: 250, value: 'from-cyan-500 via-blue-600 to-indigo-800', description: 'Ocean depths.', rarity: 'rare' },
    { id: 'bn_forest', name: 'Forest', type: 'BANNER', cost: 250, value: 'from-green-500 via-emerald-600 to-teal-700', description: 'Lush green forest.', rarity: 'rare' },
    { id: 'bn_blaze', name: 'Blaze', type: 'BANNER', cost: 350, value: 'from-yellow-500 via-orange-500 to-red-600', description: 'Fiery hot gradient.', rarity: 'epic' },
    { id: 'bn_space', name: 'Galaxy', type: 'BANNER', cost: 400, value: 'from-purple-600 via-violet-700 to-indigo-900', description: 'Cosmic space vibes.', rarity: 'epic' },
    { id: 'bn_aurora', name: 'Aurora', type: 'BANNER', cost: 500, value: 'from-green-400 via-cyan-500 to-purple-600', description: 'Northern lights.', rarity: 'epic', animated: true },
    { id: 'bn_neon', name: 'Neon City', type: 'BANNER', cost: 550, value: 'from-pink-500 via-purple-600 to-blue-600', description: 'Cyberpunk vibes.', rarity: 'legendary' },
    { id: 'bn_gold', name: 'Royal Gold', type: 'BANNER', cost: 600, value: 'from-yellow-400 via-amber-500 to-orange-600', description: 'Luxury gold banner.', rarity: 'legendary' },
];

// ============================================
// PROFILE THEMES (8 color schemes)
// ============================================
export const PROFILE_THEMES: ShopItem[] = [
    // Free defaults
    { id: 'th_default', name: 'Dark Mode', type: 'THEME', cost: 0, value: 'theme-dark', description: 'Classic dark theme.', isDefault: true },
    { id: 'th_blue', name: 'Ocean Blue', type: 'THEME', cost: 0, value: 'theme-blue', description: 'Cool blue accents.', isDefault: true },

    // Purchasable
    { id: 'th_purple', name: 'Royal Purple', type: 'THEME', cost: 300, value: 'theme-purple', description: 'Purple accent theme.', rarity: 'rare' },
    { id: 'th_green', name: 'Forest Green', type: 'THEME', cost: 300, value: 'theme-green', description: 'Nature-inspired green.', rarity: 'rare' },
    { id: 'th_red', name: 'Crimson Red', type: 'THEME', cost: 400, value: 'theme-red', description: 'Bold red accents.', rarity: 'epic' },
    { id: 'th_gold', name: 'Golden Hour', type: 'THEME', cost: 500, value: 'theme-gold', description: 'Luxurious gold theme.', rarity: 'epic' },
    { id: 'th_neon', name: 'Neon Nights', type: 'THEME', cost: 600, value: 'theme-neon', description: 'Vibrant neon colors.', rarity: 'legendary' },
    { id: 'th_rainbow', name: 'Rainbow', type: 'THEME', cost: 800, value: 'theme-rainbow', description: 'Colorful rainbow theme!', rarity: 'legendary', animated: true },
];

// ============================================
// PROFILE BACKGROUNDS (10 items)
// ============================================
export const PROFILE_BACKGROUNDS: ShopItem[] = [
    // Free defaults
    { id: 'bg_default', name: 'Slate', type: 'BACKGROUND', cost: 0, value: 'bg-slate-950', description: 'Clean dark background.', isDefault: true },
    { id: 'bg_grid', name: 'Grid', type: 'BACKGROUND', cost: 0, value: 'bg-grid-pattern', description: 'Subtle grid pattern.', isDefault: true },

    // Purchasable
    { id: 'bg_dots', name: 'Polka Dots', type: 'BACKGROUND', cost: 100, value: 'bg-dots-pattern', description: 'Playful dots pattern.', rarity: 'common' },
    { id: 'bg_waves', name: 'Waves', type: 'BACKGROUND', cost: 150, value: 'bg-wave-pattern', description: 'Flowing wave lines.', rarity: 'common' },
    { id: 'bg_gradient_blue', name: 'Blue Mist', type: 'BACKGROUND', cost: 200, value: 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950', description: 'Subtle blue gradient.', rarity: 'rare' },
    { id: 'bg_gradient_purple', name: 'Purple Haze', type: 'BACKGROUND', cost: 200, value: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950', description: 'Mystical purple glow.', rarity: 'rare' },
    { id: 'bg_stars', name: 'Starfield', type: 'BACKGROUND', cost: 300, value: 'bg-stars-pattern', description: 'Twinkling stars.', rarity: 'epic', animated: true },
    { id: 'bg_matrix', name: 'Matrix', type: 'BACKGROUND', cost: 350, value: 'bg-matrix-pattern', description: 'Digital rain effect.', rarity: 'epic', animated: true },
    { id: 'bg_aurora', name: 'Aurora', type: 'BACKGROUND', cost: 400, value: 'bg-aurora-pattern', description: 'Flowing aurora lights.', rarity: 'legendary', animated: true },
    { id: 'bg_galaxy', name: 'Galaxy', type: 'BACKGROUND', cost: 400, value: 'bg-galaxy-pattern', description: 'Deep space nebula.', rarity: 'legendary', animated: true },
];

// ============================================
// BUNDLE PACKS (5 themed bundles with discounts)
// ============================================
export const BUNDLE_PACKS: BundlePack[] = [
    {
        id: 'pack_sunrise',
        name: 'Sunrise Pack',
        description: 'Start your day right with warm morning vibes!',
        items: ['av_sun', 'ti_dreamer', 'bd_orange', 'bn_sunrise', 'bg_gradient_blue'],
        originalPrice: 100 + 100 + 150 + 200 + 200, // 750
        discountedPrice: 600,
        discountPercent: 20,
        theme: 'from-orange-500 to-pink-500',
        icon: '🌅'
    },
    {
        id: 'pack_ocean',
        name: 'Ocean Pack',
        description: 'Dive deep into calm ocean aesthetics.',
        items: ['av_whale', 'ti_explorer', 'bd_blue', 'bn_ocean', 'bg_waves'],
        originalPrice: 300 + 100 + 0 + 250 + 150, // 800
        discountedPrice: 640,
        discountPercent: 20,
        theme: 'from-cyan-500 to-blue-600',
        icon: '🌊'
    },
    {
        id: 'pack_fire',
        name: 'Inferno Pack',
        description: 'Burn bright with blazing hot style!',
        items: ['av_fire', 'ti_ace', 'bd_fire', 'bn_blaze', 'bg_gradient_purple'],
        originalPrice: 600 + 500 + 500 + 350 + 200, // 2150
        discountedPrice: 1500,
        discountPercent: 30,
        theme: 'from-orange-500 to-red-600',
        icon: '🔥'
    },
    {
        id: 'pack_galaxy',
        name: 'Galaxy Pack',
        description: 'Explore the cosmic universe in style!',
        items: ['av_ufo', 'ti_legend', 'bd_neon', 'bn_space', 'bg_galaxy'],
        originalPrice: 500 + 1500 + 450 + 400 + 400, // 3250
        discountedPrice: 2600,
        discountPercent: 20,
        theme: 'from-purple-600 to-indigo-800',
        icon: '🌌'
    },
    {
        id: 'pack_nature',
        name: 'Nature Pack',
        description: 'Embrace the beauty of nature.',
        items: ['av_fox', 'ti_night', 'bd_green', 'bn_forest', 'bg_stars'],
        originalPrice: 200 + 400 + 100 + 250 + 300, // 1250
        discountedPrice: 1125,
        discountPercent: 10,
        theme: 'from-green-500 to-emerald-600',
        icon: '🌿'
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAllShopItems = (): ShopItem[] => [
    ...AVATARS,
    ...TITLES,
    ...PROFILE_BORDERS,
    ...PROFILE_BANNERS,
    ...PROFILE_THEMES,
    ...PROFILE_BACKGROUNDS,
];

export const getItemById = (id: string): ShopItem | undefined => {
    return getAllShopItems().find(item => item.id === id);
};

export const getDefaultItems = (): ShopItem[] => {
    return getAllShopItems().filter(item => item.isDefault);
};

export const getBundleById = (id: string): BundlePack | undefined => {
    return BUNDLE_PACKS.find(pack => pack.id === id);
};

export const getRarityColor = (rarity?: string): string => {
    switch (rarity) {
        case 'common': return 'text-slate-400';
        case 'rare': return 'text-purple-400';
        case 'epic': return 'text-pink-400';
        case 'legendary': return 'text-yellow-400';
        default: return 'text-slate-500';
    }
};

export const getRarityBg = (rarity?: string): string => {
    switch (rarity) {
        case 'common': return 'bg-slate-500/10 border-slate-500/20';
        case 'rare': return 'bg-purple-500/10 border-purple-500/20';
        case 'epic': return 'bg-pink-500/10 border-pink-500/20';
        case 'legendary': return 'bg-yellow-500/10 border-yellow-500/20';
        default: return 'bg-slate-800 border-slate-700';
    }
};
