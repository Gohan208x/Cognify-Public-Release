import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    channelApi,
    doubtApi,
    ChannelDto,
    ChannelMessageDto,
    DoubtDto,
    DoubtSolutionDto,
    UserPresenceDto,
    PresenceListDto,
    DoubtTitleDto
} from '../src/api/doubtApi';
import { ProfileAvatar, getThemedUsernameClass } from './ProfileAvatar';
import {
    Hash,
    Send,
    Image,
    Smile,
    HelpCircle,
    MessageCircle,
    Megaphone,
    Users,
    Circle,
    ChevronDown,
    ChevronUp,
    X,
    Check,
    ThumbsUp,
    Coins,
    Award,
    Loader2,
    Filter,
    User,
    Crown,
    Star,
    Trophy,
    Sparkles,
    Menu,
    ChevronLeft,
    Trash2,
    Reply,
    Bot,
    AlertTriangle
} from 'lucide-react';
import { geminiApi } from '../src/api/geminiApi';

// ============== DOUBT TITLE DISPLAY ==============
const DOUBT_TITLES: Record<string, { name: string; emoji: string }> = {
    'helper_10': { name: 'Helpful Helper', emoji: '🌟' },
    'mentor_25': { name: 'Study Mentor', emoji: '⭐' },
    'expert_50': { name: 'Subject Expert', emoji: '🏆' },
    'guru_100': { name: 'Knowledge Guru', emoji: '👑' }
};

// ============== MARKDOWN RENDERER FOR AI SOLUTIONS ==============

// Convert LaTeX math notation to readable Unicode symbols
const processMathNotation = (text: string): string => {
    return text
        // Remove $ delimiters for inline math
        .replace(/\$([^$]+)\$/g, (_, math) => {
            return math
                // Basic operators
                .replace(/\\times/g, '×')
                .replace(/\\div/g, '÷')
                .replace(/\\pm/g, '±')
                .replace(/\\mp/g, '∓')
                .replace(/\\cdot/g, '·')
                .replace(/\\ast/g, '∗')
                // Comparison
                .replace(/\\neq/g, '≠')
                .replace(/\\leq/g, '≤')
                .replace(/\\geq/g, '≥')
                .replace(/\\approx/g, '≈')
                .replace(/\\equiv/g, '≡')
                .replace(/\\sim/g, '∼')
                // Arrows
                .replace(/\\rightarrow/g, '→')
                .replace(/\\leftarrow/g, '←')
                .replace(/\\Rightarrow/g, '⇒')
                .replace(/\\Leftarrow/g, '⇐')
                // Greek letters
                .replace(/\\alpha/g, 'α')
                .replace(/\\beta/g, 'β')
                .replace(/\\gamma/g, 'γ')
                .replace(/\\delta/g, 'δ')
                .replace(/\\epsilon/g, 'ε')
                .replace(/\\theta/g, 'θ')
                .replace(/\\lambda/g, 'λ')
                .replace(/\\mu/g, 'μ')
                .replace(/\\pi/g, 'π')
                .replace(/\\sigma/g, 'σ')
                .replace(/\\omega/g, 'ω')
                .replace(/\\phi/g, 'φ')
                .replace(/\\Delta/g, 'Δ')
                .replace(/\\Sigma/g, 'Σ')
                .replace(/\\Omega/g, 'Ω')
                // Math symbols
                .replace(/\\infty/g, '∞')
                .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
                .replace(/\\sqrt/g, '√')
                .replace(/\\sum/g, 'Σ')
                .replace(/\\prod/g, 'Π')
                .replace(/\\int/g, '∫')
                .replace(/\\partial/g, '∂')
                .replace(/\\nabla/g, '∇')
                // Fractions - simplify
                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
                // Superscripts (basic)
                .replace(/\^2/g, '²')
                .replace(/\^3/g, '³')
                .replace(/\^n/g, 'ⁿ')
                .replace(/\^\{([^}]+)\}/g, '^$1')
                // Subscripts (basic)
                .replace(/_\{([^}]+)\}/g, '₍$1₎')
                // Spaces
                .replace(/\\ /g, ' ')
                .replace(/\\,/g, ' ')
                .replace(/\\;/g, ' ')
                .replace(/\\quad/g, '  ')
                // Remove remaining backslashes but keep content
                .replace(/\\text\{([^}]+)\}/g, '$1')
                .replace(/\\[a-zA-Z]+/g, '');
        })
        // Also process display math $$...$$
        .replace(/\$\$([^$]+)\$\$/g, (_, math) => {
            return '\n' + processMathNotation('$' + math + '$') + '\n';
        });
};

