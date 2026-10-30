
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Organizer } from './components/Organizer';
import { SmartNotes } from './components/SmartNotes';
import { ResourceHub } from './components/ResourceHub';
import { StudyArcade } from './components/StudyArcade';
import { PomodoroOverlay } from './components/PomodoroOverlay';
import { Shop } from './components/Shop';
import { Planner } from './components/Planner';
import { MusicPlayer } from './components/MusicPlayer';
import { StudyAnalyzer } from './components/StudyAnalyzer';
import { PanicMode } from './components/PanicMode';
import { Challenges } from './components/Challenges';
import { Profile } from './components/Profile';
import { SearchUsers } from './components/SearchUsers';
import { Connections } from './components/Connections';
import { Chat } from './components/Chat';
import { StreakCelebration } from './components/StreakCelebration';
import { DoubtPanel } from './components/DoubtPanel';
import { BanScreen } from './components/BanScreen';
import { Settings } from './components/Settings';
import { ProfileCardModal } from './components/ProfileCardModal';
import { AppView, User, Deck, TimerState, DailyQuest, ShopItem, PlannerEvent, StudySession, DailyChallenge } from './types';
import { BundlePack, getItemById } from './src/data/shopData';
import './styles/social.css';
import { Trophy, Brain, ArrowLeft, ArrowRight, CheckCircle2, Target, Coins, CalendarDays, Sparkles, X, Bell, Lock, Clock, Swords, AlertOctagon, Heart, Coffee, Shield, Zap, Layers, User as UserIcon, Github, Linkedin, Menu, Eye, EyeOff, BrainCircuit, Gamepad2, BarChart3, MessageCircle, ChevronRight } from 'lucide-react';

// Import API services
import { userApi, deckApi, plannerApi, sessionApi, geminiApi, authApi, connectionApi, chatApi } from './src/api';

// --- CONFIGURATION: LEVEL REQUIREMENTS (ALL SET TO 0 = UNLOCKED FROM START) ---
export const FEATURE_LEVELS: Record<string, number> = {
  [AppView.PLANNER]: 0,
  [AppView.ARCADE]: 0,
  [AppView.ANALYTICS]: 0,
  [AppView.NOTES]: 0,
  [AppView.ORGANIZER]: 0,
  [AppView.RESOURCES]: 0,
  [AppView.CHALLENGES]: 0,
  [AppView.SHOP]: 0,
  'MUSIC_PLAYER': 0,
  'AI_PLANNER': 0,
  'PANIC_MODE': 0
};

// --- ABOUT MODAL ---
const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg transform rotate-3">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">About Cognify</h2>
              <p className="text-xs text-slate-400 font-mono">Version 2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">

          <div className="space-y-4">
            <p className="text-slate-200 leading-relaxed text-lg">
              <strong className="text-white">Cognify</strong> is an AI-powered, gamified study system designed to make studying organized, focused, and less stressful.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              It runs as a web-based application and uses AI to reduce friction by generating structured notes, flashcards, quizzes, and study plans. Game-like progression helps students stay consistent and motivated.
            </p>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <Shield size={14} /> Personal & Private by Design. No Data Selling.
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400" size={18} /> Main Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: Brain, label: "Smart Notes", desc: "AI-generated study notes from any topic" },
                { icon: Gamepad2, label: "Study Arcade", desc: "Flashcards, quizzes & memory games" },
                { icon: CalendarDays, label: "Smart Planner", desc: "AI schedule & event management" },
                { icon: Target, label: "Deep Focus Mode", desc: "Distraction-free intensive study" },
                { icon: MessageCircle, label: "Community Hub", desc: "Chat, doubts & announcements" },
                { icon: BrainCircuit, label: "Sound Lounge", desc: "Lo-fi, nature & focus ambience" },
                { icon: Trophy, label: "Gamification", desc: "XP, coins, levels & streaks" },
                { icon: Coins, label: "Marketplace", desc: "Avatars, titles & profile items" },
                { icon: Shield, label: "Cloud Sync", desc: "Progress saved across devices" },
                { icon: Zap, label: "Smart AI", desc: "Auto model rotation, never fails" },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="p-2 bg-slate-800 rounded-lg text-primary-400"><feat.icon size={18} /></div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{feat.label}</div>
                    <div className="text-[10px] text-slate-500">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creator */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                <UserIcon size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">About Me</h3>
                <p className="text-indigo-300 text-sm">Shivam • B.Tech IT Student • Amity University</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              I built Cognify in my free time after struggling with disorganized notes and inefficient revision during exams. The project started small and evolved step by step as I kept adding features I personally needed while studying.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 italic">
              With no funding or backing, Cognify is shared openly so students can study in a more structured and calm way.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connect:</span>
              <a
                href="https://github.com/Gohan208x"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all text-xs font-medium"
              >
                <Github size={14} /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/shivam-tanwar-165b5a310/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-blue-600/20 rounded-lg text-slate-300 hover:text-blue-400 transition-all text-xs font-medium"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          </div>

          {/* Donation */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <a
              href="https://buymeacoffee.com/gohan_208x"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,221,0,0.3)]"
            >
              <Coffee size={24} className="group-hover:animate-bounce" />
              <span>Buy me a Coffee</span>
            </a>
            <p className="text-slate-500 text-xs">Support the project to keep the servers running!</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Built for students who want to study smarter, not harder.
          </p>
        </div>

      </div>
    </div>
  );
};

