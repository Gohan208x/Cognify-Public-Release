
export interface User {
  name: string;
  displayName?: string; // User's display name (shown instead of username when set)
  isLoggedIn: boolean;
  xp: number;
  level: number;
  streak: number;
  lastLogin: string;
  // New Economy & Inventory
  coins: number;
  avatar: string; // Emoji char
  profilePictureUrl?: string; // Custom image URL (takes priority over emoji avatar)
  title: string;
  unlockedItems: string[]; // IDs of bought items

  // Profile Customization
  profileBorder?: string; // Border item ID
  profileBanner?: string; // Banner item ID  
  profileTheme?: string; // Theme item ID
  profileBackground?: string; // Background item ID

  // Feature Trials (Key: Feature ID, Value: Expiry Timestamp)
  activeTrials: Record<string, number>;

  // Security
  checksum?: number; // Simple anti-tamper hash

  // Admin & Ban system
  isAdmin?: boolean;
  isOwner?: boolean;
  isBanned?: boolean;
  banExpiry?: string; // ISO date string or null
  banReason?: string;
  badges?: string; // Comma-separated badge IDs
}

export type ShopItemType = 'AVATAR' | 'TITLE' | 'BORDER' | 'BANNER' | 'THEME' | 'BACKGROUND' | 'BUNDLE';

export interface ShopItem {
  id: string;
  name: string;
  type: ShopItemType;
  cost: number;
  value: string; // The emoji, title text, or CSS class
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isDefault?: boolean;
  animated?: boolean;
}


export interface FileData {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  subject?: string;
}

// --- AUDIO TYPES ---

export interface AudioTrack {
  id: string;
  title: string;
  category: 'NATURE' | 'LOFI' | 'PIANO' | 'NOISE' | 'AMBIENCE';
  url: string;
  duration?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: string;
}

// --- GAMIFICATION & ARCADE TYPES ---

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: 'new' | 'learning' | 'mastered';
}

export interface Deck {
  id: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
  bestScore: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  ORGANIZER = 'ORGANIZER',
  NOTES = 'NOTES',
  ARCADE = 'ARCADE',
  RESOURCES = 'RESOURCES',
  SHOP = 'SHOP',
  ANALYTICS = 'ANALYTICS',
  CHALLENGES = 'CHALLENGES',
  SETTINGS = 'SETTINGS',
  // Social Features
  PROFILE = 'PROFILE',
  CONNECTIONS = 'CONNECTIONS',
  CHAT = 'CHAT',
  SEARCH_USERS = 'SEARCH_USERS',
  COMMUNITY = 'COMMUNITY' // Doubt Panel
}

export interface ResourceFolder {
  name: string;
  type: 'folder' | 'file' | 'link-list';
  children?: ResourceFolder[];
  content?: string[];
  path?: string;
}

// --- NEW FEATURES ---

export interface TimerState {
  isActive: boolean;
  mode: 'FOCUS' | 'BREAK';
  timeLeft: number;
  durationFocus: number; // in minutes
  durationBreak: number; // in minutes
}

export interface DailyQuest {
  id: string;
  label: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  type: 'LOGIN' | 'FOCUS' | 'REVIEW' | 'NOTES' | 'PLAN';
  minLevel: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  cost: number; // Coins to activate
  xpReward: number;
  coinReward: number;
  trialFeature: string | null; // Deprecated - always null now
  trialDurationHours: number; // Deprecated - always 0 now
  expiresAt: number; // When the challenge disappears (24h)
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  type: 'QUIZ_STREAK' | 'FOCUS_MARATHON' | 'NOTE_SPRINT' | 'DOUBT_SOLVER';
  target: number;
  progress: number;
}

export interface PlannerEvent {
  id: string;
  title: string;
  day: string; // 'Monday', 'Tuesday', etc.
  time: string; // "14:00"
  subject: string;
  completed: boolean;
  rewardClaimed?: boolean; // Anti-exploit flag
  notified?: boolean; // To prevent double notifications in the same minute
}

// --- ANALYTICS ---
export interface StudySession {
  id: string;
  timestamp: string; // ISO String
  duration: number; // in seconds
  activityType: 'FOCUS' | 'QUIZ' | 'FLASHCARD' | 'MEMORY';
  subject: string; // e.g., "Physics", "General", "Math"
  score?: number; // 0 to 100 (if applicable)
  maxScore?: number;
}

// --- PANIC MODE TYPES ---
export interface PanicContent {
  notesMarkdown: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  flashcards: {
    front: string;
    back: string;
  }[];
}

export interface PanicModule {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  cachedContent?: PanicContent; // Save content so users can revisit
}

// NOTE: APP_RESOURCES has been removed.
// Resources are now auto-discovered from the backend API.
// See: resourceApi.ts and ResourceHub.tsx
