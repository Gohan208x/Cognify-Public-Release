/**
 * Admin Panel Component
 * Provides admin-only features for user management, banning, and data modification.
 * Only accessible by platform owner or designated administrators.
 */

import React, { useState, useEffect } from 'react';
import {
    Shield, Search, User as UserIcon, Edit3, Save, X, Ban,
    UserCheck, Crown, Trash2, AlertTriangle, Check
} from 'lucide-react';
import { adminApi, AdminUser, AdminListItem } from '../src/api/adminApi';

interface AdminPanelProps {
    isOwner: boolean;
}

const BAN_REASONS = [
    "Cheating/Exploiting",
    "Inappropriate behavior",
    "Spam/Abuse",
    "Harassment",
    "Terms of Service violation"
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOwner }) => {
    // Search state
    const [searchUsername, setSearchUsername] = useState('');
    const [searchedUser, setSearchedUser] = useState<AdminUser | null>(null);
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Edit state
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ coins: 0, xp: 0, level: 1, streak: 0 });

    // Ban state
    const [showBanModal, setShowBanModal] = useState(false);
    const [banDays, setBanDays] = useState<number | ''>('');
    const [isPermanentBan, setIsPermanentBan] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [customBanReason, setCustomBanReason] = useState('');

    // Admin management state
    const [admins, setAdmins] = useState<AdminListItem[]>([]);
    const [showAdminList, setShowAdminList] = useState(false);

    // Status
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load admins on mount (only for owner)
    useEffect(() => {
        if (isOwner) {
            loadAdmins();
        }
    }, [isOwner]);

    const loadAdmins = async () => {
        try {
            const adminList = await adminApi.getAllAdmins();
            setAdmins(adminList);
        } catch (e) {
            console.error('Failed to load admins:', e);
        }
    };

    const handleSearch = async () => {
        if (!searchUsername.trim()) return;
        setIsSearching(true);
        setSearchError('');
        setSearchedUser(null);
        try {
            const user = await adminApi.getUserByUsername(searchUsername.trim());
            setSearchedUser(user);
            setEditData({
                coins: user.coins,
                xp: user.xp,
                level: user.level,
                streak: user.streak
            });
        } catch (e: any) {
            setSearchError('User not found');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveData = async () => {
        if (!searchedUser) return;
        setIsLoading(true);
        try {
            const updated = await adminApi.updateUserData(searchedUser.username, editData);
            setSearchedUser(updated);
            setEditMode(false);
            setMessage({ type: 'success', text: 'User data updated successfully!' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Failed to update user data' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBan = async () => {
        if (!searchedUser) return;
        const reason = banReason === 'Custom' ? customBanReason : banReason;
        if (!reason) {
            setMessage({ type: 'error', text: 'Please provide a ban reason' });
            return;
        }
        setIsLoading(true);
        try {
            const days = isPermanentBan ? null : (banDays || null);
            const updated = await adminApi.banUser(searchedUser.username, days as number | null, reason);
            setSearchedUser(updated);
            setShowBanModal(false);
            setBanDays('');
            setBanReason('');
            setCustomBanReason('');
            setIsPermanentBan(false);
            setMessage({ type: 'success', text: `User banned ${isPermanentBan ? 'permanently' : `for ${days} days`}` });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Failed to ban user' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnban = async () => {
        if (!searchedUser) return;
        setIsLoading(true);
        try {
            const updated = await adminApi.unbanUser(searchedUser.username);
            setSearchedUser(updated);
            setMessage({ type: 'success', text: 'User unbanned successfully!' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Failed to unban user' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmin = async (username: string, makeAdmin: boolean) => {
        setIsLoading(true);
        try {
            await adminApi.setAdminStatus(username, makeAdmin);
            await loadAdmins();
            if (searchedUser?.username === username) {
                const updated = await adminApi.getUserByUsername(username);
                setSearchedUser(updated);
            }
            setMessage({ type: 'success', text: makeAdmin ? 'Admin added!' : 'Admin removed!' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Failed to update admin status' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Crown className="text-purple-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Admin Panel</h3>
                    <p className="text-slate-400 text-sm">
                        {isOwner ? 'Owner Mode - Full Access' : 'Admin Mode'}
                    </p>
                </div>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                    {message.text}
                </div>
            )}

            {/* User Search */}
            <div className="bg-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <Search size={14} />
                    Find User
                </h4>
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter username..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !searchUsername.trim()}
                        className="w-full md:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {searchError && <p className="text-red-400 text-sm mt-2">{searchError}</p>}
            </div>

            {/* User Details */}
            {searchedUser && (
                <div className="bg-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                                <UserIcon size={24} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">{searchedUser.username}</span>
                                    {searchedUser.isOwner && <Crown size={16} className="text-amber-400" />}
                                    {searchedUser.isAdmin && !searchedUser.isOwner && <Shield size={16} className="text-purple-400" />}
                                    {searchedUser.isBanned && <Ban size={16} className="text-red-400" />}
                                </div>
                                <span className="text-sm text-slate-400">Level {searchedUser.level}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                        >
                            {editMode ? <X size={20} /> : <Edit3 size={20} />}
                        </button>
                    </div>

                    {/* Ban Status */}
                    {searchedUser.isBanned && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 font-bold flex items-center gap-2">
                                <Ban size={16} /> BANNED
                            </p>
                            <p className="text-sm text-slate-400">
                                {searchedUser.banExpiry ? `Until: ${new Date(searchedUser.banExpiry).toLocaleString()}` : 'Permanently'}
                            </p>
                            {searchedUser.banReason && (
                                <p className="text-sm text-slate-400">Reason: {searchedUser.banReason}</p>
                            )}
                        </div>
                    )}

                    {/* User Data */}
                    <div className="grid grid-cols-2 gap-3">
                        {(['coins', 'xp', 'level', 'streak'] as const).map((field) => (
                            <div key={field} className="bg-slate-950 rounded-lg p-3">
                                <label className="text-xs text-slate-400 uppercase">{field}</label>
                                {editMode ? (
                                    <input
                                        type="number"
                                        value={editData[field]}
                                        onChange={(e) => setEditData({ ...editData, [field]: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-transparent border-b border-slate-700 text-white text-lg font-bold focus:outline-none focus:border-purple-500"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-white">{searchedUser[field]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Edit Actions */}
                    {editMode && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveData}
                                disabled={isLoading}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                        {!searchedUser.isBanned ? (
                            <button
                                onClick={() => setShowBanModal(true)}
                                disabled={searchedUser.isOwner}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Ban size={16} /> Ban User
                            </button>
                        ) : (
                            <button
                                onClick={handleUnban}
                                disabled={isLoading}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <UserCheck size={16} /> Unban User
                            </button>
                        )}

                        {isOwner && !searchedUser.isOwner && (
                            <button
                                onClick={() => handleToggleAdmin(searchedUser.username, !searchedUser.isAdmin)}
                                disabled={isLoading}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${searchedUser.isAdmin
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                                    }`}
                            >
                                <Shield size={16} />
                                {searchedUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Admin List (Owner Only) */}
            {isOwner && (
                <div className="bg-slate-800 rounded-xl p-4">
                    <button
                        onClick={() => setShowAdminList(!showAdminList)}
                        className="w-full flex items-center justify-between text-sm font-bold text-slate-400 uppercase"
                    >
                        <span className="flex items-center gap-2">
                            <Shield size={14} />
                            Manage Admins ({admins.length})
                        </span>
                        <span>{showAdminList ? '▲' : '▼'}</span>
                    </button>
                    {showAdminList && (
                        <div className="mt-3 space-y-2">
                            {admins.map((admin) => (
                                <div key={admin.id} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{admin.username}</span>
                                        {admin.isOwner && <Crown size={14} className="text-amber-400" />}
                                    </div>
                                    {!admin.isOwner && (
                                        <button
                                            onClick={() => handleToggleAdmin(admin.username, false)}
                                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Ban Modal */}
            {showBanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Ban className="text-red-400" /> Ban User
                        </h3>

                        <p className="text-slate-400 mb-4">
                            Ban <span className="text-white font-bold">{searchedUser?.username}</span>
                        </p>

                        {/* Ban Duration */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-1">Duration</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={banDays}
                                    onChange={(e) => setBanDays(e.target.value ? parseInt(e.target.value) : '')}
                                    disabled={isPermanentBan}
                                    placeholder="Days"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                                />
                                <label className="flex items-center gap-2 text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={isPermanentBan}
                                        onChange={(e) => setIsPermanentBan(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    Permanent
                                </label>
                            </div>
                        </div>

                        {/* Ban Reason */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-1">Reason</label>
                            <select
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="">Select a reason...</option>
                                {BAN_REASONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                                <option value="Custom">Custom reason</option>
                            </select>
                        </div>

                        {banReason === 'Custom' && (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={customBanReason}
                                    onChange={(e) => setCustomBanReason(e.target.value)}
                                    placeholder="Enter custom reason..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleBan}
                                disabled={isLoading || (!banDays && !isPermanentBan) || !banReason}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? 'Banning...' : 'Confirm Ban'}
                            </button>
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
