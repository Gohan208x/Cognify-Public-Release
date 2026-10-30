/**
 * ProfileCardModal Component
 * 
 * A professional glassmorphism profile card modal that opens when clicking
 * the sidebar profile. Shows user info with equipped customizations.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { X, ExternalLink, Github, Linkedin, Globe, MapPin, Building2, Award, Flame, Clock, Zap, UserPlus, UserMinus, AlertTriangle, Check } from 'lucide-react';
import { profileApi, ProfileDto } from '../src/api/profileApi';
import { ProfileAvatar, getThemedUsernameClass } from './ProfileAvatar';
import { getBannerGradient } from '../src/data/profileStyles';
import { connectionApi } from '../src/api/connectionApi';
import { StudySession } from '../types';

interface ProfileCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewFullProfile: () => void;
    userId?: number; // Optional: for viewing other users' profiles
    currentUserId?: number; // Current logged-in user's ID for self-detection
    studySessions?: StudySession[]; // For calculating study hours
}

export const ProfileCardModal: React.FC<ProfileCardModalProps> = ({
    isOpen,
    onClose,
    onViewFullProfile,
    userId,
    currentUserId,
    studySessions = []
}) => {
    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected' | 'self'>('self');
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    // Calculate study hours from sessions (for own profile)
    const calculatedStudyHours = useMemo(() => {
        if (userId || studySessions.length === 0) {
            return null; // Fall back to profile.totalStudyMinutes for other users
        }
        const totalSeconds = studySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        return totalSeconds / 3600;
    }, [userId, studySessions]);

    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen, userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            let data: ProfileDto;
            // Check if viewing own profile (either no userId or userId matches currentUserId)
            const isOwnProfile = !userId || (currentUserId && userId === currentUserId);

            if (userId) {
                data = await profileApi.getProfile(userId);
                // Only check connection status if it's not own profile
                if (!isOwnProfile) {
                    try {
                        const status = await connectionApi.getConnectionStatus(userId);
                        // Map backend status to frontend values
                        // Backend returns: "NONE", "CONNECTED", "PENDING_SENT", "PENDING_RECEIVED"
                        if (status === 'CONNECTED') {
                            setConnectionStatus('connected');
                        } else if (status === 'PENDING_SENT' || status === 'PENDING_RECEIVED') {
                            setConnectionStatus('pending');
                        } else {
                            setConnectionStatus('none');
                        }
                    } catch {
                        setConnectionStatus('none');
                    }
                } else {
                    setConnectionStatus('self');
                }
            } else {
                data = await profileApi.getMyProfile();
                setConnectionStatus('self');
            }
            setProfile(data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
        setIsLoading(false);
    };

    const handleSendRequest = async () => {
        if (!userId || connectionStatus !== 'none') return;
        setIsSendingRequest(true);
        try {
            await connectionApi.sendRequest(userId);
            setConnectionStatus('pending');
        } catch (err) {
            console.error('Failed to send request:', err);
        }
        setIsSendingRequest(false);
    };

    const handleRemoveConnection = async () => {
        if (!userId || connectionStatus !== 'connected') return;
        setIsRemoving(true);
        try {
            await connectionApi.removeConnectionByUserId(userId);
            setConnectionStatus('none');
            setShowRemoveConfirm(false);
        } catch (err) {
            console.error('Failed to remove connection:', err);
        }
        setIsRemoving(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Blurry Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />

            {/* Card Container */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in bg-slate-900"
            >
                {/* Banner - Custom URL or Gradient Overlay */}
                {profile?.profileBanner?.startsWith('http') ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-50"
                        style={{ backgroundImage: `url(${profile.profileBanner})` }}
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getBannerGradient(profile?.profileBanner)} opacity-20`} />
                )}

                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Main Content */}
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all z-10 backdrop-blur-sm"
                    >
                        <X size={16} />
                    </button>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : profile ? (
                        <div className="p-5">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center text-center mb-4">
                                <ProfileAvatar
                                    avatar={profile.avatar || '🎓'}
                                    profilePictureUrl={profile.profilePictureUrl}
                                    profileBorder={profile.profileBorder}
                                    size="xl"
                                />

                                {/* Username */}
                                <h2 className={`text-xl font-bold mt-3 ${getThemedUsernameClass(profile.profileTheme)}`}>
                                    {profile.displayName || profile.username}
                                </h2>
                                <p className="text-white/70 text-sm">@{profile.username}</p>

                                {/* Title Badge */}
                                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                                    <Award size={12} className="text-yellow-400" />
                                    <span className="text-yellow-400 text-xs font-medium">{profile.title || 'Newcomer'}</span>
                                </div>
                            </div>

                            {/* Stats Row - Horizontal Layout */}
                            <div className="flex justify-center gap-6 py-4 mb-4 border-y border-slate-700/50">
                                {/* Level */}
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                        <Zap size={14} className="text-blue-400" />
                                        <span className="text-xl font-bold text-white">{profile.level}</span>
                                    </div>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wide">Level</span>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-slate-700/50" />

                                {/* Streak */}
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                        <Flame size={14} className="text-orange-400" />
                                        <span className="text-xl font-bold text-white">{profile.highestStreak || profile.streak || 0}</span>
                                    </div>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wide">Streak</span>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-slate-700/50" />

                                {/* Study Hours */}
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-0.5">
                                        <Clock size={14} className="text-purple-400" />
                                        <span className="text-xl font-bold text-white">{(calculatedStudyHours !== null ? calculatedStudyHours : ((profile.totalStudyMinutes || 0) / 60)).toFixed(1)}h</span>
                                    </div>
                                    <span className="text-[10px] text-white/70 uppercase tracking-wide">Study</span>
                                </div>
                            </div>

                            {/* Info Pills */}
                            {(profile.college || (profile.country && profile.countryVisible)) && (
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    {profile.college && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full text-xs text-slate-300 border border-slate-700/40">
                                            <Building2 size={12} className="text-blue-400" />
                                            <span className="truncate max-w-[140px]">{profile.college}</span>
                                        </div>
                                    )}
                                    {profile.country && profile.countryVisible && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full text-xs text-slate-300 border border-slate-700/40">
                                            <MapPin size={12} className="text-emerald-400" />
                                            <span>{profile.country}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Social Links */}
                            {(profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) && (
                                <div className="flex justify-center gap-2 mb-4">
                                    {profile.githubUrl && (
                                        <a
                                            href={profile.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-800/70 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700/50"
                                            title="GitHub"
                                        >
                                            <Github size={16} />
                                        </a>
                                    )}
                                    {profile.linkedinUrl && (
                                        <a
                                            href={profile.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-800/70 hover:bg-blue-600/30 rounded-lg text-slate-400 hover:text-blue-400 transition-all border border-slate-700/50"
                                            title="LinkedIn"
                                        >
                                            <Linkedin size={16} />
                                        </a>
                                    )}
                                    {profile.portfolioUrl && (
                                        <a
                                            href={profile.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-800/70 hover:bg-emerald-600/30 rounded-lg text-slate-400 hover:text-emerald-400 transition-all border border-slate-700/50"
                                            title="Portfolio"
                                        >
                                            <Globe size={16} />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {/* Connection Button - only for other users */}
                                {connectionStatus !== 'self' && (
                                    connectionStatus === 'connected' ? (
                                        // Remove Connection Button for connected users
                                        <button
                                            onClick={() => setShowRemoveConfirm(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl transition-all bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/30"
                                        >
                                            <UserMinus size={16} />
                                            Remove Connection
                                        </button>
                                    ) : connectionStatus === 'pending' ? (
                                        // Pending/Request Sent Button
                                        <button
                                            disabled
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl transition-all bg-slate-700/50 text-slate-400 border border-slate-600 cursor-not-allowed"
                                        >
                                            <Check size={16} />
                                            Request Sent
                                        </button>
                                    ) : (
                                        // Connect Button for non-connected users  
                                        <button
                                            onClick={handleSendRequest}
                                            disabled={isSendingRequest}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                                        >
                                            <UserPlus size={16} />
                                            {isSendingRequest ? 'Sending...' : 'Connect'}
                                        </button>
                                    )
                                )}

                                {/* View Profile Button */}
                                <button
                                    onClick={onViewFullProfile}
                                    className={`flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl transition-all shadow-lg ${connectionStatus === 'self'
                                        ? 'flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                                        : 'px-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    <ExternalLink size={16} />
                                    {connectionStatus === 'self' ? 'View Full Profile' : 'Profile'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            Failed to load profile
                        </div>
                    )}
                </div>
            </div>

            {/* Remove Connection Confirmation Dialog */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowRemoveConfirm(false)} />
                    <div className="relative bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Remove Connection</h3>
                        </div>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to remove <span className="font-semibold text-white">{profile?.displayName || profile?.username}</span> from your connections?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRemoveConfirm(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveConnection}
                                disabled={isRemoving}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors font-medium disabled:opacity-50"
                            >
                                {isRemoving ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCardModal;