const renderMarkdown = (text: string): React.ReactNode[] => {
    // First process math notation
    const processedText = processMathNotation(text);

    const elements: React.ReactNode[] = [];
    const lines = processedText.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';
    let key = 0;

    const processInlineFormatting = (line: string): React.ReactNode => {
        // Process inline code, bold, and regular text
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let partKey = 0;

        while (remaining.length > 0) {
            // Check for inline code first
            const inlineCodeMatch = remaining.match(/`([^`]+)`/);
            // Check for bold
            const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

            if (inlineCodeMatch && (!boldMatch || remaining.indexOf(inlineCodeMatch[0]) < remaining.indexOf(boldMatch[0]))) {
                const idx = remaining.indexOf(inlineCodeMatch[0]);
                if (idx > 0) parts.push(<span key={partKey++}>{remaining.slice(0, idx)}</span>);
                parts.push(
                    <code key={partKey++} className="px-1.5 py-0.5 bg-slate-700 text-purple-300 rounded text-sm font-mono">
                        {inlineCodeMatch[1]}
                    </code>
                );
                remaining = remaining.slice(idx + inlineCodeMatch[0].length);
            } else if (boldMatch) {
                const idx = remaining.indexOf(boldMatch[0]);
                if (idx > 0) parts.push(<span key={partKey++}>{remaining.slice(0, idx)}</span>);
                parts.push(<strong key={partKey++} className="text-white font-semibold">{boldMatch[1]}</strong>);
                remaining = remaining.slice(idx + boldMatch[0].length);
            } else {
                parts.push(<span key={partKey++}>{remaining}</span>);
                break;
            }
        }
        return <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block start
        if (line.startsWith('```') && !inCodeBlock) {
            inCodeBlock = true;
            codeLanguage = line.slice(3).trim() || 'code';
            codeContent = [];
            continue;
        }

        // Code block end
        if (line.startsWith('```') && inCodeBlock) {
            inCodeBlock = false;
            elements.push(
                <div key={key++} className="my-3 rounded-lg overflow-hidden">
                    <div className="bg-slate-700 px-3 py-1 text-xs text-slate-400 font-mono">{codeLanguage}</div>
                    <pre className="bg-slate-900 p-3 overflow-x-auto text-sm">
                        <code className="text-green-400 font-mono whitespace-pre">{codeContent.join('\n')}</code>
                    </pre>
                </div>
            );
            continue;
        }

        // Inside code block
        if (inCodeBlock) {
            codeContent.push(line);
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            elements.push(<div key={key++} className="h-2" />);
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            elements.push(<h4 key={key++} className="text-md font-bold text-purple-400 mt-3 mb-1">{line.slice(4)}</h4>);
            continue;
        }
        if (line.startsWith('## ')) {
            elements.push(<h3 key={key++} className="text-lg font-bold text-purple-300 mt-4 mb-2">{line.slice(3)}</h3>);
            continue;
        }
        if (line.startsWith('# ')) {
            elements.push(<h2 key={key++} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>);
            continue;
        }

        // Bullet points
        if (line.match(/^[\*\-]\s/)) {
            elements.push(
                <div key={key++} className="flex gap-2 ml-2">
                    <span className="text-purple-400">•</span>
                    <span>{processInlineFormatting(line.slice(2))}</span>
                </div>
            );
            continue;
        }

        // Numbered list
        if (line.match(/^\d+\.\s/)) {
            const match = line.match(/^(\d+)\.\s(.*)$/);
            if (match) {
                elements.push(
                    <div key={key++} className="flex gap-2 ml-2">
                        <span className="text-purple-400 font-medium">{match[1]}.</span>
                        <span>{processInlineFormatting(match[2])}</span>
                    </div>
                );
                continue;
            }
        }

        // Regular paragraph
        elements.push(<p key={key++} className="text-slate-300">{processInlineFormatting(line)}</p>);
    }

    return elements;
};

interface DoubtPanelProps {
    currentUserId: number;
    currentUsername: string;
    currentUserCoins: number;
    isCurrentUserAdmin?: boolean;
    onViewProfile?: (userId: number) => void;
    onQuestUpdate?: (type: string) => void;
    onUnreadChange?: (count: number) => void;
    onUserUpdate?: () => void;
}

