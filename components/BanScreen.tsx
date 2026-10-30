/**
 * Ban Screen Component
 * Displays a full-screen ban notice with countdown timer for temporary bans
 * or "Banned Forever" message for permanent bans.
 */

import React, { useState, useEffect } from 'react';
import { Ban, Clock, AlertTriangle } from 'lucide-react';

interface BanScreenProps {
    banExpiry: string | null; // ISO date string or null for permanent
    banReason: string;
    onRetry?: () => void;
}

export const BanScreen: React.FC<BanScreenProps> = ({ banExpiry, banReason, onRetry }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    const isPermanent = !banExpiry;

    useEffect(() => {
        if (isPermanent) return;

        const calculateTimeLeft = () => {
            const expiryDate = new Date(banExpiry!);
            const now = new Date();
            const diff = expiryDate.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                return null;
            }

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const time = calculateTimeLeft();
            if (time) {
                setTimeLeft(time);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [banExpiry, isPermanent]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-red-500/30 p-8 rounded-2xl shadow-2xl relative z-10">
                {/* Ban Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                        <Ban size={52} className="text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-center text-red-400 mb-2">
                    ACCOUNT BANNED
                </h1>

                {/* Duration */}
                {isPermanent ? (
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-white mb-2">Banned Forever</p>
                        <p className="text-slate-400">Your account has been permanently suspended.</p>
                    </div>
                ) : isExpired ? (
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-emerald-400 mb-2">Ban Expired!</p>
                        <p className="text-slate-400">You may now try to log in again.</p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                            >
                                Try Login
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center mb-6">
                        <p className="text-lg text-slate-400 mb-4 flex items-center justify-center gap-2">
                            <Clock size={18} /> Time Remaining
                        </p>
                        {/* Countdown Timer */}
                        <div className="flex justify-center gap-3 mb-4">
                            {[
                                { value: timeLeft?.days ?? 0, label: 'Days' },
                                { value: timeLeft?.hours ?? 0, label: 'Hours' },
                                { value: timeLeft?.minutes ?? 0, label: 'Min' },
                                { value: timeLeft?.seconds ?? 0, label: 'Sec' }
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-slate-800 rounded-xl p-3 min-w-[70px]">
                                    <p className="text-3xl font-bold text-white tabular-nums">
                                        {String(value).padStart(2, '0')}
                                    </p>
                                    <p className="text-xs text-slate-400 uppercase">{label}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-500 text-sm">
                            Ban expires: {new Date(banExpiry!).toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Ban Reason */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Reason for ban:</p>
                            <p className="text-white font-medium">{banReason}</p>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <p className="text-center text-slate-500 text-xs">
                    If you believe this ban was issued in error, please contact support.
                </p>
            </div>
        </div>
    );
};

export default BanScreen;
