import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  BrainCircuit,
  Library,
  LogOut,
  Brain,
  Gamepad2,
  ShoppingBag,
  Coins,
  CalendarDays,
  BarChart3,
  Target,
  Swords,
  Info,
  X,
  User as UserIcon,
  Search,
  Users,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Settings,
  Timer,
  Headphones,
  Music
} from 'lucide-react';
import { AppView, User } from '../types';
import { FEATURE_LEVELS } from '../App';
import { ProfileAvatar, formatCoins, getThemedUsernameClass } from './ProfileAvatar';
import { getBannerGradient } from '../src/data/profileStyles';
import { ProfileCardModal } from './ProfileCardModal';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  user: User;
  onLogout: () => void;
  onEnterPanic: () => void;
  onShowAbout: () => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  isOpen: boolean;
  onClose: () => void;
  pendingRequestCount?: number;
  // Quick action buttons
  onMusicClick?: () => void;
  onTimerClick?: () => void;
  isTimerActive?: boolean;
  timerTimeLeft?: number;
  showMusicButton?: boolean;
  isMusicPlaying?: boolean;
  communityUnreadCount?: number;
  chatUnreadCount?: number;
  studySessions?: import('../types').StudySession[];
  onViewOwnProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView, onChangeView, user, onLogout, onEnterPanic, onShowAbout, onShowTerms, onShowPrivacy, isOpen, onClose, pendingRequestCount = 0,
  onMusicClick, onTimerClick, isTimerActive = false, timerTimeLeft = 0, showMusicButton = true, isMusicPlaying = false,
  communityUnreadCount = 0, chatUnreadCount = 0, studySessions = [],
  onViewOwnProfile
}) => {
  // State for expandable sections
  const [studyToolsOpen, setStudyToolsOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  // State for profile card modal
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Main menu items (always visible)
  const mainItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.NOTES, label: 'Smart Notes', icon: BrainCircuit },
    { id: AppView.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  ];

  // Games section
  const gameItems = [
    { id: AppView.ARCADE, label: 'Study Arcade', icon: Gamepad2 },
    { id: AppView.CHALLENGES, label: 'Challenges', icon: Swords },
  ];

  // Study Tools
  const studyToolItems = [
    { id: AppView.PLANNER, label: 'Study Planner', icon: CalendarDays },
    { id: AppView.ORGANIZER, label: 'PDF Organizer', icon: FolderOpen },
    { id: AppView.RESOURCES, label: 'Resources', icon: Library },
  ];

  // Community - dynamic to include unread badge on Doubt Panel
  const communityItems = [
    { id: AppView.COMMUNITY, label: 'Community Hub', icon: MessageCircle, badge: communityUnreadCount > 0 ? communityUnreadCount : undefined },
    { id: AppView.SEARCH_USERS, label: 'Discover', icon: Search },
    { id: AppView.CONNECTIONS, label: 'Connections', icon: Users },
  ];

  // Shop
  const shopItem = { id: AppView.SHOP, label: 'Marketplace', icon: ShoppingBag };

  const xpProgress = user.xp % 100;

  // Helper to check if any item in a group is active
  const isGroupActive = (items: typeof mainItems) => items.some(item => currentView === item.id);

  // Compact menu item renderer for mobile
  const renderMenuItem = (item: typeof mainItems[0] & { badge?: number }, showBadge = false, isNested = false) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          onChangeView(item.id);
          onClose();
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative ${isActive
          ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } ${isNested ? 'text-xs' : 'text-sm'}`}
      >
        <Icon size={isNested ? 14 : 16} className={isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-white'} />
        <span className="font-medium truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
            {item.badge}
          </span>
        )}
        {showBadge && item.id === AppView.CONNECTIONS && pendingRequestCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
            {pendingRequestCount}
          </span>
        )}
      </button>
    );
  };

  // Collapsible group renderer
  const renderGroup = (
    label: string,
    Icon: any,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    items: typeof mainItems,
    colorClass: string,
    showBadge = false,
    badgeCount = 0,
    showDotBadge = false // New parameter for a dot badge on the group header
  ) => (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${isGroupActive(items) ? colorClass : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} />
          <span className="font-medium text-sm">{label}</span>
          {showDotBadge && (
            <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>
          )}
          {showBadge && badgeCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
              {badgeCount}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-700/50 pl-2">
          {items.map(item => renderMenuItem(item, showBadge, true))}
        </div>
      )}
    </div>
  );

  // Base classes - narrower on mobile
  const baseClasses = "bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out";
  const responsiveClasses = `fixed inset-y-0 left-0 w-[280px] max-w-[85vw] md:translate-x-0 md:static md:w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <div className={`${baseClasses} ${responsiveClasses}`}>
        {/* Compact Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform rotate-3">
              <Brain size={16} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Cognify</h1>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Compact Profile Card - Click to Open Card Modal */}
        <div className="px-3 py-3">
          <button
            onClick={() => setShowProfileCard(true)}
            className="w-full p-3 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-all text-left bg-slate-800/50"
          >
            {/* User's Banner - Custom URL or Gradient */}
            {user.profileBanner?.startsWith('http') ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${user.profileBanner})` }}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-r ${getBannerGradient(user.profileBanner)} opacity-20`}></div>
            )}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-emerald-500"></div>

            <div className="flex items-center gap-2.5 relative">
              {/* Avatar with User's Border Style */}
              <ProfileAvatar
                avatar={user.avatar || '🎓'}
                profilePictureUrl={user.profilePictureUrl}
                profileBorder={user.profileBorder}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                {/* Username with User's Theme Color */}
                <p className={`font-bold truncate text-sm ${getThemedUsernameClass(user.profileTheme)}`}>{user.displayName || user.name}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-white/70">Lv.{user.level}</span>
                  <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                    <Coins size={10} />{formatCoins(user.coins)}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
            </div>

            {/* Mini XP bar */}
            <div className="mt-2 w-full bg-slate-950 h-1 rounded-full overflow-hidden relative">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Main Items */}
          {mainItems.map(item => renderMenuItem(item))}

          {/* Divider */}
          <div className="!my-2 border-t border-slate-800/50"></div>

          {/* Study Tools Group */}
          {renderGroup('Study Tools', FolderOpen, studyToolsOpen, setStudyToolsOpen, studyToolItems, 'bg-emerald-500/10 text-emerald-400')}

          {/* Games Group */}
          {renderGroup('Games', Gamepad2, gamesOpen, setGamesOpen, gameItems, 'bg-orange-500/10 text-orange-400')}

          {/* Community Group - shows dot when unread, and item badge on Doubt Panel */}
          {renderGroup('Community', Users, communityOpen, setCommunityOpen, communityItems, 'bg-purple-500/10 text-purple-400', true, pendingRequestCount, communityUnreadCount > 0)}

          {/* Shop */}
          <div className="!mt-2">
            {renderMenuItem(shopItem)}
          </div>
        </nav>

        {/* Deep Focus Button - More Compact */}
        <div className="px-3 py-2">
          <button
            onClick={() => {
              onEnterPanic();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold shadow-lg transition-all border bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-900/30 hover:scale-[1.02] border-purple-500/30 text-sm"
          >
            <Target size={16} />
            <span>Deep Focus Mode</span>
          </button>
        </div>

        {/* Quick Action Buttons - Icon Only */}
        <div className="px-3 py-2 border-t border-slate-800">
          <div className="flex items-center justify-center gap-2">
            {/* Music Button */}
            {showMusicButton && (
              <button
                onClick={() => onMusicClick?.()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${isMusicPlaying
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                title="Focus Audio"
              >
                {isMusicPlaying ? <Music size={18} /> : <Headphones size={18} />}
                {isMusicPlaying && (
                  <span className="absolute -top-1 -right-1 flex items-center gap-0.5 text-[7px] font-bold text-purple-300 bg-slate-900 px-1 rounded border border-purple-500/50">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                )}
              </button>
            )}

            {/* Timer Button */}
            <button
              onClick={() => onTimerClick?.()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${isTimerActive
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              title="Focus Timer"
            >
              <Timer size={18} />
              {isTimerActive && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold font-mono text-orange-400 bg-slate-900 px-1 rounded border border-orange-500/50">
                  {Math.floor(timerTimeLeft / 60)}m
                </span>
              )}
            </button>

            {/* Messages Button */}
            <button
              onClick={() => {
                onChangeView(AppView.CHAT);
                onClose();
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${currentView === AppView.CHAT
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              title="Messages"
            >
              <MessageCircle size={18} />
              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 border border-slate-900">
                  {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer - More Compact */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex gap-1.5 mb-1.5">
            <button
              onClick={() => {
                onChangeView(AppView.SETTINGS);
                onClose();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-colors text-xs ${currentView === AppView.SETTINGS
                ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 py-2">
            <button onClick={onShowAbout} className="hover:text-slate-300 transition-colors">About</button>
            <span>•</span>
            <button onClick={onShowTerms} className="hover:text-slate-300 transition-colors">Terms</button>
            <span>•</span>
            <button onClick={onShowPrivacy} className="hover:text-slate-300 transition-colors">Privacy</button>
          </div>
        </div>
      </div>

      {/* Profile Card Modal */}
      <ProfileCardModal
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
        onViewFullProfile={() => {
          setShowProfileCard(false);
          // Reset selectedProfileUser to undefined for own profile
          onViewOwnProfile?.();
          onChangeView(AppView.PROFILE);
          onClose();
        }}
        studySessions={studySessions}
      />
    </>
  );
};