// --- TERMS OF SERVICE MODAL ---
const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <AlertOctagon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Terms of Service</h2>
              <p className="text-xs text-slate-400">Last updated: January 2025</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-6">

          <p className="text-slate-300 leading-relaxed">
            By using Cognify, you agree to these terms. Please read them carefully.
          </p>

          {/* Rules Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} /> Community Guidelines
            </h3>
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
              {[
                { rule: "No Harassment or Bullying", desc: "Treat all users with respect. Personal attacks are not tolerated." },
                { rule: "No NSFW Content", desc: "Keep all content appropriate for a study environment." },
                { rule: "No Spam or Flooding", desc: "Don't spam messages, doubts, or repetitive content." },
                { rule: "No Hate Speech", desc: "Discrimination based on race, gender, religion, etc. is prohibited." },
                { rule: "No Impersonation", desc: "Don't pretend to be admins, moderators, or other users." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <X size={14} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.rule}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exploitation */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertOctagon className="text-red-400" size={20} /> Exploitation & Abuse
            </h3>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Attempting to exploit, hack, or abuse Cognify's systems will result in <strong className="text-red-400">immediate and permanent ban</strong>. This includes:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Manipulating XP, coins, or progression systems</li>
                <li>• Exploiting bugs for unfair advantage (report them instead!)</li>
                <li>• Using automated tools, bots, or scripts</li>
                <li>• Attempting to access other users' accounts</li>
                <li>• Any form of cheating or unfair play</li>
              </ul>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserIcon className="text-blue-400" size={20} /> Account Responsibility
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You are responsible for maintaining the security of your account. Keep your password private and don't share your login credentials. Report any unauthorized access immediately.
            </p>
          </div>

          {/* Moderation */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Moderation:</strong> Admins reserve the right to warn, mute, or ban users who violate these terms. Bans may be temporary or permanent depending on severity.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Violations may result in account suspension or permanent ban.
          </p>
        </div>

      </div>
    </div>
  );
};

