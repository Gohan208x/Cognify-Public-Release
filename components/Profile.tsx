/**
 * Profile Component
 * 
 * User profile view with editable fields, skills, external links,
 * and profile design customization (avatar, title, border, banner, theme, background).
 * 
 * Features:
 * - Small edit icon button
 * - Tabbed editing (Info / Design)
 * - Smart change detection with floating save/discard bar
 */

import React, { useState, useEffect, useMemo } from 'react';
import { profileApi, ProfileDto, ProfileUpdateRequest } from '../src/api/profileApi';
import { StudySession } from '../types';
import { connectionApi } from '../src/api/connectionApi';
import { BadgesDisplay, calculateEarnedBadges } from './Badges';
import { Edit3, X, Check, Palette, User as UserIcon, Save, RotateCcw, Github, Linkedin, Globe, UserPlus, UserCheck, MessageCircle, UserMinus, Ban, Clock, Unlock, Link, Zap, Flame, GraduationCap, MapPin, Building2, AlertTriangle } from 'lucide-react';
import {
    AVATARS, TITLES, PROFILE_BORDERS, PROFILE_BANNERS, PROFILE_THEMES, PROFILE_BACKGROUNDS,
    ShopItem
} from '../src/data/shopData';

type EditTab = 'info' | 'design';
type DesignCategory = 'avatar' | 'title' | 'border' | 'banner' | 'theme' | 'background';

interface ProfileProps {
    userId?: number; // If undefined, show my profile
    onNavigateToChat?: (userId: number) => void;
    onBack?: () => void;
    userUnlockedItems?: string[]; // Passed from parent for owned items
    studySessions?: StudySession[]; // For calculating quiz stats
}

// Extended edit form with design fields
interface ExtendedEditForm extends ProfileUpdateRequest {
    avatar?: string;
    title?: string;
    profileBorder?: string;
    profileBanner?: string;
    profileTheme?: string;
    profileBackground?: string;
}

