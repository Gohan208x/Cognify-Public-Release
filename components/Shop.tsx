/**
 * Shop / Marketplace Component
 * 
 * Expanded marketplace with:
 * - Avatars (20 items)
 * - Titles (20 items)
 * - Profile Designs (Borders, Banners, Themes, Backgrounds)
 * - Bundle Packs (5 themed bundles with discounts)
 */

import React, { useState } from 'react';
import { User, ShopItem } from '../types';
import { ShoppingBag, Coins, Lock, Check, Sparkles, Crown, Gift, Palette, Star, Package } from 'lucide-react';
import {
  AVATARS, TITLES, PROFILE_BORDERS, PROFILE_BANNERS,
  PROFILE_THEMES, PROFILE_BACKGROUNDS, BUNDLE_PACKS,
  BundlePack, getRarityColor, getRarityBg, getItemById
} from '../src/data/shopData';
import { formatCoins } from './ProfileAvatar';

type ShopTab = 'AVATARS' | 'TITLES' | 'DESIGNS' | 'BUNDLES';
type DesignSubTab = 'BORDERS' | 'BANNERS' | 'THEMES' | 'BACKGROUNDS';

interface ShopProps {
  user: User;
  onBuy: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  onBuyBundle?: (bundle: BundlePack) => void;
  onNavigateToProfile?: () => void;
}

