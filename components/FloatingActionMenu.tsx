/**
 * FloatingActionMenu Component
 * 
 * A collapsible floating action button menu that groups Music, Timer, and Chat
 * buttons into a single expandable menu to avoid overlapping UI elements.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    MoreHorizontal,
    X,
    Headphones,
    Timer,
    MessageCircle,
    Music,
    Brain
} from 'lucide-react';

interface FloatingActionMenuProps {
    // Music Player
    onMusicClick: () => void;
    isMusicPlaying?: boolean;

    // Timer
    onTimerClick: () => void;
    isTimerActive?: boolean;
    timerTimeLeft?: number;

    // Chat
    onChatClick: () => void;
    unreadCount?: number;

    // Visibility
    showMusic?: boolean;
    showTimer?: boolean;
    showChat?: boolean;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
    onMusicClick,
    isMusicPlaying = false,
    onTimerClick,
    isTimerActive = false,
    timerTimeLeft = 0,
    onChatClick,
    unreadCount = 0,
    showMusic = true,
    showTimer = true,
    showChat = true,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Format timer time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    // Count visible items
    const visibleItems = [showMusic, showTimer, showChat].filter(Boolean).length;

    if (visibleItems === 0) return null;

    // Calculate if any item is "active" (playing music or timer running)
    const hasActiveItem = isMusicPlaying || isTimerActive;

    return (
        <div
            ref={menuRef}
            className="fixed top-20 right-6 z-[90] flex flex-col items-end gap-3"
        >
            {/* Main Toggle Button - At Top */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group relative ${isExpanded
                    ? 'bg-slate-800 border-2 border-slate-600 rotate-0'
                    : hasActiveItem
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 animate-pulse'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600'
                    }`}
                title={isExpanded ? "Close Menu" : "Quick Actions"}
            >
                {isExpanded ? (
                    <X size={20} className="text-white" />
                ) : (
                    <div className="relative">
                        <MoreHorizontal size={20} className="text-white" />
                        {/* Activity indicator dots */}
                        {hasActiveItem && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-slate-950 animate-pulse"></span>
                        )}
                        {/* Unread indicator */}
                        {unreadCount > 0 && !hasActiveItem && (
                            <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 border border-slate-950">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                )}
                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10"></span>
            </button>

            {/* Expanded Actions - Below trigger */}
            <div className={`flex flex-col gap-2 transition-all duration-300 origin-top ${isExpanded
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                {/* Music Button */}
                {showMusic && (
                    <button
                        onClick={() => {
                            onMusicClick();
                            setIsExpanded(false);
                        }}
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-110 group relative"
                        title="Focus Audio"
                    >
                        {isMusicPlaying ? (
                            <Music size={20} className="text-white animate-pulse" />
                        ) : (
                            <Headphones size={20} className="text-white" />
                        )}
                        <span className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
                    </button>
                )}

                {/* Timer Button */}
                {showTimer && (
                    <button
                        onClick={() => {
                            onTimerClick();
                            setIsExpanded(false);
                        }}
                        className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 rounded-full shadow-lg shadow-orange-900/40 flex items-center justify-center transition-all hover:scale-110 group relative`}
                        title="Focus Timer"
                    >
                        {isTimerActive ? (
                            <div className="relative">
                                <Brain size={20} className="text-white animate-pulse" />
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold font-mono text-white bg-orange-700 px-1 py-0.5 rounded whitespace-nowrap">
                                    {formatTime(timerTimeLeft)}
                                </span>
                            </div>
                        ) : (
                            <Timer size={20} className="text-white" />
                        )}
                        <span className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
                    </button>
                )}

                {/* Chat Button */}
                {showChat && (
                    <button
                        onClick={() => {
                            onChatClick();
                            setIsExpanded(false);
                        }}
                        className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-full shadow-lg shadow-emerald-900/40 flex items-center justify-center transition-all hover:scale-110 group relative"
                        title="Messages"
                    >
                        <MessageCircle size={20} className="text-white" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-slate-950">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FloatingActionMenu;