export const Profile: React.FC<ProfileProps> = ({ userId, onNavigateToChat, onBack, userUnlockedItems = [], studySessions = [] }) => {
    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<string>('NONE');
    const [blockStatus, setBlockStatus] = useState<string>('NONE');
    const [editForm, setEditForm] = useState<ExtendedEditForm>({});
    const [originalForm, setOriginalForm] = useState<ExtendedEditForm>({}); // For change detection
    const [newSkill, setNewSkill] = useState('');
    const [editTab, setEditTab] = useState<EditTab>('info');
    const [designCategory, setDesignCategory] = useState<DesignCategory>('avatar');

    // URL input modal state
    const [showUrlInput, setShowUrlInput] = useState<'avatar' | 'banner' | null>(null);
    const [tempUrl, setTempUrl] = useState('');

    const isOwnProfile = !userId;

    // Calculate quiz stats from studySessions (only for own profile)
    const quizStats = useMemo(() => {
        if (!isOwnProfile || studySessions.length === 0) {
            return { quizCount: 0, avgScore: 0 };
        }
        const quizSessions = studySessions.filter(s => s.activityType === 'QUIZ');
        const quizCount = quizSessions.length;
        const sessionsWithScore = quizSessions.filter(s => s.score !== undefined && s.maxScore !== undefined && s.maxScore > 0);
        const avgScore = sessionsWithScore.length > 0
            ? sessionsWithScore.reduce((acc, s) => acc + ((s.score! / s.maxScore!) * 100), 0) / sessionsWithScore.length
            : 0;
        return { quizCount, avgScore };
    }, [isOwnProfile, studySessions]);

    // Calculate total study hours from studySessions (for own profile)
    const calculatedStudyHours = useMemo(() => {
        if (!isOwnProfile || studySessions.length === 0) {
            return null; // Will fall back to profile.totalStudyMinutes
        }
        // Sum all session durations (in seconds) and convert to hours
        const totalSeconds = studySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        return totalSeconds / 3600; // Convert seconds to hours
    }, [isOwnProfile, studySessions]);

    // Calculate if there are any unsaved changes
    const hasChanges = useMemo(() => {
        if (!profile) return false;
        return JSON.stringify(editForm) !== JSON.stringify(originalForm);
    }, [editForm, originalForm, profile]);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const data = isOwnProfile
                ? await profileApi.getMyProfile()
                : await profileApi.getProfile(userId!);
            setProfile(data);

            const formData: ExtendedEditForm = {
                displayName: data.displayName || '',
                bio: data.bio || '',
                college: data.college || '',
                country: data.country || '',
                countryVisible: data.countryVisible,
                emailVisible: data.emailVisible,
                githubUrl: data.githubUrl || '',
                linkedinUrl: data.linkedinUrl || '',
                portfolioUrl: data.portfolioUrl || '',
                profilePictureUrl: data.profilePictureUrl || '', // Custom avatar URL
                skills: data.skills,
                avatar: data.avatar || '👤',
                title: data.title || 'Newcomer',
                profileBorder: data.profileBorder || 'bd_default',
                profileBanner: data.profileBanner || 'bn_default',
                profileTheme: data.profileTheme || 'th_default',
                profileBackground: data.profileBackground || 'bg_default',
            };

            setEditForm(formData);
            setOriginalForm(formData);

            if (!isOwnProfile) {
                const fullStatus = await connectionApi.getFullStatus(userId!);
                setConnectionStatus(fullStatus.status);
                setBlockStatus(fullStatus.blockStatus);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        try {
            // Create a sanitized form without base64 data:image strings (convert them to empty)
            const sanitizedForm = { ...editForm };

            // If profilePictureUrl is a data:image (old format), clear it - only URLs are allowed
            if (sanitizedForm.profilePictureUrl && sanitizedForm.profilePictureUrl.startsWith('data:')) {
                sanitizedForm.profilePictureUrl = '';
            }

            // If profileBanner is a data:image (old format), reset to default - only URLs or IDs are allowed
            if (sanitizedForm.profileBanner && sanitizedForm.profileBanner.startsWith('data:')) {
                sanitizedForm.profileBanner = 'bn_default';
            }

            const updated = await profileApi.updateProfile(sanitizedForm);
            setProfile(updated);
            setOriginalForm(editForm); // Reset original to current
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error';
            alert(`Failed to save profile: ${errorMessage}`);
        }
    };

    const handleDiscard = () => {
        setEditForm(originalForm);
    };

    const handleCancelEdit = () => {
        setEditForm(originalForm);
        setIsEditing(false);
    };

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;

        // Split by comma to support adding multiple skills at once
        const skillsToAdd = newSkill.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (skillsToAdd.length === 0) return;

        try {
            let updated;
            // Add each skill sequentially
            for (const skill of skillsToAdd) {
                updated = await profileApi.addSkill(skill);
            }
            if (updated) {
                setProfile(updated);
                const newSkills = updated.skills;
                setEditForm(prev => ({ ...prev, skills: newSkills }));
                setOriginalForm(prev => ({ ...prev, skills: newSkills }));
            }
            setNewSkill('');
        } catch (err) {
            console.error('Failed to add skill:', err);
        }
    };

    const handleRemoveSkill = async (skill: string) => {
        try {
            const updated = await profileApi.removeSkill(skill);
            setProfile(updated);
            const newSkills = updated.skills;
            setEditForm(prev => ({ ...prev, skills: newSkills }));
            setOriginalForm(prev => ({ ...prev, skills: newSkills }));
        } catch (err) {
            console.error('Failed to remove skill:', err);
        }
    };

    // Connection handlers
    const handleConnect = async () => {
        try {
            await connectionApi.sendRequest(userId!);
            setConnectionStatus('PENDING_SENT');
        } catch (err) {
            console.error('Failed to send connection request:', err);
        }
    };

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const handleRemoveConnection = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Connection',
            message: `Are you sure you want to remove ${profile?.displayName || profile?.username} from your connections?`,
            onConfirm: async () => {
                try {
                    await connectionApi.removeConnectionByUserId(userId!);
                    setConnectionStatus('NONE');
                } catch (err) {
                    console.error('Failed to remove connection:', err);
                    alert('Failed to remove connection. Please try again.');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleBlock = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Block User',
            message: `Are you sure you want to block ${profile?.displayName || profile?.username}? This will also remove any existing connection.`,
            onConfirm: async () => {
                try {
                    await connectionApi.blockUser(userId!);
                    setBlockStatus('BLOCKED_BY_ME');
                    setConnectionStatus('NONE');
                } catch (err) {
                    console.error('Failed to block:', err);
                    alert('Failed to block user. Please try again.');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleUnblock = async () => {
        try {
            await connectionApi.unblockUser(userId!);
            setBlockStatus('NONE');
        } catch (err) {
            console.error('Failed to unblock:', err);
        }
    };

    // Handle URL input for avatar/banner
    const handleUrlSubmit = () => {
        if (!tempUrl.trim()) {
            setShowUrlInput(null);
            return;
        }

        // Basic URL validation
        if (!tempUrl.startsWith('http://') && !tempUrl.startsWith('https://')) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }

        if (showUrlInput === 'avatar') {
            setEditForm(prev => ({
                ...prev,
                profilePictureUrl: tempUrl,
                avatar: '' // Clear emoji avatar
            }));
        } else if (showUrlInput === 'banner') {
            setEditForm(prev => ({ ...prev, profileBanner: tempUrl }));
        }

        setTempUrl('');
        setShowUrlInput(null);
    };

    const handleUrlCancel = () => {
        setTempUrl('');
        setShowUrlInput(null);
    };

    // Get owned items for a category
    const getOwnedItems = (items: ShopItem[]): ShopItem[] => {
        return items.filter(item => item.isDefault || userUnlockedItems.includes(item.id));
    };

    // Design item selector component
    const renderDesignSelector = (items: ShopItem[], currentValue: string, fieldKey: keyof ExtendedEditForm) => {
        const ownedItems = getOwnedItems(items);

        return (
            <div className="design-grid">
                {ownedItems.map(item => {
                    const isSelected = editForm[fieldKey] === item.value || editForm[fieldKey] === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setEditForm(prev => ({ ...prev, [fieldKey]: item.type === 'AVATAR' || item.type === 'TITLE' ? item.value : item.id }))}
                            className={`design-item ${isSelected ? 'selected' : ''}`}
                        >
                            {item.type === 'AVATAR' && <span className="design-preview avatar">{item.value}</span>}
                            {item.type === 'TITLE' && <span className="design-preview title">{item.value}</span>}
                            {item.type === 'BORDER' && <div className={`design-preview border-preview border-4 ${item.value}`}></div>}
                            {item.type === 'BANNER' && <div className={`design-preview banner-preview bg-gradient-to-r ${item.value}`}></div>}
                            {item.type === 'THEME' && <div className={`design-preview theme-preview ${getThemeClass(item.id)}`}></div>}
                            {item.type === 'BACKGROUND' && <div className={`design-preview bg-preview ${getBgClass(item.id)}`}></div>}
                            <span className="design-name">{item.name}</span>
                        </button>
                    );
                })}
                {ownedItems.length === 0 && (
                    <p className="no-items">No items owned. Visit the Shop to purchase!</p>
                )}
            </div>
        );
    };

    // Helper for theme preview
    const getThemeClass = (id: string): string => {
        const classes: Record<string, string> = {
            'th_default': 'bg-slate-700', 'th_blue': 'bg-blue-600', 'th_purple': 'bg-purple-600',
            'th_green': 'bg-green-600', 'th_red': 'bg-red-600', 'th_gold': 'bg-yellow-500',
            'th_neon': 'bg-gradient-to-r from-pink-500 to-cyan-500', 'th_rainbow': 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
        };
        return classes[id] || 'bg-slate-600';
    };

    // Helper for background preview
    const getBgClass = (id: string): string => {
        const classes: Record<string, string> = {
            'bg_default': 'bg-slate-900', 'bg_grid': 'bg-slate-800', 'bg_dots': 'bg-slate-700',
            'bg_waves': 'bg-cyan-900', 'bg_gradient_blue': 'bg-blue-900', 'bg_gradient_purple': 'bg-purple-900',
            'bg_stars': 'bg-indigo-900', 'bg_matrix': 'bg-green-900', 'bg_aurora': 'bg-gradient-to-r from-green-600 to-purple-600',
            'bg_galaxy': 'bg-gradient-to-r from-purple-800 to-indigo-900',
        };
        return classes[id] || 'bg-slate-800';
    };

    // === ACTUAL PROFILE STYLING HELPERS ===
    // Get banner gradient CSS for header
    const getBannerStyle = (): React.CSSProperties => {
        const bannerId = editForm.profileBanner || 'bn_default';

        // Check if it's a custom image URL
        if (bannerId.startsWith('http://') || bannerId.startsWith('https://')) {
            return {
                backgroundImage: `url(${bannerId})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }

        const bannerGradients: Record<string, string> = {
            'bn_default': 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            'bn_blue': 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            'bn_sunrise': 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #9333ea 100%)',
            'bn_ocean': 'linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #3730a3 100%)',
            'bn_forest': 'linear-gradient(135deg, #22c55e 0%, #059669 50%, #0d9488 100%)',
            'bn_blaze': 'linear-gradient(135deg, #eab308 0%, #f97316 50%, #dc2626 100%)',
            'bn_space': 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #3730a3 100%)',
            'bn_aurora': 'linear-gradient(135deg, #4ade80 0%, #06b6d4 50%, #9333ea 100%)',
            'bn_neon': 'linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #2563eb 100%)',
            'bn_gold': 'linear-gradient(135deg, #facc15 0%, #f59e0b 50%, #ea580c 100%)',
        };
        return { background: bannerGradients[bannerId] || bannerGradients['bn_default'] };
    };

    // Get border CSS class for animated borders (rainbow, neon, fire)
    const getBorderClass = (): string => {
        const borderId = editForm.profileBorder || 'bd_default';
        if (borderId === 'bd_rainbow') return 'border-rainbow';
        if (borderId === 'bd_neon') return 'border-neon';
        if (borderId === 'bd_fire') return 'border-fire';
        return '';
    };

    // Get border inline style for non-animated borders
    const getBorderStyle = (): React.CSSProperties => {
        const borderId = editForm.profileBorder || 'bd_default';
        // Animated borders use CSS classes, not inline styles
        if (['bd_rainbow', 'bd_neon', 'bd_fire'].includes(borderId)) {
            return {};
        }
        const borderColors: Record<string, string> = {
            'bd_default': '#475569', 'bd_blue': '#3b82f6', 'bd_green': '#10b981',
            'bd_purple': '#a855f7', 'bd_pink': '#ec4899', 'bd_orange': '#f97316',
            'bd_gold': '#facc15',
        };
        return { borderColor: borderColors[borderId] || borderColors['bd_default'] };
    };

    // Get background style for container (outer)
    const getContainerBgStyle = (): React.CSSProperties => {
        const bgId = editForm.profileBackground || 'bg_default';
        const bgStyles: Record<string, string> = {
            'bg_default': '#020617',
            'bg_grid': '#1e293b',
            'bg_dots': '#334155',
            'bg_waves': '#164e63',
            'bg_gradient_blue': 'linear-gradient(135deg, #020617 0%, #1e3a5f 50%, #020617 100%)',
            'bg_gradient_purple': 'linear-gradient(135deg, #020617 0%, #3b1d5e 50%, #020617 100%)',
            'bg_stars': 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            'bg_matrix': 'linear-gradient(135deg, #14532d 0%, #0f172a 100%)',
            'bg_aurora': 'linear-gradient(135deg, #15803d 0%, #0891b2 50%, #7e22ce 100%)',
            'bg_galaxy': 'linear-gradient(135deg, #6b21a8 0%, #312e81 50%, #0f172a 100%)',
        };
        return { background: bgStyles[bgId] || bgStyles['bg_default'] };
    };

    // Get background CSS class for animated backgrounds
    const getContainerBgClass = (): string => {
        const bgId = editForm.profileBackground || 'bg_default';
        if (bgId === 'bg_stars') return 'bg-animated-stars';
        if (bgId === 'bg_matrix') return 'bg-matrix';
        if (bgId === 'bg_aurora') return 'bg-aurora';
        if (bgId === 'bg_galaxy') return 'bg-galaxy';
        if (bgId === 'bg_gradient_blue') return 'bg-gradient-blue';
        if (bgId === 'bg_gradient_purple') return 'bg-gradient-purple';
        return '';
    };

    // Get theme accent color for section headers (inner styling)
    const getThemeAccent = (): string => {
        const themeId = editForm.profileTheme || 'th_default';
        const accents: Record<string, string> = {
            'th_default': '#94a3b8', 'th_blue': '#3b82f6', 'th_purple': '#a855f7',
            'th_green': '#22c55e', 'th_red': '#ef4444', 'th_gold': '#eab308',
            'th_neon': '#ec4899', 'th_rainbow': '#a855f7',
        };
        return accents[themeId] || accents['th_default'];
    };

    // Get theme CSS class for rainbow text animation
    const getThemeTextClass = (): string => {
        const themeId = editForm.profileTheme || 'th_default';
        if (themeId === 'th_rainbow') return 'theme-rainbow-text';
        return '';
    };

    // Get theme data attribute for CSS-based theme application
    const getThemeDataAttr = (): string => {
        const themeId = editForm.profileTheme || 'th_default';
        const themeNames: Record<string, string> = {
            'th_default': '', 'th_blue': 'blue', 'th_purple': 'purple',
            'th_green': 'green', 'th_red': 'red', 'th_gold': 'gold',
            'th_neon': 'neon', 'th_rainbow': 'rainbow',
        };
        return themeNames[themeId] || '';
    };

    // Get banner CSS class for animated/premium banners
    const getBannerClass = (): string => {
        const bannerId = editForm.profileBanner || 'bn_default';
        // Custom uploaded images don't have special classes
        if (bannerId.startsWith('data:image')) return '';
        const bannerClasses: Record<string, string> = {
            'bn_aurora': 'banner-aurora',
            'bn_neon': 'banner-neon',
            'bn_gold': 'banner-gold',
            'bn_space': 'banner-space',
        };
        return bannerClasses[bannerId] || '';
    };

    // Check if banner should have premium mirror shine effect
    const shouldHavePremiumShine = (): boolean => {
        const bannerId = editForm.profileBanner || 'bn_default';
        return ['bn_aurora', 'bn_neon', 'bn_gold', 'bn_space', 'bn_blaze'].includes(bannerId);
    };

    // Check if banner should have shine effect (premium banners)
    const shouldHaveShine = (): boolean => {
        const bannerId = editForm.profileBanner || 'bn_default';
        return ['bn_aurora', 'bn_neon', 'bn_gold'].includes(bannerId);
    };

    // Get the current avatar to display - prioritize custom image (profilePictureUrl) over emoji
    const displayAvatar = editForm.profilePictureUrl || profile?.profilePictureUrl || editForm.avatar || profile?.avatar || '👤';

    // Get the current title to display
    const displayTitle = editForm.title || profile?.title || 'Newcomer';

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return <div className="profile-error">Profile not found</div>;
    }

    return (
        <div
            className={`profile-container ${getContainerBgClass()}`}
            style={getContainerBgStyle()}
            data-theme={getThemeDataAttr()}
        >
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

            {/* Back Button */}
            {!isOwnProfile && onBack && (
                <button className="profile-back-btn" onClick={onBack}>
                    ← Discovery
                </button>
            )}

            {/* Header with Banner */}
            <div className={`profile-header ${getBannerClass()} ${shouldHavePremiumShine() ? 'premium-shine' : ''}`} style={getBannerStyle()}>
                <div
                    className={`profile-avatar ${getBorderClass()}`}
                    style={{
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        ...getBorderStyle()
                    }}
                >
                    {displayAvatar?.startsWith('http://') || displayAvatar?.startsWith('https://') ? (
                        <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                        displayAvatar
                    )}
                </div>
                <div className="profile-info">
                    <h1 className={getThemeTextClass()} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>{profile.displayName || profile.username}</h1>
                    <p className="profile-username">@{profile.username}</p>
                    <p className={`profile-title ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                        {displayTitle}
                    </p>
                    {/* Inline headline info */}
                    {(profile.college || profile.country) && (
                        <p className="profile-headline" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {profile.college && (
                                <span className="flex items-center gap-1">
                                    <Building2 size={14} className="text-slate-400" />
                                    {profile.college}
                                </span>
                            )}
                            {profile.college && profile.country && profile.countryVisible && <span className="divider">•</span>}
                            {profile.country && profile.countryVisible && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="text-green-400" />
                                    {profile.country}
                                </span>
                            )}
                        </p>
                    )}
                    {/* Social Links - Inline in header */}
                    {(profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) && (
                        <div className="header-social-links">
                            {profile.githubUrl && (
                                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                                    <Github size={16} />
                                </a>
                            )}
                            {profile.linkedinUrl && (
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                    <Linkedin size={16} />
                                </a>
                            )}
                            {profile.portfolioUrl && (
                                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" title="Portfolio">
                                    <Globe size={16} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <div className="profile-stats">
                    <div className="stat">
                        <span className={`stat-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                            <Zap size={18} className="inline-block mr-1 text-blue-400" style={{ verticalAlign: 'middle' }} />
                            {profile.level}
                        </span>
                        <span className="stat-label">Level</span>
                    </div>
                    <div className="stat">
                        <span className={`stat-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                            <Flame size={18} className="inline-block mr-1 text-orange-400" style={{ verticalAlign: 'middle' }} />
                            {profile.highestStreak || profile.streak || 0}
                        </span>
                        <span className="stat-label">Streak</span>
                    </div>
                    <div className="stat">
                        <span className={`stat-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                            <Clock size={18} className="inline-block mr-1 text-purple-400" style={{ verticalAlign: 'middle' }} />
                            {(calculatedStudyHours !== null ? calculatedStudyHours : (profile.totalStudyMinutes / 60)).toFixed(1)}h
                        </span>
                        <span className="stat-label">Study</span>
                    </div>
                </div>
            </div>

            {/* Achievement Badges */}
            <div className="profile-section profile-badges">
                <h3>🏆 Achievements</h3>
                <BadgesDisplay
                    earnedBadgeIds={calculateEarnedBadges({
                        hasLoggedIn: true,
                        challengesCompleted: profile.challengesCompleted || 0,
                        currentStreak: profile.streak || 0,
                        totalStudyHours: Math.round((profile.totalStudyMinutes || 0) / 60)
                    })}
                    showLocked={isOwnProfile}
                />
            </div>

            {/* Edit Button (small icon) / Actions */}
            <div className="profile-actions">
                {isOwnProfile ? (
                    <button
                        className={`btn-edit-icon ${isEditing ? 'editing' : ''}`}
                        onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                        title={isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    >
                        {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                    </button>
                ) : blockStatus === 'BLOCKED_BY_THEM' ? (
                    <div className="blocked-message"><p><Ban size={16} className="inline mr-1" /> This user has blocked you</p></div>
                ) : blockStatus === 'BLOCKED_BY_ME' ? (
                    <div className="blocked-by-me">
                        <p><Ban size={16} className="inline mr-1" /> You have blocked this user</p>
                        <button className="btn btn-secondary" onClick={handleUnblock}><Unlock size={16} /> Unblock</button>
                    </div>
                ) : (
                    <>
                        {connectionStatus === 'NONE' && (
                            <button className="btn btn-primary" onClick={handleConnect}><UserPlus size={16} /> Connect</button>
                        )}
                        {connectionStatus === 'PENDING_SENT' && (
                            <button className="btn btn-secondary" disabled><Clock size={16} /> Request Sent</button>
                        )}
                        {connectionStatus === 'PENDING_RECEIVED' && (
                            <button className="btn btn-success" onClick={handleConnect}><Check size={16} /> Accept Request</button>
                        )}
                        {connectionStatus === 'CONNECTED' && (
                            <>
                                <button className="btn btn-success" disabled><UserCheck size={16} /> Connected</button>
                                <button className="btn btn-primary" onClick={() => onNavigateToChat?.(userId!)}><MessageCircle size={16} /> Message</button>
                                <button className="btn btn-secondary" onClick={handleRemoveConnection}><UserMinus size={16} /> Remove</button>
                            </>
                        )}
                        <button className="btn btn-danger" onClick={handleBlock}><Ban size={16} /> Block</button>
                    </>
                )}
            </div>

            {/* Editing Mode Content */}
            {isEditing && (
                <div className="edit-mode-container">
                    {/* Edit Tabs */}
                    <div className="edit-tabs">
                        <button
                            className={`edit-tab ${editTab === 'info' ? 'active' : ''}`}
                            onClick={() => setEditTab('info')}
                        >
                            <UserIcon size={16} /> Profile Info
                        </button>
                        <button
                            className={`edit-tab ${editTab === 'design' ? 'active' : ''}`}
                            onClick={() => setEditTab('design')}
                        >
                            <Palette size={16} /> Profile Design
                        </button>
                    </div>

                    {/* Info Tab */}
                    {editTab === 'info' && (
                        <div className="edit-section">
                            <div className="edit-field">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.displayName || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                                    placeholder="Your display name"
                                />
                            </div>
                            <div className="edit-field">
                                <label>Bio</label>
                                <textarea
                                    value={editForm.bio || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Tell others about yourself..."
                                    rows={3}
                                />
                            </div>
                            <div className="edit-field">
                                <label>College</label>
                                <input
                                    type="text"
                                    value={editForm.college || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, college: e.target.value }))}
                                    placeholder="Your college or university"
                                />
                            </div>
                            <div className="edit-field">
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={editForm.country || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                                    placeholder="Your country"
                                />
                            </div>
                            <div className="edit-field">
                                <label>🐙 GitHub URL</label>
                                <input
                                    type="url"
                                    value={editForm.githubUrl || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                    placeholder="https://github.com/username"
                                />
                            </div>
                            <div className="edit-field">
                                <label>💼 LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={editForm.linkedinUrl || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                            <div className="edit-field">
                                <label>🌐 Portfolio URL</label>
                                <input
                                    type="url"
                                    value={editForm.portfolioUrl || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            {/* Skills Editing */}
                            <div className="edit-field skills-editor">
                                <label>Skills</label>
                                <div className="skills-input-row">
                                    <input
                                        type="text"
                                        id="new-skill-input"
                                        placeholder="Add a skill (e.g., React, Python)"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const input = e.currentTarget;
                                                const skill = input.value.trim();
                                                if (skill && !editForm.skills?.includes(skill)) {
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        skills: [...(prev.skills || []), skill]
                                                    }));
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-add-skill"
                                        onClick={() => {
                                            const input = document.getElementById('new-skill-input') as HTMLInputElement;
                                            const skill = input?.value.trim();
                                            if (skill && !editForm.skills?.includes(skill)) {
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    skills: [...(prev.skills || []), skill]
                                                }));
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="skills-edit-list">
                                    {editForm.skills?.map((skill: string) => (
                                        <span key={skill} className="skill-tag-editable">
                                            {skill}
                                            <button
                                                className="skill-remove-btn"
                                                onClick={() => setEditForm(prev => ({
                                                    ...prev,
                                                    skills: prev.skills?.filter(s => s !== skill) || []
                                                }))}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Design Tab */}
                    {editTab === 'design' && (
                        <div className="edit-section design-section">
                            {/* Design Category Tabs */}
                            <div className="design-category-tabs">
                                {[
                                    { id: 'avatar' as DesignCategory, label: '😀 Avatar' },
                                    { id: 'title' as DesignCategory, label: '🏷️ Title' },
                                    { id: 'border' as DesignCategory, label: '⭕ Border' },
                                    { id: 'banner' as DesignCategory, label: '🎨 Banner' },
                                    { id: 'theme' as DesignCategory, label: '🎭 Theme' },
                                    { id: 'background' as DesignCategory, label: '🖼️ Background' },
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`design-cat-tab ${designCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setDesignCategory(cat.id)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Design Selectors with Upload Options */}
                            {designCategory === 'avatar' && (
                                <div className="design-grid">
                                    {/* Add Avatar URL Button - Always First */}
                                    <button
                                        className="design-item upload-item"
                                        onClick={() => setShowUrlInput('avatar')}
                                    >
                                        <div className="design-preview upload-preview">
                                            <Link size={24} />
                                        </div>
                                        <span className="design-name">Add URL</span>
                                    </button>
                                    {/* Custom URL avatar if exists */}
                                    {editForm.profilePictureUrl && (
                                        <button
                                            className="design-item selected"
                                            onClick={() => { }} // Already selected
                                        >
                                            <img src={editForm.profilePictureUrl} alt="Custom" className="design-preview avatar custom-avatar-img" />
                                            <span className="design-name">Custom</span>
                                        </button>
                                    )}
                                    {/* Marketplace avatars */}
                                    {getOwnedItems(AVATARS).map(item => {
                                        // Not selected if custom image is active
                                        const hasCustomImage = !!editForm.profilePictureUrl;
                                        const isSelected = !hasCustomImage && editForm.avatar === item.value;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setEditForm(prev => ({
                                                    ...prev,
                                                    avatar: item.value,
                                                    profilePictureUrl: '' // Clear custom image when selecting marketplace avatar
                                                }))}
                                                className={`design-item ${isSelected ? 'selected' : ''}`}
                                            >
                                                <span className="design-preview avatar">{item.value}</span>
                                                <span className="design-name">{item.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {designCategory === 'title' && renderDesignSelector(TITLES, editForm.title || '', 'title')}
                            {designCategory === 'border' && renderDesignSelector(PROFILE_BORDERS, editForm.profileBorder || '', 'profileBorder')}
                            {designCategory === 'banner' && (
                                <div className="design-grid">
                                    {/* Add Banner URL Button - Always First */}
                                    <button
                                        className="design-item upload-item"
                                        onClick={() => setShowUrlInput('banner')}
                                    >
                                        <div className="design-preview banner-preview upload-preview-banner">
                                            <Link size={20} />
                                        </div>
                                        <span className="design-name">Add URL</span>
                                    </button>
                                    {/* Custom URL banner if exists */}
                                    {editForm.profileBanner?.startsWith('http') && (
                                        <button
                                            className="design-item selected"
                                            onClick={() => { }} // Already selected
                                        >
                                            <img src={editForm.profileBanner} alt="Custom" className="design-preview banner-preview custom-banner-img" />
                                            <span className="design-name">Custom</span>
                                        </button>
                                    )}
                                    {/* Marketplace banners */}
                                    {getOwnedItems(PROFILE_BANNERS).map(item => {
                                        const isCustomUrl = editForm.profileBanner?.startsWith('http');
                                        const isSelected = !isCustomUrl && editForm.profileBanner === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setEditForm(prev => ({ ...prev, profileBanner: item.id }))}
                                                className={`design-item ${isSelected ? 'selected' : ''}`}
                                            >
                                                <div className={`design-preview banner-preview bg-gradient-to-r ${item.value}`}></div>
                                                <span className="design-name">{item.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {designCategory === 'theme' && renderDesignSelector(PROFILE_THEMES, editForm.profileTheme || '', 'profileTheme')}
                            {designCategory === 'background' && renderDesignSelector(PROFILE_BACKGROUNDS, editForm.profileBackground || '', 'profileBackground')}
                        </div>
                    )}
                </div>
            )}

            {/* View Mode - LinkedIn-Style Compact Cards */}
            {!isEditing && (
                <>
                    {/* About Card - Bio & Skills Combined */}
                    <div className="profile-card">
                        <h3 className={getThemeTextClass()} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>About</h3>
                        <p className="about-text">{profile.bio || 'No bio added yet.'}</p>

                        {/* Skills - Compact Inline Chips */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="skills-compact">
                                {profile.skills.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="skill-chip"
                                        style={{ borderColor: getThemeAccent(), color: getThemeAccent() }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity Card - Performance Stats */}
                    <div className="profile-card activity-card">
                        <h3 className={getThemeTextClass()} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>Activity</h3>
                        <div className="activity-grid">
                            <div className="activity-item">
                                <span className={`activity-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                                    {isOwnProfile ? quizStats.quizCount : (profile.totalQuizzesTaken || 0)}
                                </span>
                                <span className="activity-label">Quizzes</span>
                            </div>
                            <div className="activity-item">
                                <span className={`activity-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>
                                    {isOwnProfile ? quizStats.avgScore.toFixed(0) : (profile.averageQuizScore?.toFixed(0) || 0)}%
                                </span>
                                <span className="activity-label">Avg Score</span>
                            </div>
                            <div className="activity-item">
                                <span className={`activity-value ${getThemeTextClass()}`} style={getThemeTextClass() ? {} : { color: getThemeAccent() }}>{profile.streak || 0}</span>
                                <span className="activity-label">Current Streak</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Floating Save/Discard Bar - Only shows when there are changes */}
            {isEditing && hasChanges && (
                <div className="floating-save-bar">
                    <span className="changes-indicator">You have unsaved changes</span>
                    <div className="save-bar-actions">
                        <button className="btn-discard" onClick={handleDiscard}>
                            <RotateCcw size={16} /> Discard
                        </button>
                        <button className="btn-save" onClick={handleSave}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* URL Input Modal */}
            {showUrlInput && (
                <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {showUrlInput === 'avatar' ? '🖼️ Add Avatar URL' : '🎨 Add Banner URL'}
                        </h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Paste an image URL from the web. Make sure the image is publicly accessible.
                        </p>
                        <input
                            type="url"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleUrlCancel}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUrlSubmit}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