export const Shop: React.FC<ShopProps> = ({ user, onBuy, onEquip, onBuyBundle, onNavigateToProfile }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('AVATARS');
  const [designSubTab, setDesignSubTab] = useState<DesignSubTab>('BORDERS');

  // Get items for current design subtab
  const getDesignItems = (): ShopItem[] => {
    switch (designSubTab) {
      case 'BORDERS': return PROFILE_BORDERS;
      case 'BANNERS': return PROFILE_BANNERS;
      case 'THEMES': return PROFILE_THEMES;
      case 'BACKGROUNDS': return PROFILE_BACKGROUNDS;
      default: return [];
    }
  };

  // Check if item is equipped
  const isItemEquipped = (item: ShopItem): boolean => {
    switch (item.type) {
      case 'AVATAR': return user.avatar === item.value;
      case 'TITLE': return user.title === item.value;
      case 'BORDER': return user.profileBorder === item.id;
      case 'BANNER': return user.profileBanner === item.id;
      case 'THEME': return user.profileTheme === item.id;
      case 'BACKGROUND': return user.profileBackground === item.id;
      default: return false;
    }
  };

  // Helper to get theme preview gradient class
  const getThemePreviewClass = (id: string): string => {
    const themeColors: Record<string, string> = {
      'th_default': 'bg-gradient-to-br from-slate-700 to-slate-800',
      'th_blue': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'th_purple': 'bg-gradient-to-br from-purple-600 to-violet-800',
      'th_green': 'bg-gradient-to-br from-green-600 to-emerald-800',
      'th_red': 'bg-gradient-to-br from-red-600 to-rose-800',
      'th_gold': 'bg-gradient-to-br from-yellow-500 to-amber-600',
      'th_neon': 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500',
      'th_rainbow': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
    };
    return themeColors[id] || 'bg-slate-800';
  };

  // Helper to get background preview gradient class
  const getBackgroundPreviewClass = (id: string): string => {
    const bgColors: Record<string, string> = {
      'bg_default': 'bg-slate-950',
      'bg_grid': 'bg-gradient-to-br from-slate-800 to-slate-900',
      'bg_dots': 'bg-gradient-to-br from-slate-700 to-slate-800',
      'bg_waves': 'bg-gradient-to-br from-blue-900 to-cyan-900',
      'bg_gradient_blue': 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
      'bg_gradient_purple': 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
      'bg_stars': 'bg-gradient-to-br from-indigo-900 to-slate-900',
      'bg_matrix': 'bg-gradient-to-br from-green-900 to-slate-900',
      'bg_aurora': 'bg-gradient-to-br from-green-700 via-cyan-600 to-purple-700',
      'bg_galaxy': 'bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-900',
    };
    return bgColors[id] || 'bg-slate-800';
  };

  // Render item card
  const renderItemCard = (item: ShopItem) => {
    const isOwned = user.unlockedItems.includes(item.id) || item.isDefault;
    const isEquipped = isItemEquipped(item);
    const canAfford = user.coins >= item.cost;

    return (
      <div
        key={item.id}
        className={`relative bg-slate-900 border rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:-translate-y-1 ${isEquipped ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
          isOwned ? 'border-slate-700' :
            `border-slate-800 opacity-90 hover:opacity-100 hover:border-purple-500/50 ${getRarityBg(item.rarity)}`
          }`}
      >
        {/* Rarity badge */}
        {item.rarity && !item.isDefault && (
          <div className={`absolute top-2 right-2 text-[9px] font-bold uppercase ${getRarityColor(item.rarity)}`}>
            {item.rarity}
          </div>
        )}

        {/* Animated indicator */}
        {item.animated && (
          <div className="absolute top-2 left-2 text-xs">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
          </div>
        )}

        {/* Free badge */}
        {item.isDefault && (
          <div className="absolute top-2 left-2 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            FREE
          </div>
        )}

        {/* Item type label */}
        <div className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">{item.type}</div>

        {/* Item display - with proper color previews */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner ${item.type === 'BORDER' ? `border-4 ${item.value} bg-slate-800` :
          item.type === 'BANNER' ? `bg-gradient-to-br ${item.value}` :
            item.type === 'THEME' ? getThemePreviewClass(item.id) :
              item.type === 'BACKGROUND' ? getBackgroundPreviewClass(item.id) :
                'bg-slate-800'
          }`}>
          {item.type === 'AVATAR' && item.value}
          {item.type === 'TITLE' && '🏷️'}
          {item.type === 'BORDER' && <div className="w-8 h-8 rounded-full bg-slate-700"></div>}
          {item.type === 'BANNER' && <Palette size={20} className="text-white/80" />}
          {item.type === 'THEME' && <Star size={20} className="text-white/80" />}
          {item.type === 'BACKGROUND' && null}
        </div>

        <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
        {item.type === 'TITLE' && <p className="text-[10px] text-purple-400 font-mono mb-1">{item.value}</p>}
        <p className="text-[10px] text-slate-500 mb-4 h-6 line-clamp-2">{item.description}</p>

        {/* Action button */}
        <div className="mt-auto w-full">
          {isOwned ? (
            isEquipped ? (
              <div className="w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-500">
                <Check size={14} /> Equipped
              </div>
            ) : (
              <button
                onClick={() => onNavigateToProfile?.()}
                className="w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30"
              >
                ✏️ Edit Profile
              </button>
            )
          ) : (
            <button
              onClick={() => onBuy(item)}
              disabled={!canAfford}
              className={`w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${canAfford
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {canAfford ? <><Coins size={14} /> {item.cost}</> : <><Lock size={14} /> {item.cost}</>}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render bundle card
  const renderBundleCard = (bundle: BundlePack) => {
    const allItemsOwned = bundle.items.every(id => user.unlockedItems.includes(id));
    const canAfford = user.coins >= bundle.discountedPrice;

    return (
      <div
        key={bundle.id}
        className={`relative bg-gradient-to-br ${bundle.theme} p-[2px] rounded-2xl overflow-hidden group`}
      >
        <div className="bg-slate-900 rounded-2xl p-6 h-full">
          {/* Discount badge */}
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{bundle.discountPercent}%
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{bundle.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-white">{bundle.name}</h3>
              <p className="text-xs text-slate-400">{bundle.description}</p>
            </div>
          </div>

          {/* Items preview */}
          <div className="mb-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Includes:</div>
            <div className="flex flex-wrap gap-2">
              {bundle.items.map(itemId => {
                const item = getItemById(itemId);
                if (!item) return null;
                const isOwned = user.unlockedItems.includes(itemId);
                return (
                  <div
                    key={itemId}
                    className={`text-xs px-2 py-1 rounded-full ${isOwned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {item.type === 'AVATAR' && item.value}
                    {item.type !== 'AVATAR' && item.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-slate-500 line-through text-sm">{bundle.originalPrice}</span>
              <span className="text-2xl font-bold text-yellow-400 ml-2 flex items-center gap-1">
                <Coins size={20} /> {bundle.discountedPrice}
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-bold">
              Save {bundle.originalPrice - bundle.discountedPrice} 🪙
            </div>
          </div>

          {/* Buy button */}
          <button
            onClick={() => onBuyBundle?.(bundle)}
            disabled={allItemsOwned || !canAfford}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${allItemsOwned
              ? 'bg-emerald-500/20 text-emerald-500'
              : canAfford
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
          >
            {allItemsOwned ? <><Check size={18} /> All Items Owned</> :
              canAfford ? <><Gift size={18} /> Buy Bundle</> :
                <><Lock size={18} /> Not Enough Coins</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="text-purple-400" size={32} /> Marketplace
          </h2>
          <p className="text-slate-400 mt-1">Customize your profile with exclusive items!</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Coins size={20} className="md:w-6 md:h-6" /> {formatCoins(user.coins)}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'AVATARS' as ShopTab, label: 'Avatars', icon: <Crown size={16} />, count: AVATARS.length },
          { id: 'TITLES' as ShopTab, label: 'Titles', icon: <Star size={16} />, count: TITLES.length },
          { id: 'DESIGNS' as ShopTab, label: 'Profile Designs', icon: <Palette size={16} /> },
          { id: 'BUNDLES' as ShopTab, label: 'Bundles', icon: <Package size={16} />, count: BUNDLE_PACKS.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count && <span className="text-xs bg-slate-900/50 px-2 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Design Sub-tabs */}
      {activeTab === 'DESIGNS' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'BORDERS' as DesignSubTab, label: 'Borders', count: PROFILE_BORDERS.length },
            { id: 'BANNERS' as DesignSubTab, label: 'Banners', count: PROFILE_BANNERS.length },
            { id: 'THEMES' as DesignSubTab, label: 'Themes', count: PROFILE_THEMES.length },
            { id: 'BACKGROUNDS' as DesignSubTab, label: 'Backgrounds', count: PROFILE_BACKGROUNDS.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDesignSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${designSubTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-500 hover:text-white'
                }`}
            >
              {tab.label}
              <span className="text-xs text-slate-500">{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
        {activeTab === 'AVATARS' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {AVATARS.map(renderItemCard)}
          </div>
        )}

        {activeTab === 'TITLES' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TITLES.map(renderItemCard)}
          </div>
        )}

        {activeTab === 'DESIGNS' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {getDesignItems().map(renderItemCard)}
          </div>
        )}

        {activeTab === 'BUNDLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUNDLE_PACKS.map(renderBundleCard)}
          </div>
        )}
      </div>
    </div>
  );
};
