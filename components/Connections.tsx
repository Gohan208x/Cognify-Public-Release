/**
 * Connections Component
 * 
 * Clean, professional connections management interface.
 */

import React, { useState, useEffect } from 'react';
import { connectionApi, ConnectionDto, BlockedUserDto } from '../src/api/connectionApi';
import { ProfileAvatar, getThemedUsernameClass } from './ProfileAvatar';
import {
    Users,
    UserPlus,
    Send,
    Shield,
    MessageCircle,
    X,
    Check,
    Clock,
    Search,
    Loader2,
    UserX,
    AlertTriangle
} from 'lucide-react';

interface ConnectionsProps {
    onViewProfile: (userId: number) => void;
    onStartChat: (userId: number) => void;
    onRequestCountChange?: (count: number) => void;
}

export const Connections: React.FC<ConnectionsProps> = ({ onViewProfile, onStartChat, onRequestCountChange }) => {
    const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'sent' | 'blocked'>('connections');
    const [connections, setConnections] = useState<ConnectionDto[]>([]);
    const [requests, setRequests] = useState<ConnectionDto[]>([]);
    const [sentRequests, setSentRequests] = useState<ConnectionDto[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<BlockedUserDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [conns, reqs, sent, blocked] = await Promise.all([
                connectionApi.getConnections(),
                connectionApi.getPendingRequests(),
                connectionApi.getSentRequests(),
                connectionApi.getBlockedUsers()
            ]);
            setConnections(conns);
            setRequests(reqs);
            setSentRequests(sent);
            setBlockedUsers(blocked);
            onRequestCountChange?.(reqs.length);
        } catch (err) {
            console.error('Failed to load connections:', err);
        }
        setIsLoading(false);
    };

    const handleAcceptRequest = async (connectionId: number) => {
        try {
            const accepted = await connectionApi.acceptRequest(connectionId);
            const newRequests = requests.filter(r => r.id !== connectionId);
            setRequests(newRequests);
            setConnections(prev => [...prev, accepted]);
            onRequestCountChange?.(newRequests.length);
        } catch (err) {
            console.error('Failed to accept request:', err);
        }
    };

    const handleDeclineRequest = async (connectionId: number) => {
        try {
            await connectionApi.declineRequest(connectionId);
            const newRequests = requests.filter(r => r.id !== connectionId);
            setRequests(newRequests);
            onRequestCountChange?.(newRequests.length);
        } catch (err) {
            console.error('Failed to decline request:', err);
        }
    };

    const handleCancelRequest = async (connectionId: number) => {
        try {
            await connectionApi.declineRequest(connectionId);
            setSentRequests(prev => prev.filter(r => r.id !== connectionId));
        } catch (err) {
            console.error('Failed to cancel request:', err);
        }
    };

    const handleRemoveConnection = async (connectionId: number, username: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Connection',
            message: `Are you sure you want to remove ${username} from your connections?`,
            onConfirm: async () => {
                try {
                    await connectionApi.removeConnection(connectionId);
                    setConnections(prev => prev.filter(c => c.id !== connectionId));
                } catch (err: any) {
                    console.error('Failed to remove connection:', err);
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleUnblock = async (userId: number, username: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Unblock User',
            message: `Are you sure you want to unblock ${username}?`,
            onConfirm: async () => {
                try {
                    await connectionApi.unblockUser(userId);
                    setBlockedUsers(prev => prev.filter(b => b.userId !== userId));
                } catch (err) {
                    console.error('Failed to unblock user:', err);
                }
                setConfirmDialog(null);
            }
        });
    };

    const filterBySearch = (items: any[], key: string = 'username') => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item[key]?.toLowerCase().includes(query) ||
            item.displayName?.toLowerCase().includes(query)
        );
    };

    const tabs = [
        { id: 'connections', label: 'Friends', icon: Users, count: connections.length },
        { id: 'requests', label: 'Requests', icon: UserPlus, count: requests.length, highlight: requests.length > 0 },
        { id: 'sent', label: 'Sent', icon: Send, count: sentRequests.length },
        { id: 'blocked', label: 'Blocked', icon: Shield, count: blockedUsers.length },
    ] as const;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Confirmation Dialog */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setConfirmDialog(null)} />
                    <div className="relative bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">{confirmDialog.title}</h3>
                        </div>
                        <p className="text-slate-300 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors font-medium"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Connections</h1>
                <p className="text-slate-400 text-sm">Manage your friends and connection requests</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-6">
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
                        {tab.count > 0 && (
                            <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold ${tab.highlight ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {/* Connections Tab */}
                {activeTab === 'connections' && (
                    filterBySearch(connections).length > 0 ? (
                        filterBySearch(connections).map(conn => (
                            <div key={conn.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => onViewProfile(conn.userId)}
                                >
                                    <ProfileAvatar
                                        avatar={conn.avatar}
                                        profilePictureUrl={conn.profilePictureUrl}
                                        profileBorder={conn.profileBorder}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <h4 className={`font-semibold truncate ${getThemedUsernameClass(conn.profileTheme)}`}>
                                            {conn.displayName || conn.username}
                                        </h4>
                                        <p className="text-sm text-slate-500">@{conn.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onStartChat(conn.userId)}
                                        className="p-2.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors"
                                        title="Message"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveConnection(conn.id, conn.displayName || conn.username)}
                                        className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <UserX size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No connections yet</p>
                            <p className="text-sm">Discover users and send connection requests!</p>
                        </div>
                    )
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => onViewProfile(req.userId)}
                                >
                                    <ProfileAvatar
                                        avatar={req.avatar}
                                        profilePictureUrl={req.profilePictureUrl}
                                        profileBorder={req.profileBorder}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <h4 className={`font-semibold truncate ${getThemedUsernameClass(req.profileTheme)}`}>
                                            {req.displayName || req.username}
                                        </h4>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAcceptRequest(req.id)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                        <Check size={16} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDeclineRequest(req.id)}
                                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pending requests</p>
                        </div>
                    )
                )}

                {/* Sent Tab */}
                {activeTab === 'sent' && (
                    sentRequests.length > 0 ? (
                        sentRequests.map(req => (
                            <div key={req.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => onViewProfile(req.userId)}
                                >
                                    <ProfileAvatar
                                        avatar={req.avatar}
                                        profilePictureUrl={req.profilePictureUrl}
                                        profileBorder={req.profileBorder}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <h4 className={`font-semibold truncate ${getThemedUsernameClass(req.profileTheme)}`}>
                                            {req.displayName || req.username}
                                        </h4>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Send size={12} />
                                            Sent {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCancelRequest(req.id)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pending sent requests</p>
                        </div>
                    )
                )}

                {/* Blocked Tab */}
                {activeTab === 'blocked' && (
                    filterBySearch(blockedUsers).length > 0 ? (
                        filterBySearch(blockedUsers).map(blocked => (
                            <div key={blocked.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl opacity-75">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                        <Shield size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-slate-400 truncate">
                                            {blocked.displayName || blocked.username}
                                        </h4>
                                        <p className="text-sm text-slate-600">
                                            Blocked {new Date(blocked.blockedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnblock(blocked.userId, blocked.displayName || blocked.username)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-colors"
                                >
                                    Unblock
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No blocked users</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Connections;
