/**
 * Settings Component
 * Displays application settings with security options like password change.
 * Includes forgot password option using security question.
 */

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Eye, EyeOff, Check, X, Shield, HelpCircle, KeyRound, Crown } from 'lucide-react';
import { authApi } from '../src/api';
import { adminApi } from '../src/api/adminApi';
import { useAuth } from '../src/context/AuthContext';
import { AdminPanel } from './AdminPanel';

// Security question options - must match backend expected values
const SECURITY_QUESTIONS = [
    "What is your pet's name?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What was your childhood nickname?"
];

interface SettingsProps {
    onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    const { user } = useAuth();

    // Admin check
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [activeTab, setActiveTab] = useState<'security' | 'admin'>('security');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                console.log('Checking admin status...');
                const status = await adminApi.checkAdmin();
                console.log('Admin check result:', status);
                setIsAdmin(status.isAdmin);
                setIsOwner(status.isOwner);
            } catch (e) {
                console.error('Admin check failed:', e);
                setIsAdmin(false);
                setIsOwner(false);
            }
        };
        checkAdmin();
    }, []);

    // Tab state - normal password change vs forgot password
    const [useForgotPassword, setUseForgotPassword] = useState(false);

    // Password change state (normal flow)
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Forgot password state (security question flow)
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

    // Load security question when switching to forgot password mode
    const handleSwitchToForgot = async () => {
        setUseForgotPassword(true);
        setMessage(null);
        clearForm();

        if (user) {
            setIsLoadingQuestion(true);
            try {
                const question = await authApi.getSecurityQuestion(user.name);
                setSecurityQuestion(question);
            } catch (err: any) {
                setMessage({ type: 'error', text: 'Could not load security question. Your account may not have one set.' });
            } finally {
                setIsLoadingQuestion(false);
            }
        }
    };

    const handleSwitchToNormal = () => {
        setUseForgotPassword(false);
        setMessage(null);
        clearForm();
    };

    const clearForm = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSecurityAnswer('');
    };

    const handleChangePassword = async () => {
        setMessage(null);

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setIsLoading(true);
        try {
            await authApi.changePassword(oldPassword, newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            clearForm();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setMessage(null);

        if (!securityAnswer || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (!user) {
            setMessage({ type: 'error', text: 'Not logged in' });
            return;
        }

        setIsLoading(true);
        try {
            await authApi.forgotPassword(user.name, securityAnswer, newPassword);
            setMessage({ type: 'success', text: 'Password reset successfully!' });
            clearForm();
            setUseForgotPassword(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Incorrect security answer or failed to reset' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in pb-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <SettingsIcon className="text-slate-400" size={32} />
                        Settings
                    </h2>
                    <p className="text-slate-400 mt-1">Manage your account preferences and security</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Main Tabs */}
            {isAdmin && (
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'security'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <Shield size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <Crown size={18} /> Admin Panel
                    </button>
                </div>
            )}

            {/* Admin Panel Tab */}
            {isAdmin && activeTab === 'admin' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <AdminPanel isOwner={isOwner} />
                </div>
            )}

            {/* Security Section */}
            {activeTab === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Shield className="text-red-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Security</h3>
                            <p className="text-slate-400 text-sm">Manage your password and account security</p>
                        </div>
                    </div>

                    {/* Toggle between normal/forgot password */}
                    <div className="flex gap-2 mb-6 max-w-md">
                        <button
                            onClick={handleSwitchToNormal}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${!useForgotPassword
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Lock size={16} />
                            Change Password
                        </button>
                        <button
                            onClick={handleSwitchToForgot}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${useForgotPassword
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <KeyRound size={16} />
                            Forgot Password
                        </button>
                    </div>

                    {/* Password Change Form */}
                    <div className="space-y-4 max-w-md">
                        <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                            {useForgotPassword ? (
                                <>
                                    <HelpCircle size={14} />
                                    Reset via Security Question
                                </>
                            ) : (
                                <>
                                    <Lock size={14} />
                                    Change Password
                                </>
                            )}
                        </h4>

                        {/* Status Message */}
                        {message && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                }`}>
                                {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                {message.text}
                            </div>
                        )}

                        {useForgotPassword ? (
                            <>
                                {/* Security Question Display */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Your Security Question</label>
                                    <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white">
                                        {isLoadingQuestion ? (
                                            <span className="text-slate-500">Loading...</span>
                                        ) : securityQuestion ? (
                                            <span className="text-amber-400">{securityQuestion}</span>
                                        ) : (
                                            <span className="text-slate-500">No security question found</span>
                                        )}
                                    </div>
                                </div>

                                {/* Security Answer */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Your Answer</label>
                                    <input
                                        type="text"
                                        value={securityAnswer}
                                        onChange={e => setSecurityAnswer(e.target.value)}
                                        placeholder="Enter your security answer"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        disabled={!securityQuestion}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Answer is case-insensitive</p>
                                </div>
                            </>
                        ) : (
                            /* Current Password */
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={e => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={useForgotPassword ? handleForgotPassword : handleChangePassword}
                                disabled={isLoading || (useForgotPassword && !securityQuestion)}
                                className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${useForgotPassword
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={18} />
                                        {useForgotPassword ? 'Reset Password' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={clearForm}
                                disabled={isLoading}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                <X size={18} />
                                Clear
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            {useForgotPassword
                                ? "Use your security question if you don't remember your current password."
                                : "Your password will be permanently changed. Make sure to remember it!"
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
