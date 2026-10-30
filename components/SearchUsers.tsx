/**
 * SearchUsers Component
 * 
 * Clean, professional user discovery interface with skill-based search.
 */

import React, { useState, useEffect, useRef } from 'react';
import { discoveryApi, UserSearchResult } from '../src/api/discoveryApi';
import { connectionApi } from '../src/api/connectionApi';
import { ProfileAvatar, getThemedUsernameClass } from './ProfileAvatar';
import {
    Search,
    TrendingUp,
    Trophy,
    BarChart3,
    UserPlus,
    Check,
    Clock,
    Loader2,
    Zap,
    Medal,
    Code2,
    X,
    User
} from 'lucide-react';

interface SearchUsersProps {
    onViewProfile: (userId: number) => void;
}

export const SearchUsers: React.FC<SearchUsersProps> = ({ onViewProfile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [topActive, setTopActive] = useState<UserSearchResult[]>([]);
    const [topScorers, setTopScorers] = useState<UserSearchResult[]>([]);
    const [leaderboard, setLeaderboard] = useState<UserSearchResult[]>([]);
    const [activeTab, setActiveTab] = useState<'search' | 'active' | 'scorers' | 'leaderboard'>('active');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSkillSearch, setIsSkillSearch] = useState(false); // Toggle for skill search mode
    const [skillPopupUserId, setSkillPopupUserId] = useState<number | null>(null); // Which user's skills popup is open

    useEffect(() => {
        loadDiscovery();
    }, []);

    const loadDiscovery = async () => {
        setIsLoading(true);
        try {
            const [active, scorers, leaders] = await Promise.all([
                discoveryApi.getTopActiveUsers(10),
                discoveryApi.getTopScorers(10),
                discoveryApi.getLeaderboard(20)
            ]);
            setTopActive(active);
            setTopScorers(scorers);
            setLeaderboard(leaders);
        } catch (err) {
            console.error('Failed to load discovery:', err);
        }
        setIsLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setActiveTab('search');
        try {
            let results: UserSearchResult[];
            if (isSkillSearch) {
                results = await discoveryApi.searchUsersBySkill(searchQuery);
            } else {
                results = await discoveryApi.searchUsers(searchQuery);
            }
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
        }
        setIsSearching(false);
    };

    const handleConnect = async (userId: number, index: number, list: UserSearchResult[], setList: Function) => {
        try {
            await connectionApi.sendRequest(userId);
            const updated = [...list];
            updated[index] = { ...updated[index], connectionStatus: 'PENDING_SENT' };
            setList(updated);
        } catch (err: any) {
            alert(err.message || 'Failed to send request');
        }
    };

    const tabs = [
        { id: 'active', label: 'Active', icon: TrendingUp },
        { id: 'scorers', label: 'Top Scorers', icon: Trophy },
        { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    ] as const;

    // Skills popup component - mobile friendly with wrapping
    const SkillsPopup = ({ user, onClose }: { user: UserSearchResult; onClose: () => void }) => {
        const popupRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                    onClose();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        if (!user.skills || user.skills.length === 0) return null;

        return (
            <div
                ref={popupRef}
                className="absolute right-0 top-full mt-2 z-50 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl min-w-[140px] max-w-[280px] animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</span>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className={`px-2 py-1 text-xs font-medium rounded-lg bg-slate-900/80 border border-slate-700 ${getThemedUsernameClass(user.profileTheme)}`}
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const renderUserCard = (user: UserSearchResult, index: number, list: UserSearchResult[], setList: Function) => (
        <div
            key={user.id}
            className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
            onClick={() => onViewProfile(user.id)}
        >
            <ProfileAvatar
                avatar={user.avatar}
                profilePictureUrl={user.profilePictureUrl}
                profileBorder={user.profileBorder}
                size="md"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`font-semibold truncate ${getThemedUsernameClass(user.profileTheme)}`}>
                        {user.displayName || user.username}
                    </h4>
                    <span className="px-1.5 py-0.5 bg-primary-600/20 text-primary-400 rounded text-xs font-bold shrink-0">
                        Lv.{user.level}
                    </span>
                </div>
                <p className="text-sm text-slate-500 truncate">@{user.username}</p>
                {user.college && (
                    <p className="text-xs text-slate-600 truncate mt-0.5">{user.college}</p>
                )}
            </div>

            {/* Skills icon - only show if user has skills */}
            {user.skills && user.skills.length > 0 && (
                <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setSkillPopupUserId(skillPopupUserId === user.id ? null : user.id)}
                        className={`p-2 rounded-lg transition-colors ${skillPopupUserId === user.id
                            ? 'bg-primary-600/30 text-primary-400'
                            : 'bg-slate-800 text-slate-400 hover:text-primary-400 hover:bg-slate-700'
                            }`}
                        title="View Skills"
                    >
                        <Code2 size={18} />
                    </button>
                    {skillPopupUserId === user.id && (
                        <SkillsPopup user={user} onClose={() => setSkillPopupUserId(null)} />
                    )}
                </div>
            )}

            <div onClick={e => e.stopPropagation()}>
                {user.connectionStatus === 'NONE' && (
                    <button
                        onClick={() => handleConnect(user.id, index, list, setList)}
                        className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
                    >
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">Connect</span>
                    </button>
                )}
                {user.connectionStatus === 'PENDING_SENT' && (
                    <span className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm flex items-center gap-1.5">
                        <Clock size={14} />
                        Pending
                    </span>
                )}
                {user.connectionStatus === 'CONNECTED' && (
                    <span className="px-3 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm flex items-center gap-1.5">
                        <Check size={14} />
                        Connected
                    </span>
                )}
                {user.connectionStatus === 'SELF' && (
                    <span className="px-3 py-2 bg-slate-800/50 text-slate-500 rounded-lg text-sm">
                        You
                    </span>
                )}
            </div>
        </div>
    );

    const renderLeaderboardRow = (user: UserSearchResult, index: number) => {
        const isTopThree = index < 3;
        const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

        return (
            <div
                key={user.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${isTopThree
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700'
                    : 'hover:bg-slate-900/50'
                    }`}
                onClick={() => onViewProfile(user.id)}
            >
                <div className={`w-8 text-center font-bold ${isTopThree ? rankColors[index] : 'text-slate-500'}`}>
                    {isTopThree ? (
                        <Medal size={20} className="mx-auto" />
                    ) : (
                        <span>#{index + 1}</span>
                    )}
                </div>
                <ProfileAvatar
                    avatar={user.avatar}
                    profilePictureUrl={user.profilePictureUrl}
                    profileBorder={user.profileBorder}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${getThemedUsernameClass(user.profileTheme)}`}>
                        {user.displayName || user.username}
                    </h4>
                </div>

                {/* Skills icon for leaderboard */}
                {user.skills && user.skills.length > 0 && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSkillPopupUserId(skillPopupUserId === user.id ? null : user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${skillPopupUserId === user.id
                                ? 'bg-primary-600/30 text-primary-400'
                                : isTopThree
                                    ? 'bg-slate-700 text-slate-300 hover:text-primary-400 hover:bg-slate-600'
                                    : 'bg-slate-800/50 text-slate-500 hover:text-primary-400 hover:bg-slate-800'
                                }`}
                            title="View Skills"
                        >
                            <Code2 size={14} />
                        </button>
                        {skillPopupUserId === user.id && (
                            <SkillsPopup user={user} onClose={() => setSkillPopupUserId(null)} />
                        )}
                    </div>
                )}

                <div className="flex items-center gap-1.5 text-primary-400">
                    <Zap size={14} />
                    <span className="font-bold">Lv.{user.level}</span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Discover</h1>
                <p className="text-slate-400 text-sm">Find and connect with other learners</p>
            </div>

            {/* Search Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-400">Search by:</span>
                <div className="flex bg-slate-900 rounded-lg p-1">
                    <button
                        onClick={() => setIsSkillSearch(false)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${!isSkillSearch
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <User size={14} />
                        Username
                    </button>
                    <button
                        onClick={() => setIsSkillSearch(true)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${isSkillSearch
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Code2 size={14} />
                        Skills
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        placeholder={isSkillSearch ? "Search by skill (e.g., Python, React)..." : "Search by username..."}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-6">
                {searchResults.length > 0 && (
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'search'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline">Results</span>
                        <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-600 text-white rounded-full text-xs font-bold">
                            {searchResults.length}
                        </span>
                    </button>
                )}
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {/* Search Results */}
                {activeTab === 'search' && (
                    searchResults.length > 0 ? (
                        searchResults.map((user, i) => renderUserCard(user, i, searchResults, setSearchResults))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Search for users to connect</p>
                        </div>
                    )
                )}

                {/* Most Active */}
                {activeTab === 'active' && (
                    topActive.length > 0 ? (
                        topActive.map((user, i) => renderUserCard(user, i, topActive, setTopActive))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No active users yet</p>
                        </div>
                    )
                )}

                {/* Top Scorers */}
                {activeTab === 'scorers' && (
                    topScorers.length > 0 ? (
                        topScorers.map((user, i) => renderUserCard(user, i, topScorers, setTopScorers))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No quiz scores yet</p>
                        </div>
                    )
                )}

                {/* Leaderboard */}
                {activeTab === 'leaderboard' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-primary-400" />
                            Level Leaderboard
                        </h3>
                        <div className="space-y-2">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((user, index) => renderLeaderboardRow(user, index))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No leaderboard data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchUsers;