// --- PRIVACY POLICY MODAL ---
const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Privacy Policy</h2>
              <p className="text-xs text-slate-400">Your data, your control</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* Privacy Badge */}
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <Shield size={18} /> Your data is safe. We don't sell your information.
          </div>

          {/* What We Collect */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="text-blue-400" size={20} /> What We Collect
            </h3>
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
              {[
                { data: "Account Information", desc: "Username, password (encrypted), security question" },
                { data: "Study Data", desc: "Notes, flashcards, study sessions, planner events" },
                { data: "Progress & Stats", desc: "XP, level, streaks, coins, achievements" },
                { data: "Community Activity", desc: "Messages, doubts, and chat interactions" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.data}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How We Use It */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} /> How We Use Your Data
            </h3>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Core Functionality:</strong> To power your study features and sync progress</li>
                <li>• <strong>Personalization:</strong> To customize your experience and track achievements</li>
                <li>• <strong>AI Features:</strong> To generate notes, flashcards, and study plans</li>
                <li>• <strong>Community:</strong> To enable chat and doubt-solving features</li>
              </ul>
            </div>
          </div>

          {/* What We DON'T Do */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <X className="text-red-400" size={20} /> What We DON'T Do
            </h3>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• ❌ We <strong>never sell</strong> your data to third parties</li>
                <li>• ❌ We <strong>never share</strong> your personal information with advertisers</li>
                <li>• ❌ We <strong>don't track</strong> you across other websites</li>
                <li>• ❌ We <strong>don't use</strong> your data for targeted advertising</li>
              </ul>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="text-emerald-400" size={20} /> Data Security
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your password is encrypted and never stored in plain text. All data is transmitted securely. We take reasonable measures to protect your information from unauthorized access.
            </p>
          </div>

          {/* Account Deletion */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Account Deletion:</strong> You can request to delete your account and all associated data at any time by contacting the developer.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Your privacy matters. Study with peace of mind.
          </p>
        </div>

      </div>
    </div>
  );
};

// --- NOTIFICATION COMPONENT ---
const NotificationToast: React.FC<{ message: React.ReactNode, visible: boolean, onClose: () => void }> = ({ message, visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-auto z-[200] animate-slide-up cursor-pointer" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-purple-500"></div>
        {message}
      </div>
    </div>
  );
};

// Motivation Popup
const MotivationPopup: React.FC<{ canShow: boolean }> = ({ canShow }) => {
  const [quote, setQuote] = useState('');
  const [visible, setVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!canShow || hasShown) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const q = await geminiApi.getMotivationQuote();
        setQuote(q);
        setVisible(true);
        setHasShown(true);

        setTimeout(() => {
          setVisible(false);
        }, 8000);
      } catch (e) {
        console.error('Failed to get motivation quote');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [canShow, hasShown]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 md:top-8 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-4 px-6 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-slide-up hover:bg-slate-800 transition-colors cursor-pointer group max-w-[90vw]" onClick={() => setVisible(false)}>
      <div className="p-1.5 bg-purple-500/20 rounded-full text-purple-400 shrink-0">
        <Sparkles size={16} />
      </div>
      <p className="text-white text-xs md:text-sm font-medium italic pr-2 text-center">{quote}</p>
      <button onClick={(e) => { e.stopPropagation(); setVisible(false); }} className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
};

// --- MAIN APP COMPONENT (WITH AUTH) ---
const AppContent: React.FC = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    decks,
    plannerEvents,
    studySessions,
    quests,
    challenges,
    refreshDecks,
    refreshPlanner,
    refreshSessions,
    refreshQuests,
    refreshChallenges
  } = useAuth();

  // --- LOCAL STATE ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(true); // Show on first render (login)
  const [isMusicExpanded, setIsMusicExpanded] = useState(false); // Hide timer when music player is fullscreen
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Track if music is currently playing

  // Login form state
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // Security question state for registration
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  // Forgot password state
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotSecurityQuestion, setForgotSecurityQuestion] = useState('');
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotStep, setForgotStep] = useState<'username' | 'answer'>('username');
  // Ban state
  const [isBanned, setIsBanned] = useState(false);
  const [banExpiry, setBanExpiry] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const SECURITY_QUESTIONS = [
    "What is your pet's name?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What was your childhood nickname?"
  ];

  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState<{ content: React.ReactNode, visible: boolean }>({ content: null, visible: false });
  const notificationTimeoutRef = useRef<any>(null);

  // --- TIMER STATE ---
  const [timer, setTimer] = useState<TimerState>({
    isActive: false, mode: 'FOCUS', timeLeft: 25 * 60, durationFocus: 25, durationBreak: 5
  });

  const [selectedProfileUser, setSelectedProfileUser] = useState<number | undefined>();
  const [selectedChatUser, setSelectedChatUser] = useState<number | undefined>();
  const [pendingRequestCount, setPendingRequestCount] = useState<number>(0);
  const [communityUnreadCount, setCommunityUnreadCount] = useState<number>(0);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  // Profile Card Modal state - opens when clicking a username anywhere in the app
  const [profileCardUserId, setProfileCardUserId] = useState<number | undefined>();

  // Fetch pending request count for badge
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPendingCount = async () => {
        try {
          const count = await connectionApi.getPendingRequestCount();
          setPendingRequestCount(count);
        } catch (err) {
          console.error('Failed to fetch pending request count:', err);
        }
      };
      fetchPendingCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch unread message count for badge (live notifications)
  useEffect(() => {
    if (isAuthenticated && currentView !== AppView.CHAT) {
      const fetchUnreadCount = async () => {
        try {
          const count = await chatApi.getUnreadCount();
          setChatUnreadCount(count);
        } catch (err) {
          console.error('Failed to fetch unread message count:', err);
        }
      };
      fetchUnreadCount();
      // Refresh every 15 seconds for faster notification
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentView]);

  const showNotification = (content: React.ReactNode) => {
    if (isPanicMode) return;

    setNotification({ content, visible: true });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: any;
    if (timer.isActive && timer.timeLeft > 0) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.isActive && timer.timeLeft === 0) {
      if (timer.mode === 'FOCUS') {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.play().catch(() => { });
        setTimer(prev => ({ ...prev, mode: 'BREAK', timeLeft: prev.durationBreak * 60, isActive: true }));

        if (!isPanicMode && user) {
          const xpEarned = Math.floor(timer.durationFocus);
          const coinsEarned = Math.floor(timer.durationFocus / 2);
          handleAddRewards(xpEarned, coinsEarned);
          handleUpdateQuest('FOCUS');
          handleUpdateChallengeProgress('FOCUS_MARATHON', timer.durationFocus);

          // Track session
          handleTrackSession('Focus Session', 'FOCUS', 0, timer.durationFocus * 60);

          showNotification(
            <div className="flex flex-col">
              <span className="font-bold text-white">Focus Session Complete!</span>
              <span className="text-sm text-slate-400">+{xpEarned} XP Earned. Take a break.</span>
            </div>
          );
        }
      } else {
        if (!isPanicMode) {
          showNotification(
            <div className="flex flex-col">
              <span className="font-bold text-white">Break Over!</span>
              <span className="text-sm text-slate-400">Time to get back to work.</span>
            </div>
          );
        }
        setTimer(prev => ({ ...prev, mode: 'FOCUS', timeLeft: prev.durationFocus * 60, isActive: false }));
      }
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.timeLeft, isPanicMode, user]);

  // --- AUTH HANDLERS ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    try {
      if (loginMode === 'login') {
        await login(loginUsername, loginPassword);
      } else {
        // Validate security question for registration
        if (!selectedSecurityQuestion || !securityAnswer.trim()) {
          setAuthError('Please select a security question and provide an answer');
          setIsAuthLoading(false);
          return;
        }
        await register(loginUsername, loginPassword, selectedSecurityQuestion, securityAnswer);
      }
      setLoginUsername('');
      setLoginPassword('');
      setSelectedSecurityQuestion('');
      setSecurityAnswer('');
    } catch (e: any) {
      // Check if user is banned
      const errorMsg = e.message || '';
      if (errorMsg.startsWith('BANNED|')) {
        const parts = errorMsg.split('|');
        setIsBanned(true);
        setBanExpiry(parts[1] === 'PERMANENT' ? null : parts[1]);
        setBanReason(parts[2] || 'No reason provided');
      } else {
        setAuthError(loginMode === 'login' ? 'Invalid username or password' : (errorMsg || 'Username already taken'));
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Forgot password handlers
  const handleForgotFetchQuestion = async () => {
    if (!forgotUsername.trim()) {
      setAuthError('Please enter your username');
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const question = await authApi.getSecurityQuestion(forgotUsername);
      setForgotSecurityQuestion(question);
      setForgotStep('answer');
    } catch (e: any) {
      setAuthError('User not found or no security question set');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleForgotResetPassword = async () => {
    if (!forgotSecurityAnswer.trim()) {
      setAuthError('Please enter your security answer');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await authApi.forgotPassword(forgotUsername, forgotSecurityAnswer, forgotNewPassword);
      setForgotSuccess('Password reset successfully! You can now login.');
      // Reset state after short delay
      setTimeout(() => {
        setLoginMode('login');
        setForgotUsername('');
        setForgotSecurityQuestion('');
        setForgotSecurityAnswer('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSuccess('');
        setForgotStep('username');
      }, 2000);
    } catch (e: any) {
      setAuthError(e.message || 'Incorrect security answer');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleForgotCancel = () => {
    setLoginMode('login');
    setForgotUsername('');
    setForgotSecurityQuestion('');
    setForgotSecurityAnswer('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotSuccess('');
    setForgotStep('username');
    setAuthError('');
  };

  const handleLogout = () => {
    logout();
    setCurrentView(AppView.DASHBOARD);
    setIsPanicMode(false);
    // Reset scroll position so login screen shows at top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  // --- API HANDLERS ---
  const handleAddRewards = async (xp: number, coins: number) => {
    if (!user || isPanicMode) return;

    try {
      const oldLevel = user.level;
      const response = await userApi.addRewards(xp, coins);
      updateUser(response);

      if (response.level > oldLevel) {
        showNotification(
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={20} /></div>
            <div>
              <span className="block font-bold text-white">LEVEL UP! {oldLevel} ➜ {response.level}</span>
              <span className="text-sm text-slate-400">Keep up the great work!</span>
            </div>
          </div>
        );
      }
    } catch (e) {
      console.error('Failed to add rewards:', e);
    }
  };

  const handleUpdateQuest = async (type: string) => {
    if (!user || isPanicMode) return;

    try {
      const result = await userApi.updateQuestProgress(type);
      refreshQuests(); // Always refresh to show progress updates

      if (result?.completed) {
        refreshUser();
        // Show quest completion notification
        showNotification(
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <div className="font-bold text-emerald-400">Quest Complete!</div>
              <div className="text-sm text-slate-300">{result.label}</div>
              <div className="text-xs text-slate-400 flex gap-2 mt-1">
                <span className="text-purple-400">+{result.xpReward} XP</span>
                <span className="text-yellow-400">+{result.coinReward} Coins</span>
              </div>
            </div>
          </div>
        );
      }
    } catch (e) {
      console.error('Failed to update quest:', e);
    }
  };

  const handleUpdateChallengeProgress = async (type: string, value: number = 1) => {
    try {
      await userApi.updateChallengeProgress(type, value);
      refreshChallenges();
      refreshUser();
    } catch (e) {
      console.error('Failed to update challenge:', e);
    }
  };

  const handleTrackSession = async (subject: string, type: 'FOCUS' | 'QUIZ' | 'FLASHCARD' | 'MEMORY', score: number, duration: number) => {
    try {
      await sessionApi.trackSession({
        duration,
        activityType: type,
        subject,
        score,
        maxScore: 100
      });
      refreshSessions();

      // Check for quiz challenge
      if (type === 'QUIZ' && score === 100) {
        handleUpdateChallengeProgress('QUIZ_STREAK');
      }
    } catch (e) {
      console.error('Failed to track session:', e);
    }
  };

  const handleSaveDeck = async (newDeck: Deck) => {
    try {
      console.log('Creating deck:', newDeck.topic, newDeck.cards.length, 'cards');
      const response = await deckApi.createDeck({
        topic: newDeck.topic,
        cards: newDeck.cards.map(c => ({ front: c.front, back: c.back }))
      });
      console.log('Deck created successfully:', response);
      await refreshDecks();
      console.log('Decks refreshed, total:', decks.length);
      handleUpdateQuest('REVIEW');
    } catch (e) {
      console.error('Failed to save deck:', e);
      throw e; // Re-throw so SmartNotes can catch it
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await deckApi.deleteDeck(id);
      refreshDecks();
    } catch (e) {
      console.error('Failed to delete deck:', e);
    }
  };

  const handleAddPlannerEvent = async (event: PlannerEvent) => {
    try {
      await plannerApi.createEvent({
        title: event.title,
        day: event.day,
        time: event.time,
        subject: event.subject
      });
      refreshPlanner();
      handleAddRewards(2, 0);
      handleUpdateQuest('PLAN');
    } catch (e) {
      console.error('Failed to add event:', e);
    }
  };

  const handleDeletePlannerEvent = async (id: string) => {
    try {
      await plannerApi.deleteEvent(id);
      refreshPlanner();
    } catch (e) {
      console.error('Failed to delete event:', e);
    }
  };

  const handleTogglePlannerEvent = async (id: string) => {
    try {
      await plannerApi.toggleEvent(id);
      refreshPlanner();
      refreshUser();
    } catch (e) {
      console.error('Failed to toggle event:', e);
    }
  };

  const handleBuyItem = async (item: ShopItem) => {
    if (!user || user.coins < item.cost) {
      showNotification(<span className="text-red-400 font-bold">Not enough coins!</span>);
      return;
    }

    try {
      await userApi.purchaseItem({
        itemId: item.id,
        cost: item.cost,
        itemType: item.type,
        itemValue: item.value
      });
      refreshUser();
      showNotification(
        <div className="flex flex-col">
          <span className="font-bold text-white">Purchase Successful!</span>
          <span className="text-sm text-slate-400">You bought {item.name}</span>
        </div>
      );
    } catch (e) {
      console.error('Failed to buy item:', e);
    }
  };

  const handleEquipItem = async (item: ShopItem) => {
    try {
      await userApi.equipItem({
        itemType: item.type,
        itemValue: item.type === 'BORDER' || item.type === 'BANNER' || item.type === 'THEME' || item.type === 'BACKGROUND' ? item.id : item.value
      });
      refreshUser();
    } catch (e) {
      console.error('Failed to equip item:', e);
    }
  };

  // Handle bundle purchase - buys all items in bundle at discounted price
  const handleBuyBundle = async (bundle: BundlePack) => {
    if (!user || user.coins < bundle.discountedPrice) {
      showNotification(<span className="text-red-400 font-bold">Not enough coins for this bundle!</span>);
      return;
    }

    try {
      // Buy each item in the bundle that isn't already owned
      for (const itemId of bundle.items) {
        if (!user.unlockedItems.includes(itemId)) {
          const item = getItemById(itemId);
          if (item) {
            await userApi.purchaseItem({
              itemId: item.id,
              cost: 0, // Bundle items are "free" - total cost is deducted via addRewards
              itemType: item.type,
              itemValue: item.value
            });
          }
        }
      }
      // Deduct bundle price using negative coins
      await userApi.addRewards(0, -bundle.discountedPrice);
      refreshUser();
      showNotification(
        <div className="flex flex-col">
          <span className="font-bold text-white">Bundle Purchased! 🎉</span>
          <span className="text-sm text-slate-400">You got {bundle.items.length} items from {bundle.name}</span>
        </div>
      );
    } catch (e) {
      console.error('Failed to buy bundle:', e);
    }
  };

  const handleActivateChallenge = async (id: string) => {
    try {
      await userApi.activateChallenge(id);
      refreshChallenges();
      refreshUser();
      showNotification(
        <div className="flex items-center gap-3">
          <Swords size={20} className="text-yellow-400" />
          <div>
            <span className="block font-bold text-white">Challenge Accepted!</span>
            <span className="text-sm text-slate-400">Good luck. Don't fail!</span>
          </div>
        </div>
      );
    } catch (e) {
      showNotification(<span className="text-red-400 font-bold">Not enough coins!</span>);
    }
  };

  const handleViewChange = (view: AppView) => {
    if (!user) return;

    const reqLevel = FEATURE_LEVELS[view] || 0;
    const trialExpiry = user.activeTrials?.[view] || user.activeTrials?.[view.toString()];
    const isTrialActive = trialExpiry && trialExpiry > Date.now();

    if (user.level < reqLevel && !isTrialActive) {
      showNotification(
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-red-400" />
          <div>
            <span className="block font-bold text-white">Feature Locked!</span>
            <span className="text-sm text-slate-400">Reach Level {reqLevel} to unlock.</span>
          </div>
        </div>
      );
      return;
    }
    setCurrentView(view);
  };

  const handleEnterPanicMode = () => {
    if (!user) return;

    const reqLevel = FEATURE_LEVELS['PANIC_MODE'];
    const trialExpiry = user.activeTrials?.['PANIC_MODE'];
    const isTrialActive = trialExpiry && trialExpiry > Date.now();

    if (user.level < reqLevel && !isTrialActive) {
      showNotification(
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-red-400" />
          <div>
            <span className="block font-bold text-white">Locked: Exam Panic Mode</span>
            <span className="text-sm text-slate-400">Requires Level {reqLevel} or a Challenge Trial.</span>
          </div>
        </div>
      );
      return;
    }
    setIsPanicMode(true);
  };

  // Timer controls
  const toggleTimer = () => setTimer(prev => ({ ...prev, isActive: !prev.isActive }));
  const stopTimer = () => setTimer(prev => ({ ...prev, isActive: false, timeLeft: prev.durationFocus * 60, mode: 'FOCUS' }));
  const updateTimerSettings = (focus: number, breakTime: number) => {
    setTimer(prev => ({
      ...prev,
      durationFocus: focus,
      durationBreak: breakTime,
      timeLeft: prev.mode === 'FOCUS' ? focus * 60 : breakTime * 60
    }));
  };
  const skipBreak = () => {
    setTimer(prev => ({ ...prev, mode: 'FOCUS', timeLeft: prev.durationFocus * 60, isActive: false }));
  };
  const startTimerSession = () => {
    setTimer(prev => ({ ...prev, isActive: true, mode: 'FOCUS' }));
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Brain size={40} className="text-white" />
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // --- BAN SCREEN ---
  if (isBanned) {
    return (
      <BanScreen
        banExpiry={banExpiry}
        banReason={banReason}
        onRetry={() => {
          setIsBanned(false);
          setBanExpiry(null);
          setBanReason('');
        }}
      />
    );
  }

  // --- LOGIN/REGISTER SCREEN ---
  if (!isAuthenticated || !user) {
    // Immediately reset scroll position when login screen is rendered
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return (
      <div
        className="min-h-screen h-screen w-full max-w-full flex flex-col items-center justify-center bg-slate-950 py-4 px-4 relative overflow-x-hidden overflow-y-auto"
        ref={(el) => { if (el) el.scrollTop = 0; }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl relative z-10 animate-slide-up my-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 text-white">
              <Brain size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">Cognify</h1>
          <p className="text-center text-slate-400 mb-6">Your AI study companion.</p>

          {/* Toggle Login/Register */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setLoginMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setLoginMode('register'); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {authError}
            </div>
          )}

          {/* Login/Register Form */}
          {(loginMode === 'login' || loginMode === 'register') && (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Username"
                  autoFocus
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white pr-12 transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Security Question - Only shown during registration */}
                {loginMode === 'register' && (
                  <>
                    <select
                      value={selectedSecurityQuestion}
                      onChange={(e) => setSelectedSecurityQuestion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Select a security question...</option>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="Your answer (for password recovery)"
                    />
                    <p className="text-xs text-slate-500 -mt-2">⚠️ This cannot be changed later. Remember your answer!</p>

                    {/* Terms of Service Agreement Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                      <span className="text-sm text-slate-400 leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
                        >
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacy(true)}
                          className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  </>
                )}

                <button
                  type="submit"
                  disabled={!loginUsername.trim() || !loginPassword.trim() || isAuthLoading || (loginMode === 'register' && (!selectedSecurityQuestion || !securityAnswer.trim() || !agreeToTerms))}
                  className="w-full py-3.5 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAuthLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
                  ) : (
                    loginMode === 'login' ? 'Login' : 'Create Account'
                  )}
                </button>

                {/* Forgot Password Link - Only shown during login */}
                {loginMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setLoginMode('forgot'); setAuthError(''); }}
                    className="w-full text-center text-amber-400 hover:text-amber-300 text-sm mt-2 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </form>

              <p className="text-center text-slate-500 text-xs mt-6">
                {loginMode === 'login'
                  ? "Don't have an account? Click Register above."
                  : "Already have an account? Click Login above."}
              </p>
            </>
          )}

          {/* Forgot Password Form */}
          {loginMode === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-amber-400">Reset Password</h3>
                <p className="text-sm text-slate-400">Use your security question to reset</p>
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 'username' ? (
                <>
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter your username"
                    autoFocus
                  />
                  <button
                    onClick={handleForgotFetchQuestion}
                    disabled={!forgotUsername.trim() || isAuthLoading}
                    className="w-full py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
                    ) : (
                      'Get Security Question'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Your Security Question:</p>
                    <p className="text-amber-400 font-medium">{forgotSecurityQuestion}</p>
                  </div>
                  <input
                    type="text"
                    value={forgotSecurityAnswer}
                    onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Your answer"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white pr-12 transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="New password (min 6 chars)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    onClick={handleForgotResetPassword}
                    disabled={!forgotSecurityAnswer.trim() || !forgotNewPassword || !forgotConfirmPassword || isAuthLoading}
                    className="w-full py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </>
              )}

              <button
                onClick={handleForgotCancel}
                className="w-full text-center text-slate-400 hover:text-white text-sm mt-2 transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Terms and Privacy modals - also rendered on login screen */}
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      </div >
    );
  }

  // --- PANIC MODE RENDER ---
  if (isPanicMode) {
    return (
      <div className="flex h-screen bg-red-950 text-white overflow-hidden font-sans">
        <main className="flex-1 h-full relative flex flex-col min-w-0">
          <PanicMode
            onExit={() => setIsPanicMode(false)}
            onTimerClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
            isTimerActive={timer.isActive}
            timerTimeLeft={timer.timeLeft}
          />
          <PomodoroOverlay
            timer={timer}
            onToggle={toggleTimer}
            onStop={stopTimer}
            onUpdateSettings={updateTimerSettings}
            onCompleteBreak={skipBreak}
            isOpen={isPomodoroOpen}
            onClose={() => setIsPomodoroOpen(false)}
          />
        </main>
      </div>
    );
  }

  // --- NORMAL MODE RENDER ---
  const renderContent = () => {
    switch (currentView) {
      case AppView.ORGANIZER: return <Organizer />;
      case AppView.NOTES: return <SmartNotes onAddXp={(xp) => { handleAddRewards(xp, 10); handleUpdateQuest('NOTES'); }} onSaveDeck={handleSaveDeck} userLevel={user.level} onNavigateToArcade={() => setCurrentView(AppView.ARCADE)} />;
      case AppView.ARCADE: return <StudyArcade decks={decks} onAddXp={(xp, coins) => { handleAddRewards(xp, coins); handleUpdateQuest('REVIEW'); }} onDeleteDeck={handleDeleteDeck} onOpenTimer={startTimerSession} onSessionComplete={handleTrackSession} />;
      case AppView.SHOP: return <Shop user={user} onBuy={handleBuyItem} onEquip={handleEquipItem} onBuyBundle={handleBuyBundle} onNavigateToProfile={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.PLANNER:
        const aiReqLevel = FEATURE_LEVELS['AI_PLANNER'] || 7;
        const aiTrial = user.activeTrials?.['AI_PLANNER'] && user.activeTrials['AI_PLANNER'] > Date.now();
        const isAiUnlocked = user.level >= aiReqLevel || aiTrial;
        return <Planner events={plannerEvents} studySessions={studySessions} onAddEvent={handleAddPlannerEvent} onDeleteEvent={handleDeletePlannerEvent} onToggleEvent={handleTogglePlannerEvent} userLevel={isAiUnlocked ? 99 : user.level} />;
      case AppView.CHALLENGES:
        return <Challenges
          challenges={challenges}
          user={user}
          onActivate={handleActivateChallenge}
          onAttempt={(id, type) => {
            // Navigate to the feature related to this challenge
            switch (type) {
              case 'FOCUS_MARATHON':
                setIsPomodoroOpen(true);
                break;
              case 'QUIZ_STREAK':
                setCurrentView(AppView.ARCADE);
                break;
              case 'NOTE_SPRINT':
                setCurrentView(AppView.NOTES);
                break;
              case 'DOUBT_SOLVER':
                setCurrentView(AppView.COMMUNITY);
                break;
            }
          }}
        />;
      case AppView.RESOURCES: return <ResourceHub />;
      case AppView.ANALYTICS: return <div className="h-full flex flex-col"><h2 className="text-3xl font-bold text-white mb-6">Analytics</h2><StudyAnalyzer sessions={studySessions} /></div>;
      case AppView.PROFILE:
        return <Profile
          userId={selectedProfileUser}
          onNavigateToChat={(userId) => { setSelectedChatUser(userId); setCurrentView(AppView.CHAT); }}
          onBack={() => { setSelectedProfileUser(undefined); setCurrentView(AppView.SEARCH_USERS); }}
          userUnlockedItems={user.unlockedItems}
          studySessions={studySessions}
        />;
      case AppView.SEARCH_USERS:
        return <SearchUsers onViewProfile={(userId) => setProfileCardUserId(userId)} />;
      case AppView.CONNECTIONS:
        return <Connections
          onViewProfile={(userId) => setProfileCardUserId(userId)}
          onStartChat={(userId) => { setSelectedChatUser(userId); setCurrentView(AppView.CHAT); }}
          onRequestCountChange={(count) => setPendingRequestCount(count)}
        />;
      case AppView.CHAT:
        return <Chat initialUserId={selectedChatUser} onViewProfile={(userId) => setProfileCardUserId(userId)} onUnreadChange={setChatUnreadCount} />;
      case AppView.COMMUNITY:
        return <DoubtPanel
          currentUserId={user.id}
          currentUsername={user.name}
          currentUserCoins={user.coins}
          isCurrentUserAdmin={user.isAdmin}
          onViewProfile={(userId) => setProfileCardUserId(userId)}
          onQuestUpdate={handleUpdateQuest}
          onUnreadChange={setCommunityUnreadCount}
          onUserUpdate={refreshUser}
        />;
      case AppView.SETTINGS:
        return <Settings onClose={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="flex flex-col max-w-6xl mx-auto animate-fade-in pb-12">
            {/* Welcome Header - Clean Design */}
            <div className="mb-6 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 flex-wrap">
                  Welcome back,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">{user.displayName || user.name}</span>
                  <span className="text-2xl">👋</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Stats Row - Compact Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {/* Streak Card */}
              <StreakCelebration streak={user.streak} showCelebration={showStreakCelebration} />

              {/* Today's Sessions */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-all group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{studySessions.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Today's Sessions</div>
                  </div>
                </div>
              </div>

              {/* Quests Progress */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center relative">
                    <CheckCircle2 size={18} className="text-purple-400" />
                    {quests.filter(q => q.completed).length === quests.length && quests.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{quests.filter(q => q.completed).length}<span className="text-sm text-slate-500 font-normal">/{quests.length}</span></div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Quests Done</div>
                  </div>
                </div>
              </div>

              {/* Flashcard Decks */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Layers size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{decks.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Flashcard Decks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Features - Lively Cards */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> Power Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Smart Notes AI */}
                <button
                  onClick={() => handleViewChange(AppView.NOTES)}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <BrainCircuit className="text-blue-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Smart Notes AI</h4>
                    <p className="text-sm text-slate-400">Generate study notes & flashcards from any content with AI</p>
                    <div className="mt-3 text-xs text-blue-400 font-bold flex items-center gap-1">
                      Try Now <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Study Arcade */}
                <button
                  onClick={() => handleViewChange(AppView.ARCADE)}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="text-purple-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Study Arcade</h4>
                    <p className="text-sm text-slate-400">Quiz games, memory matches & flashcard challenges</p>
                    <div className="mt-3 text-xs text-purple-400 font-bold flex items-center gap-1">
                      Play Now <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Deep Focus Mode */}
                <button
                  onClick={() => handleEnterPanicMode()}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 hover:border-indigo-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Target className="text-indigo-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Deep Focus Mode</h4>
                    <p className="text-sm text-slate-400">Intensive study with AI-generated plans & quizzes</p>
                    <div className="mt-3 text-xs text-indigo-400 font-bold flex items-center gap-1">
                      Enter Focus <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

                {/* AI Study Planner */}
                <button
                  onClick={() => handleViewChange(AppView.PLANNER)}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CalendarDays className="text-emerald-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">AI Study Planner</h4>
                    <p className="text-sm text-slate-400">Auto-generate weekly schedules based on your habits</p>
                    <div className="mt-3 text-xs text-emerald-400 font-bold flex items-center gap-1">
                      Plan Week <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Marketplace */}
                <button
                  onClick={() => handleViewChange(AppView.SHOP)}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 hover:border-amber-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Coins className="text-amber-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Marketplace</h4>
                    <p className="text-sm text-slate-400">Spend coins on avatars, themes, borders & profile customizations</p>
                    <div className="mt-3 text-xs text-amber-400 font-bold flex items-center gap-1">
                      Browse Shop <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Doubt Panel */}
                <button
                  onClick={() => handleViewChange(AppView.COMMUNITY)}
                  className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-sky-600/20 border border-cyan-500/30 hover:border-cyan-400 transition-all hover:scale-[1.02] text-left"
                >
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="text-cyan-400" size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Community Hub</h4>
                    <p className="text-sm text-slate-400">Chat with others, ask doubts & earn XP</p>
                    <div className="mt-3 text-xs text-cyan-400 font-bold flex items-center gap-1">
                      Join Discussion <ArrowRight size={14} />
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Daily Quests Widget */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-purple-400" /> Daily Quests
                {quests.length > 0 && quests.every(q => q.completed) && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium ml-2">All Done!</span>
                )}
              </h3>

              {quests.length > 0 && quests.every(q => q.completed) ? (
                /* All quests completed state */
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-1">All Quests Complete!</h4>
                  <p className="text-sm text-slate-400">Great job today! Check back tomorrow for new quests.</p>
                </div>
              ) : (
                /* Quest cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quests.map(quest => (
                    <div key={quest.id} className={`p-4 rounded-xl border transition-all ${quest.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-bold ${quest.completed ? 'text-emerald-400' : 'text-slate-200'}`}>{quest.label}</span>
                        {quest.completed && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500 flex gap-2">
                          <span className="text-purple-400 font-bold">+{quest.xpReward} XP</span>
                          <span className="text-yellow-400 font-bold">+{quest.coinReward} Coins</span>
                        </span>
                        <span className="text-xs font-mono text-slate-400">{quest.completed ? 'Done' : `${quest.progress}/${quest.target}`}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${(quest.progress / quest.target) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Analytics Preview - Condensed & Interactive */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-blue-400" /> Study Insights
                </h3>
                <button
                  onClick={() => handleViewChange(AppView.ANALYTICS)}
                  className="text-sm text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1 group"
                >
                  View Full Report
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Condensed Insights Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => handleViewChange(AppView.ANALYTICS)}>

                {/* Decorative gradient blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/15 transition-all"></div>

                {studySessions.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                      <BarChart3 size={28} className="text-slate-600" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">No Study Data Yet</h4>
                    <p className="text-slate-400 text-sm max-w-sm">
                      Complete quizzes, flashcards, or focus sessions to unlock personalized insights!
                    </p>
                  </div>
                ) : (
                  /* Stats Preview */
                  <div className="relative z-10">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {/* Total Hours */}
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div className="text-3xl font-bold text-white mb-1">
                          {(studySessions.reduce((acc, s) => acc + s.duration, 0) / 3600).toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
                          <Clock size={12} /> Hours
                        </div>
                      </div>

                      {/* Sessions */}
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div className="text-3xl font-bold text-emerald-400 mb-1">
                          {studySessions.length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
                          <Target size={12} /> Sessions
                        </div>
                      </div>

                      {/* This Week */}
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                          {studySessions.filter(s => {
                            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                            return new Date(s.timestamp).getTime() > weekAgo;
                          }).length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
                          <Zap size={12} /> This Week
                        </div>
                      </div>
                    </div>

                    {/* Mini Activity Sparkline */}
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 mb-3 font-medium">Last 7 Days</div>
                      <div className="flex items-end gap-2" style={{ height: '60px' }}>
                        {Array.from({ length: 7 }, (_, i) => {
                          const targetDate = new Date();
                          targetDate.setDate(targetDate.getDate() - (6 - i));
                          const count = studySessions.filter(s =>
                            new Date(s.timestamp).toDateString() === targetDate.toDateString()
                          ).length;
                          const maxCount = Math.max(...Array.from({ length: 7 }, (_, j) => {
                            const dt = new Date();
                            dt.setDate(dt.getDate() - (6 - j));
                            return studySessions.filter(s =>
                              new Date(s.timestamp).toDateString() === dt.toDateString()
                            ).length;
                          }), 1);
                          const maxBarHeight = 50;
                          const barHeight = count > 0 ? Math.max(12, (count / maxCount) * maxBarHeight) : 6;
                          const isToday = i === 6;
                          return (
                            <div key={i} className="flex-1 flex items-end justify-center">
                              <div
                                className={`w-3 rounded-t transition-all duration-300 ${isToday
                                  ? 'bg-gradient-to-t from-blue-600 to-cyan-400'
                                  : count > 0
                                    ? 'bg-blue-500/60'
                                    : 'bg-slate-700'
                                  }`}
                                style={{ height: `${barHeight}px` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-600 mt-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          const isToday = i === 6;
                          return <span key={i} className={isToday ? 'text-blue-400' : ''}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>;
                        })}
                      </div>
                    </div>

                    {/* Quick Insight Teaser */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                        <BrainCircuit size={16} className="text-purple-400" />
                      </div>
                      <p className="text-sm text-slate-300 flex-1">
                        <span className="text-purple-400 font-medium">AI Insights:</span> View your personalized study recommendations and peak performance times →
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-primary-500/30">
      <Sidebar
        currentView={currentView}
        onChangeView={handleViewChange}
        user={user}
        onLogout={handleLogout}
        onEnterPanic={handleEnterPanicMode}
        onShowAbout={() => setShowAbout(true)}
        onShowTerms={() => setShowTerms(true)}
        onShowPrivacy={() => setShowPrivacy(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingRequestCount={pendingRequestCount}
        communityUnreadCount={communityUnreadCount}
        chatUnreadCount={chatUnreadCount}
        onMusicClick={() => setIsMusicExpanded(true)}
        onTimerClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
        isTimerActive={timer.isActive}
        timerTimeLeft={timer.timeLeft}
        showMusicButton={user.level >= FEATURE_LEVELS['MUSIC_PLAYER'] || !!(user.activeTrials?.['MUSIC_PLAYER'] && user.activeTrials['MUSIC_PLAYER'] > Date.now())}
        isMusicPlaying={isMusicPlaying}
        studySessions={studySessions}
        onViewOwnProfile={() => setSelectedProfileUser(undefined)}
      />

      <main className="flex-1 h-full relative flex flex-col min-w-0">
        <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            {currentView === AppView.DASHBOARD ? (
              <div className="flex items-center gap-2"><Brain size={20} className="text-emerald-500" /><span className="font-bold text-white">Cognify</span></div>
            ) : (
              <span className="font-bold text-white capitalize">{currentView.toLowerCase().replace('_', ' ')}</span>
            )}
          </div>
          {currentView !== AppView.DASHBOARD && (
            <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="flex items-center gap-1 text-slate-400 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar h-full">
          {renderContent()}
        </div>

        {/* Hide Pomodoro when Music Player is expanded */}
        {!isMusicExpanded && (
          <PomodoroOverlay
            timer={timer}
            onToggle={toggleTimer}
            onStop={stopTimer}
            onUpdateSettings={updateTimerSettings}
            onCompleteBreak={skipBreak}
            isOpen={isPomodoroOpen}
            onClose={() => setIsPomodoroOpen(false)}
          />
        )}

        {/* Music Player - Locked until Level 3 OR Trial Active */}
        {!isPanicMode && (user.level >= FEATURE_LEVELS['MUSIC_PLAYER'] || (user.activeTrials?.['MUSIC_PLAYER'] && user.activeTrials['MUSIC_PLAYER'] > Date.now())) && (
          <MusicPlayer onExpandChange={setIsMusicExpanded} onPlayingChange={setIsMusicPlaying} isOpen={isMusicExpanded} />
        )}

        {/* Quick action buttons moved to Sidebar */}

        {!isPanicMode && <MotivationPopup canShow={!notification.visible} />}

        <NotificationToast
          message={notification.content}
          visible={notification.visible}
          onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
        />

        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

        {/* Profile Card Modal - opens when clicking any username in the app */}
        <ProfileCardModal
          isOpen={!!profileCardUserId}
          userId={profileCardUserId}
          currentUserId={user.id}
          onClose={() => setProfileCardUserId(undefined)}
          onViewFullProfile={() => {
            if (profileCardUserId) {
              // If viewing own profile, reset selectedProfileUser to undefined
              if (profileCardUserId === user.id) {
                setSelectedProfileUser(undefined);
              } else {
                setSelectedProfileUser(profileCardUserId);
              }
              setProfileCardUserId(undefined);
              setCurrentView(AppView.PROFILE);
            }
          }}
        />
      </main>
    </div>
  );
};

// --- ROOT APP WITH AUTH PROVIDER ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