export const DoubtPanel: React.FC<DoubtPanelProps> = ({
    currentUserId,
    currentUsername,
    currentUserCoins,
    isCurrentUserAdmin = false,
    onViewProfile,
    onQuestUpdate,
    onUnreadChange,
    onUserUpdate
}) => {
    // State
    const [channels, setChannels] = useState<ChannelDto[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<ChannelDto | null>(null);
    const [messages, setMessages] = useState<ChannelMessageDto[]>([]);
    const [doubts, setDoubts] = useState<DoubtDto[]>([]);
    const [presence, setPresence] = useState<PresenceListDto>({ onlineUsers: [], offlineUsers: [] });
    const [isLoading, setIsLoading] = useState(true);

    // Input state
    const [messageInput, setMessageInput] = useState('');
    const [courseFilter, setCourseFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Modal state
    const [showCreateDoubt, setShowCreateDoubt] = useState(false);
    const [showSolveDoubt, setShowSolveDoubt] = useState<DoubtDto | null>(null);
    const [showDoubtDetail, setShowDoubtDetail] = useState<DoubtDto | null>(null);
    const [showRewardModal, setShowRewardModal] = useState<{ doubt: DoubtDto; solution: DoubtSolutionDto } | null>(null);

    // Create doubt form
    const [newDoubtQuestion, setNewDoubtQuestion] = useState('');
    const [newDoubtCourse, setNewDoubtCourse] = useState('CSE');
    const [newDoubtImage, setNewDoubtImage] = useState('');

    // Solve doubt form
    const [solveExplanation, setSolveExplanation] = useState('');
    const [solveImage, setSolveImage] = useState('');

    // Reward amount
    const [rewardAmount, setRewardAmount] = useState(10);

    // Delete doubt confirmation
    const [deleteDoubtConfirm, setDeleteDoubtConfirm] = useState<DoubtDto | null>(null);

    // Ask AI feature
    const [askAiDoubt, setAskAiDoubt] = useState<DoubtDto | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Chat media/emoji
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messageImage, setMessageImage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const channelInputRef = useRef<HTMLTextAreaElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mobile responsive state
    const [showMobileChannels, setShowMobileChannels] = useState(false);
    const [showMobileMembers, setShowMobileMembers] = useState(false);

    // Unread message tracking for Announcement channel
    const [announcementUnread, setAnnouncementUnread] = useState(0);
    const LAST_SEEN_KEY = `cognify_announcement_last_seen_${currentUserId}`;

    // Reply to message state
    const [replyToMessage, setReplyToMessage] = useState<ChannelMessageDto | null>(null);

    // Common emojis for picker
    const EMOJI_LIST = [
        '😀', '😂', '😍', '🤔', '😎', '🥳', '😭', '🔥', '❤️', '👍',
        '👎', '🎉', '💯', '✨', '🙏', '💪', '🤝', '📚', '✅', '❌',
        '💡', '🧠', '📝', '🎯', '⭐', '🏆', '💰', '🪙', '🚀', '👀'
    ];

    // ============== LOAD DATA ==============

    useEffect(() => {
        loadChannels();
        loadPresence();

        // Heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
            channelApi.heartbeat(selectedChannel?.id);
        }, 30000);

        // Refresh presence every 15 seconds
        const presenceInterval = setInterval(loadPresence, 15000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(presenceInterval);
        };
    }, []);

    // Auto-scroll to bottom when messages change (same pattern as Chat.tsx)
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedChannel) {
            if (selectedChannel.type === 'DOUBT') {
                loadDoubts();
            } else {
                loadMessages();
                // Scroll to bottom after messages load
                setTimeout(() => scrollToBottom(), 100);
            }
            channelApi.heartbeat(selectedChannel.id);

            // Message polling for live updates (every 3 seconds for channels)
            if (selectedChannel.type !== 'DOUBT') {
                const messagePollingInterval = setInterval(() => {
                    loadMessages();
                }, 3000);
                return () => clearInterval(messagePollingInterval);
            } else {
                // Doubt polling (every 5 seconds)
                const doubtPollingInterval = setInterval(() => {
                    loadDoubts();
                }, 5000);
                return () => clearInterval(doubtPollingInterval);
            }
        }
    }, [selectedChannel, courseFilter, statusFilter]);

    const loadChannels = async () => {
        try {
            const data = await channelApi.getChannels();
            setChannels(data);
            if (data.length > 0) {
                // Default to Doubt channel
                const doubtChannel = data.find(c => c.type === 'DOUBT') || data[0];
                setSelectedChannel(doubtChannel);
                // Check for unread announcement messages
                checkAnnouncementUnread(data);
            }
        } catch (err) {
            console.error('Failed to load channels:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Check unread count for Announcement channel
    const checkAnnouncementUnread = useCallback(async (channelList: ChannelDto[]) => {
        const announcementChannel = channelList.find(c => c.type === 'ANNOUNCEMENT');
        if (!announcementChannel) return;

        try {
            const messages = await channelApi.getLatestMessages(announcementChannel.id);
            if (messages.length === 0) {
                setAnnouncementUnread(0);
                onUnreadChange?.(0);
                return;
            }

            const latestMessageId = Math.max(...messages.map(m => m.id));
            const lastSeenId = parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10);

            // Count messages newer than last seen
            const unreadCount = messages.filter(m => m.id > lastSeenId).length;
            setAnnouncementUnread(unreadCount);
            onUnreadChange?.(unreadCount);
        } catch (err) {
            console.error('Failed to check announcement unread:', err);
        }
    }, [LAST_SEEN_KEY, onUnreadChange]);

    // Mark announcement channel as read when viewing it
    const markAnnouncementAsRead = useCallback((msgs: ChannelMessageDto[]) => {
        if (msgs.length === 0) return;
        const latestId = Math.max(...msgs.map(m => m.id));
        localStorage.setItem(LAST_SEEN_KEY, latestId.toString());
        setAnnouncementUnread(0);
        onUnreadChange?.(0);
    }, [LAST_SEEN_KEY, onUnreadChange]);

    const loadMessages = async () => {
        if (!selectedChannel) return;
        try {
            const data = await channelApi.getLatestMessages(selectedChannel.id);
            const reversedData = data.reverse(); // Reverse to show oldest first

            // Check if there are new messages
            const hasNewMessages = reversedData.length > messages.length;
            setMessages(reversedData);

            // Scroll to bottom if new messages arrived
            if (hasNewMessages) {
                setTimeout(() => scrollToBottom(), 0);
            }

            // Mark announcement as read when viewing it
            if (selectedChannel.type === 'ANNOUNCEMENT') {
                markAnnouncementAsRead(data);
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const loadDoubts = async () => {
        try {
            const data = await doubtApi.getDoubts(
                courseFilter || undefined,
                statusFilter || undefined
            );
            setDoubts(data);
        } catch (err) {
            console.error('Failed to load doubts:', err);
        }
    };

    const loadPresence = async () => {
        try {
            const data = await channelApi.getPresence();
            setPresence(data);
        } catch (err) {
            console.error('Failed to load presence:', err);
        }
    };

    // ============== HANDLERS ==============

    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !messageImage) || !selectedChannel) return;

        try {
            const newMessage = await channelApi.postMessage(
                selectedChannel.id,
                messageInput,
                messageImage || undefined,
                replyToMessage?.id
            );
            setMessages(prev => [...prev, newMessage]);
            setMessageInput('');
            setMessageImage('');
            setReplyToMessage(null); // Clear reply state
            setShowEmojiPicker(false);
            // Scroll instantly after DOM update
            setTimeout(() => scrollToBottom(), 0);
            // Refresh user in case XP was awarded (every 10 messages in General)
            if (selectedChannel.type === 'GENERAL') {
                onUserUpdate?.();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Convert to base64 for preview and sending
        const reader = new FileReader();
        reader.onloadend = () => {
            setMessageImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleEmojiClick = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleCreateDoubt = async () => {
        if (!newDoubtQuestion.trim()) return;

        try {
            await doubtApi.createDoubt(newDoubtQuestion, newDoubtCourse, newDoubtImage || undefined);
            setShowCreateDoubt(false);
            setNewDoubtQuestion('');
            setNewDoubtImage('');
            loadDoubts();
            onQuestUpdate?.('DOUBT_ASK');
            onUserUpdate?.(); // Refresh user XP
        } catch (err) {
            console.error('Failed to create doubt:', err);
        }
    };

    const handleSubmitSolution = async () => {
        if (!solveExplanation.trim() || !showSolveDoubt) return;

        try {
            await doubtApi.submitSolution(showSolveDoubt.id, solveExplanation, solveImage || undefined);
            setShowSolveDoubt(null);
            setSolveExplanation('');
            setSolveImage('');
            loadDoubts();
            onQuestUpdate?.('DOUBT_SOLVE');
            onUserUpdate?.(); // Refresh user XP
        } catch (err) {
            console.error('Failed to submit solution:', err);
        }
    };

    const handleAcceptSolution = async () => {
        if (!showRewardModal) return;

        try {
            await doubtApi.acceptSolution(
                showRewardModal.doubt.id,
                showRewardModal.solution.id,
                rewardAmount
            );
            setShowRewardModal(null);
            setShowDoubtDetail(null);
            loadDoubts();
        } catch (err) {
            console.error('Failed to accept solution:', err);
        }
    };

    const handleLikeSolution = async (solutionId: number) => {
        try {
            await doubtApi.likeSolution(solutionId);
            // Refresh doubt detail
            if (showDoubtDetail) {
                const updated = await doubtApi.getDoubt(showDoubtDetail.id);
                setShowDoubtDetail(updated);
            }
        } catch (err) {
            console.error('Failed to like solution:', err);
        }
    };

    // Handle Ask AI - get AI solution for a doubt
    const handleAskAi = async () => {
        if (!askAiDoubt) return;

        setAiLoading(true);
        setAiError(null);
        try {
            // Get AI solution
            const aiSolution = await geminiApi.solveDoubt(
                askAiDoubt.course,
                askAiDoubt.question,
                askAiDoubt.imageUrl || undefined
            );

            // Submit as a solution with AI marker
            await doubtApi.submitSolution(askAiDoubt.id, `🤖 **AI Solution**\n\n${aiSolution}`, '');

            // Refresh doubts list
            loadDoubts();

            // Show success - close modal and open the doubt detail
            setAskAiDoubt(null);
            const updated = await doubtApi.getDoubt(askAiDoubt.id);
            setShowDoubtDetail(updated);
        } catch (err) {
            console.error('Failed to get AI solution:', err);
            setAiError('Failed to get AI solution. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    // Get date label for message separators (Today, Yesterday, or specific date)
    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateOnly = date.toDateString();
        const todayOnly = today.toDateString();
        const yesterdayOnly = yesterday.toDateString();

        if (dateOnly === todayOnly) return 'Today';
        if (dateOnly === yesterdayOnly) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Get date key for grouping (YYYY-MM-DD format)
    const getDateKey = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    // ============== RENDER CHANNEL SIDEBAR ==============

    const renderChannelSidebar = () => (
        <>
            {/* Mobile Overlay */}
            {showMobileChannels && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setShowMobileChannels(false)}
                />
            )}

            {/* Sidebar - drawer on mobile, static on desktop */}
            <div className={`
                fixed md:relative inset-y-0 left-0 z-50 md:z-auto
                w-64 bg-slate-900 border-r border-slate-800 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${showMobileChannels ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageCircle size={20} className="text-primary-400" />
                        Community
                    </h2>
                    {/* Close button on mobile */}
                    <button
                        onClick={() => setShowMobileChannels(false)}
                        className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="text-xs text-slate-500 uppercase font-bold px-2 py-2">Channels</div>
                    {channels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => {
                                setSelectedChannel(channel);
                                setShowMobileChannels(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${selectedChannel?.id === channel.id
                                ? 'bg-primary-600/20 text-primary-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{channel.emoji}</span>
                            <span className="text-sm font-medium">{channel.name}</span>
                            {channel.type === 'ANNOUNCEMENT' && announcementUnread > 0 && (
                                <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                                    {announcementUnread}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    // ============== RENDER USER PRESENCE ==============

    const renderPresenceSidebar = () => (
        <>
            {/* Mobile Overlay */}
            {showMobileMembers && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setShowMobileMembers(false)}
                />
            )}

            {/* Sidebar - drawer on mobile (from right), static on desktop */}
            <div className={`
                fixed md:relative inset-y-0 right-0 z-50 md:z-auto
                w-64 md:w-56 bg-slate-900 border-l border-slate-800 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${showMobileMembers ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                hidden md:flex
            `}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users size={16} />
                        Members
                    </h2>
                    <button
                        onClick={() => setShowMobileMembers(false)}
                        className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {/* Online Users */}
                    <div className="text-xs text-green-500 uppercase font-bold px-2 py-2 flex items-center gap-2">
                        <Circle size={8} fill="currentColor" />
                        Online — {presence.onlineUsers.length}
                    </div>
                    {presence.onlineUsers.map(user => (
                        <button
                            key={user.userId}
                            onClick={() => onViewProfile?.(user.userId)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                        >
                            <ProfileAvatar
                                avatar={user.avatar}
                                profilePictureUrl={user.profilePictureUrl}
                                profileBorder={user.profileBorder || undefined}
                                size="xs"
                            />
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm truncate ${getThemedUsernameClass(user.profileTheme || undefined)}`}>{user.displayName || user.username}</div>
                                {user.doubtTitle && DOUBT_TITLES[user.doubtTitle] && (
                                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                                        {DOUBT_TITLES[user.doubtTitle].emoji}
                                        {DOUBT_TITLES[user.doubtTitle].name}
                                    </div>
                                )}
                            </div>
                            <Circle size={8} fill="#22c55e" className="text-green-500" />
                        </button>
                    ))}

                    {/* Offline Users */}
                    <div className="text-xs text-slate-500 uppercase font-bold px-2 py-2 mt-4 flex items-center gap-2">
                        <Circle size={8} />
                        Offline — {presence.offlineUsers.length}
                    </div>
                    {presence.offlineUsers.slice(0, 10).map(user => (
                        <button
                            key={user.userId}
                            onClick={() => onViewProfile?.(user.userId)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left opacity-60"
                        >
                            <span className="text-xl grayscale">{user.avatar}</span>
                            <div className="text-sm text-slate-400 truncate">{user.displayName || user.username}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Members Drawer */}
            {showMobileMembers && (
                <div className={`
                    md:hidden fixed inset-y-0 right-0 z-50
                    w-72 bg-slate-900 border-l border-slate-800 flex flex-col
                    animate-slide-left
                `}>
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <Users size={16} />
                            Members
                        </h2>
                        <button
                            onClick={() => setShowMobileMembers(false)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {/* Online Users */}
                        <div className="text-xs text-green-500 uppercase font-bold px-2 py-2 flex items-center gap-2">
                            <Circle size={8} fill="currentColor" />
                            Online — {presence.onlineUsers.length}
                        </div>
                        {presence.onlineUsers.map(user => (
                            <button
                                key={user.userId}
                                onClick={() => { onViewProfile?.(user.userId); setShowMobileMembers(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                            >
                                <ProfileAvatar
                                    avatar={user.avatar}
                                    profilePictureUrl={user.profilePictureUrl}
                                    profileBorder={user.profileBorder || undefined}
                                    size="xs"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm truncate ${getThemedUsernameClass(user.profileTheme || undefined)}`}>{user.displayName || user.username}</div>
                                </div>
                                <Circle size={8} fill="#22c55e" className="text-green-500" />
                            </button>
                        ))}

                        {/* Offline Users */}
                        <div className="text-xs text-slate-500 uppercase font-bold px-2 py-2 mt-4 flex items-center gap-2">
                            <Circle size={8} />
                            Offline — {presence.offlineUsers.length}
                        </div>
                        {presence.offlineUsers.slice(0, 10).map(user => (
                            <button
                                key={user.userId}
                                onClick={() => { onViewProfile?.(user.userId); setShowMobileMembers(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left opacity-60"
                            >
                                <span className="text-xl grayscale">{user.avatar}</span>
                                <div className="text-sm text-slate-400 truncate">{user.displayName || user.username}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    // ============== RENDER DOUBT CHANNEL ==============

    const renderDoubtChannel = () => (
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-slate-800 flex items-center justify-between gap-2">
                {/* Mobile menu button */}
                <button
                    onClick={() => setShowMobileChannels(true)}
                    className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <span className="text-xl md:text-2xl">❓</span>
                    <div className="min-w-0">
                        <h2 className="text-base md:text-lg font-bold text-white truncate">Doubt Solving</h2>
                        <p className="text-xs text-slate-400 hidden sm:block">Ask questions and help others</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Members toggle - mobile only */}
                    <button
                        onClick={() => setShowMobileMembers(true)}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400 relative"
                    >
                        <Users size={20} />
                        {presence.onlineUsers.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-[10px] text-white rounded-full flex items-center justify-center">
                                {presence.onlineUsers.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setShowCreateDoubt(true)}
                        className="px-3 py-2 md:px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium flex items-center gap-1 md:gap-2 transition-colors text-sm md:text-base"
                    >
                        <HelpCircle size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="hidden sm:inline">Ask</span> Doubt
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-3 md:p-4 border-b border-slate-800 flex items-center gap-2 md:gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <Filter size={16} />
                    <span className="text-sm hidden sm:inline">Filter:</span>
                </div>
                <select
                    value={courseFilter}
                    onChange={e => setCourseFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-3 py-1.5 text-sm text-white min-w-0"
                >
                    <option value="">All Courses</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 md:px-3 py-1.5 text-sm text-white min-w-0"
                >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="SOLVED">Solved</option>
                </select>
            </div>

            {/* Doubts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {doubts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <HelpCircle size={48} className="mb-4 opacity-50" />
                        <p>No doubts yet. Be the first to ask!</p>
                    </div>
                ) : (
                    doubts.map(doubt => (
                        <div
                            key={doubt.id}
                            className={`bg-slate-900 border rounded-xl p-4 cursor-pointer hover:border-primary-500/50 transition-all ${doubt.status === 'SOLVED' ? 'border-green-500/30' : 'border-slate-800'
                                }`}
                            onClick={() => setShowDoubtDetail(doubt)}
                        >
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${doubt.status === 'SOLVED'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {doubt.status === 'SOLVED' ? '✅ SOLVED' : '❓ OPEN'}
                                </span>
                                <span className="text-xs text-slate-500">{formatDate(doubt.createdAt)}</span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-2 mb-3">
                                <ProfileAvatar
                                    avatar={doubt.authorAvatar}
                                    profilePictureUrl={doubt.authorProfilePictureUrl}
                                    profileBorder={doubt.authorProfileBorder}
                                    size="sm"
                                />
                                <button
                                    onClick={e => { e.stopPropagation(); onViewProfile?.(doubt.authorId); }}
                                    className={`text-sm font-medium hover:opacity-80 ${getThemedUsernameClass(doubt.authorProfileTheme)}`}
                                >
                                    {doubt.authorDisplayName || doubt.authorUsername}
                                </button>
                                <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                                    {doubt.course}
                                </span>
                            </div>

                            {/* Question */}
                            <p className="text-slate-200 mb-3 line-clamp-2">{doubt.question}</p>

                            {/* Image preview */}
                            {doubt.imageUrl && (
                                <img src={doubt.imageUrl} alt="Doubt" className="w-32 h-20 object-cover rounded-lg mb-3" />
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-3 border-t border-slate-800">
                                <span className="text-xs text-slate-500">
                                    {doubt.solutions?.length || 0} solutions
                                </span>
                                {/* Delete button for author's own OPEN doubts OR admin for any doubt */}
                                {((doubt.status === 'OPEN' && doubt.authorId === currentUserId) || isCurrentUserAdmin) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteDoubtConfirm(doubt);
                                        }}
                                        className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded"
                                        title="Delete doubt"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                {/* Ask AI button for author's own OPEN doubts */}
                                {doubt.status === 'OPEN' && doubt.authorId === currentUserId && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAskAiDoubt(doubt);
                                        }}
                                        className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 rounded-lg text-sm font-medium hover:from-purple-600/30 hover:to-blue-600/30 transition-all flex items-center gap-1 border border-purple-500/30"
                                        title="Get AI solution"
                                    >
                                        <Bot size={14} />
                                        Ask AI
                                    </button>
                                )}
                                {doubt.status === 'OPEN' && doubt.authorId !== currentUserId && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setShowSolveDoubt(doubt); }}
                                        className="ml-auto px-3 py-1 bg-primary-600/20 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-600/30 transition-colors flex items-center gap-1"
                                    >
                                        <Sparkles size={14} />
                                        Solve This
                                    </button>
                                )}
                                {doubt.status === 'SOLVED' && (
                                    doubt.coinsRewarded ? (
                                        <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                                            <Coins size={14} />
                                            {doubt.coinsRewarded} rewarded
                                        </span>
                                    ) : (
                                        <span className="ml-auto text-xs text-purple-400 flex items-center gap-1">
                                            <Bot size={14} />
                                            Solved by AI
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // ============== RENDER CHAT CHANNEL (General/Announcements) ==============

    const renderChatChannel = () => (
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-slate-800 flex items-center gap-2 md:gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={() => setShowMobileChannels(true)}
                    className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                    <Menu size={20} />
                </button>

                <span className="text-xl md:text-2xl">{selectedChannel?.emoji}</span>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-white truncate">{selectedChannel?.name}</h2>
                    <p className="text-xs text-slate-400 hidden sm:block truncate">{selectedChannel?.description}</p>
                </div>

                {/* Members toggle - mobile only */}
                <button
                    onClick={() => setShowMobileMembers(true)}
                    className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400 relative"
                >
                    <Users size={20} />
                    {presence.onlineUsers.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-[10px] text-white rounded-full flex items-center justify-center">
                            {presence.onlineUsers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const currentDateKey = getDateKey(msg.createdAt);
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const prevDateKey = prevMsg ? getDateKey(prevMsg.createdAt) : null;
                    const showDateSeparator = currentDateKey !== prevDateKey;

                    return (
                        <React.Fragment key={msg.id}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="flex items-center gap-4 py-2">
                                    <div className="flex-1 h-px bg-slate-700" />
                                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                                        {getDateLabel(msg.createdAt)}
                                    </span>
                                    <div className="flex-1 h-px bg-slate-700" />
                                </div>
                            )}
                            {/* Message */}
                            <div className="flex items-start gap-3 group">
                                <ProfileAvatar
                                    avatar={msg.authorAvatar}
                                    profilePictureUrl={msg.authorProfilePictureUrl}
                                    profileBorder={msg.authorProfileBorder}
                                    size="sm"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => onViewProfile?.(msg.authorId)}
                                            className={`text-sm font-bold hover:opacity-80 ${getThemedUsernameClass(msg.authorProfileTheme)}`}
                                        >
                                            {msg.authorDisplayName || msg.authorUsername}
                                        </button>
                                        {msg.authorDoubtTitle && DOUBT_TITLES[msg.authorDoubtTitle] && (
                                            <span className="text-xs text-yellow-400">
                                                {DOUBT_TITLES[msg.authorDoubtTitle].emoji}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                                        {/* Delete button - show for author or admin */}
                                        {(msg.authorId === currentUserId || isCurrentUserAdmin) && (
                                            <button
                                                onClick={async () => {
                                                    if (!selectedChannel) return;
                                                    try {
                                                        await channelApi.deleteMessage(selectedChannel.id, msg.id);
                                                        setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                    } catch (err) {
                                                        console.error('Failed to delete message:', err);
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400"
                                                title="Delete message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        {/* Reply button */}
                                        <button
                                            onClick={() => setReplyToMessage(msg)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary-500/20 rounded text-slate-500 hover:text-primary-400"
                                            title="Reply"
                                        >
                                            <Reply size={14} />
                                        </button>
                                    </div>
                                    {/* Reply context - show if this is a reply */}
                                    {msg.replyToContent && (
                                        <div className="mb-1 pl-2 border-l-2 border-slate-600 text-xs">
                                            <span className="text-slate-500">Replying to </span>
                                            <span className="text-primary-400 font-medium">{msg.replyToUsername}</span>
                                            <p className="text-slate-500 line-clamp-1">{msg.replyToContent}</p>
                                        </div>
                                    )}
                                    <p className="text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                                    {msg.imageUrl && (
                                        <img src={msg.imageUrl} alt="" className="mt-2 max-w-sm rounded-lg" />
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - disabled for announcements unless admin */}
            {(selectedChannel?.type !== 'ANNOUNCEMENT' || isCurrentUserAdmin) && (
                <div className="p-4 border-t border-slate-800">
                    {/* Image preview */}
                    {messageImage && (
                        <div className="mb-2 relative inline-block">
                            <img src={messageImage} alt="Preview" className="max-h-24 rounded-lg border border-slate-700" />
                            <button
                                onClick={() => setMessageImage('')}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >×</button>
                        </div>
                    )}

                    {/* Reply preview */}
                    {replyToMessage && (
                        <div className="mb-2 flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border-l-2 border-primary-500">
                            <Reply size={14} className="text-primary-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-primary-400 font-medium">
                                    Replying to {replyToMessage.authorDisplayName || replyToMessage.authorUsername}
                                </span>
                                <p className="text-xs text-slate-400 truncate">{replyToMessage.content}</p>
                            </div>
                            <button
                                onClick={() => setReplyToMessage(null)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Emoji picker popup */}
                    {showEmojiPicker && (
                        <div className="mb-2 p-3 bg-slate-900 border border-slate-700 rounded-xl max-w-[280px] md:max-w-none">
                            <div className="grid grid-cols-8 md:grid-cols-10 gap-1">
                                {EMOJI_LIST.map((emoji, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-lg md:text-xl hover:bg-slate-800 p-1 rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="flex items-end gap-1.5 md:gap-2 p-2 md:p-3 bg-slate-900/50 overflow-hidden">
                        {/* Emoji Button */}
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 md:p-2.5 hover:bg-slate-800 rounded-lg transition-colors shrink-0 ${showEmojiPicker ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                            title="Emojis"
                        >
                            <Smile size={18} className="md:w-5 md:h-5" />
                        </button>

                        {/* Input Field */}
                        <textarea
                            ref={channelInputRef}
                            value={messageInput}
                            onChange={e => {
                                setMessageInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                    if (channelInputRef.current) channelInputRef.current.style.height = 'auto';
                                }
                            }}
                            placeholder={`Message #${selectedChannel?.name}...`}
                            rows={1}
                            className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-sm resize-none overflow-hidden"
                        />

                        {/* Attachment Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 md:p-2.5 hover:bg-slate-800 rounded-lg transition-colors shrink-0 ${messageImage ? 'text-primary-400' : 'text-slate-400 hover:text-white'}`}
                            title="Attach image"
                        >
                            <Image size={18} className="md:w-5 md:h-5" />
                        </button>

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() && !messageImage}
                            className="p-2 md:p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors shrink-0"
                            title="Send message"
                        >
                            <Send size={16} className="md:w-[18px] md:h-[18px]" />
                        </button>
                    </div>
                </div>
            )}

            {selectedChannel?.type === 'ANNOUNCEMENT' && !isCurrentUserAdmin && (
                <div className="p-4 border-t border-slate-800 text-center text-slate-500 text-sm">
                    Only admins can post in announcements
                </div>
            )}
        </div>
    );

    // ============== MODALS ==============

    // Create Doubt Modal
    const renderCreateDoubtModal = () => (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <HelpCircle size={20} className="text-primary-400" />
                        Ask a Doubt
                    </h3>
                    <button onClick={() => setShowCreateDoubt(false)} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Course</label>
                        <select
                            value={newDoubtCourse}
                            onChange={e => setNewDoubtCourse(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Your Question</label>
                        <textarea
                            value={newDoubtQuestion}
                            onChange={e => setNewDoubtQuestion(e.target.value)}
                            placeholder="Describe your doubt..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white h-32 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Image URL (optional)</label>
                        <input
                            type="text"
                            value={newDoubtImage}
                            onChange={e => setNewDoubtImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
                    <button
                        onClick={() => setShowCreateDoubt(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateDoubt}
                        disabled={!newDoubtQuestion.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Post Doubt
                    </button>
                </div>
            </div>
        </div>
    );

    // Solve Doubt Modal
    const renderSolveDoubtModal = () => showSolveDoubt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-yellow-400" />
                        Solve This Doubt
                    </h3>
                    <button onClick={() => setShowSolveDoubt(null)} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-sm text-slate-400 mb-1">Question:</p>
                        <p className="text-white">{showSolveDoubt.question}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Your Explanation</label>
                        <textarea
                            value={solveExplanation}
                            onChange={e => setSolveExplanation(e.target.value)}
                            placeholder="Explain your solution..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white h-32 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Image URL (optional)</label>
                        <input
                            type="text"
                            value={solveImage}
                            onChange={e => setSolveImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
                    <button onClick={() => setShowSolveDoubt(null)} className="px-4 py-2 text-slate-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitSolution}
                        disabled={!solveExplanation.trim()}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        Submit Solution
                    </button>
                </div>
            </div>
        </div>
    );

    // Doubt Detail Modal
    const renderDoubtDetailModal = () => showDoubtDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 max-h-[85vh] flex flex-col">
                {/* Sticky Header with Close Button */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${showDoubtDetail.status === 'SOLVED'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {showDoubtDetail.status === 'SOLVED' ? '✅ Solved' : '❓ Open'}
                    </span>
                    <button onClick={() => setShowDoubtDetail(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                        <ProfileAvatar
                            avatar={showDoubtDetail.authorAvatar}
                            profilePictureUrl={showDoubtDetail.authorProfilePictureUrl}
                            profileBorder={showDoubtDetail.authorProfileBorder}
                            size="lg"
                        />
                        <div>
                            <button
                                onClick={() => onViewProfile?.(showDoubtDetail.authorId)}
                                className={`text-lg font-bold hover:opacity-80 ${getThemedUsernameClass(showDoubtDetail.authorProfileTheme)}`}
                            >
                                {showDoubtDetail.authorDisplayName || showDoubtDetail.authorUsername}
                            </button>
                            <div className="text-sm text-slate-400">
                                {showDoubtDetail.course} • {formatDate(showDoubtDetail.createdAt)}
                            </div>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-4">
                        <p className="text-white text-lg">{showDoubtDetail.question}</p>
                        {showDoubtDetail.imageUrl && (<div className="relative mt-4 group"><a href={showDoubtDetail.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-slate-900/80 hover:bg-primary-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Open in new tab"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a><img src={showDoubtDetail.imageUrl} alt="Doubt" className="max-w-full max-h-64 object-contain rounded-lg" /></div>
                        )}
                    </div>

                    {/* Solutions */}
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">
                        Solutions ({showDoubtDetail.solutions?.length || 0})
                    </h4>

                    {/* Solutions - AI solutions shown first */}
                    {[...(showDoubtDetail.solutions || [])]
                        .sort((a, b) => {
                            const aIsAi = a.explanation.startsWith('🤖 **AI Solution**');
                            const bIsAi = b.explanation.startsWith('🤖 **AI Solution**');
                            if (aIsAi && !bIsAi) return -1;
                            if (!aIsAi && bIsAi) return 1;
                            return 0;
                        })
                        .map(solution => {
                            const isAiSolution = solution.explanation.startsWith('🤖 **AI Solution**');
                            // Clean AI solution text for display
                            const displayText = isAiSolution
                                ? solution.explanation.replace('🤖 **AI Solution**\n\n', '').replace('🤖 **AI Solution**', '')
                                : solution.explanation;

                            return (
                                <div
                                    key={solution.id}
                                    className={`bg-slate-800 rounded-xl p-4 mb-3 ${solution.isAccepted
                                        ? isAiSolution
                                            ? 'border-2 border-purple-500'
                                            : 'border-2 border-green-500'
                                        : isAiSolution
                                            ? 'border border-purple-500/30'
                                            : ''
                                        }`}
                                >
                                    {/* Accepted badge */}
                                    {solution.isAccepted && (
                                        <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${isAiSolution ? 'text-purple-400' : 'text-green-400'}`}>
                                            {isAiSolution ? <Bot size={16} /> : <Check size={16} />}
                                            {isAiSolution ? 'Solved by AI' : 'Accepted Solution'}
                                        </div>
                                    )}

                                    {/* User info or AI badge */}
                                    <div className="flex items-center gap-2 mb-2">
                                        {isAiSolution ? (
                                            <>
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                                    <Bot size={16} className="text-white" />
                                                </div>
                                                <span className="text-sm font-bold text-purple-400">Cognify AI</span>
                                                <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full">AI Generated</span>
                                            </>
                                        ) : (
                                            <>
                                                <ProfileAvatar
                                                    avatar={solution.solverAvatar}
                                                    profilePictureUrl={solution.solverProfilePictureUrl}
                                                    profileBorder={solution.solverProfileBorder}
                                                    size="sm"
                                                />
                                                <button
                                                    onClick={() => onViewProfile?.(solution.solverId)}
                                                    className={`text-sm font-bold hover:opacity-80 ${getThemedUsernameClass(solution.solverProfileTheme)}`}
                                                >
                                                    {solution.solverUsername}
                                                </button>
                                                {solution.solverDoubtTitle && DOUBT_TITLES[solution.solverDoubtTitle] && (
                                                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                        {DOUBT_TITLES[solution.solverDoubtTitle].emoji}
                                                        {DOUBT_TITLES[solution.solverDoubtTitle].name}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Solution text - use markdown renderer for AI, simple for others */}
                                    <div className="text-slate-300 mb-3">
                                        {isAiSolution ? (
                                            <div className="space-y-1">
                                                {renderMarkdown(displayText)}
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap">{displayText}</div>
                                        )}
                                    </div>

                                    {solution.imageUrl && (
                                        <img src={solution.imageUrl} alt="Solution" className="max-w-full max-h-48 object-contain rounded-lg mb-3" />
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                                        {/* Like button - only for non-AI solutions */}
                                        {!isAiSolution && (
                                            <button
                                                onClick={() => handleLikeSolution(solution.id)}
                                                className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400"
                                            >
                                                <ThumbsUp size={16} />
                                                {solution.likes}
                                            </button>
                                        )}

                                        {/* Accept button for doubt author */}
                                        {showDoubtDetail.authorId === currentUserId &&
                                            showDoubtDetail.status === 'OPEN' &&
                                            !solution.isAccepted && (
                                                isAiSolution ? (
                                                    // AI solution - Mark as Solved (no coins)
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await doubtApi.acceptSolution(showDoubtDetail.id, solution.id, 0);
                                                                loadDoubts();
                                                                setShowDoubtDetail(null);
                                                            } catch (err) {
                                                                console.error('Failed to accept AI solution:', err);
                                                            }
                                                        }}
                                                        className="ml-auto px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Bot size={14} />
                                                        Mark as Solved
                                                    </button>
                                                ) : (
                                                    // Human solution - Accept & Reward
                                                    <button
                                                        onClick={() => setShowRewardModal({ doubt: showDoubtDetail, solution })}
                                                        className="ml-auto px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium"
                                                    >
                                                        Accept & Reward
                                                    </button>
                                                )
                                            )}
                                    </div>
                                </div>
                            );
                        })}

                    {/* Add Solution Button */}
                    {showDoubtDetail.status === 'OPEN' && showDoubtDetail.authorId !== currentUserId && (
                        <button
                            onClick={() => { setShowDoubtDetail(null); setShowSolveDoubt(showDoubtDetail); }}
                            className="w-full py-3 bg-primary-600/20 text-primary-400 rounded-xl font-medium hover:bg-primary-600/30 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Submit Your Solution
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Reward Modal
    const renderRewardModal = () => showRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Coins size={20} className="text-yellow-400" />
                        Reward Solver
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-slate-400">
                        How many coins would you like to give to{' '}
                        <span className="text-white font-medium">{showRewardModal.solution.solverUsername}</span>?
                    </p>
                    <div>
                        <input
                            type="range"
                            min="0"
                            max={Math.min(100, currentUserCoins)}
                            value={rewardAmount}
                            onChange={e => setRewardAmount(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-slate-400">Your coins: {currentUserCoins}</span>
                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                                <Coins size={14} />
                                {rewardAmount}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
                    <button onClick={() => setShowRewardModal(null)} className="px-4 py-2 text-slate-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleAcceptSolution}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Check size={16} />
                        Accept & Send {rewardAmount} Coins
                    </button>
                </div>
            </div>
        </div>
    );

    // ============== MAIN RENDER ==============

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary-400" />
            </div>
        );
    }

    return (
        <div className="h-full flex bg-slate-950">
            {renderChannelSidebar()}

            {selectedChannel?.type === 'DOUBT' ? renderDoubtChannel() : renderChatChannel()}

            {renderPresenceSidebar()}

            {/* Modals */}
            {showCreateDoubt && renderCreateDoubtModal()}
            {showSolveDoubt && renderSolveDoubtModal()}
            {showDoubtDetail && renderDoubtDetailModal()}
            {showRewardModal && renderRewardModal()}

            {/* Ask AI Confirmation Modal */}
            {askAiDoubt && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Ask AI</h3>
                                <p className="text-slate-400 text-sm">Get an instant AI-powered solution</p>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-4 mb-4">
                            <p className="text-slate-300 text-sm mb-2">
                                <span className="text-slate-500">Course:</span> {askAiDoubt.course}
                            </p>
                            <p className="text-white line-clamp-3">{askAiDoubt.question}</p>
                        </div>

                        {/* Error Message */}
                        {aiError && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <X size={16} className="text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-400 font-medium text-sm">Error</p>
                                    <p className="text-red-300/80 text-sm">{aiError}</p>
                                </div>
                                <button
                                    onClick={() => setAiError(null)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Image Warning */}
                        {askAiDoubt.imageUrl && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                                <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-amber-300/90 text-sm">
                                    <span className="font-medium text-amber-400">Note:</span> AI cannot read images. Only the text of your question will be analyzed.
                                </p>
                            </div>
                        )}

                        <p className="text-slate-400 text-sm mb-6">
                            AI will analyze your question and provide a detailed solution. The solution will be added to your doubt's answers.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setAskAiDoubt(null); setAiError(null); }}
                                disabled={aiLoading}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAskAi}
                                disabled={aiLoading}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        {aiError ? 'Retry' : 'Ask AI'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Doubt Confirmation Modal */}
            {deleteDoubtConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-3">Delete Doubt?</h3>
                        <p className="text-slate-400 mb-2">Are you sure you want to delete this doubt?</p>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">"{deleteDoubtConfirm.question}"</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteDoubtConfirm(null)}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await doubtApi.deleteDoubt(deleteDoubtConfirm.id);
                                        setDeleteDoubtConfirm(null);
                                        loadDoubts();
                                    } catch (err) {
                                        console.error('Failed to delete doubt:', err);
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
