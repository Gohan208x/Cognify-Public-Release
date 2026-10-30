import React from 'react';
import { DailyChallenge, User } from '../types';
import { Swords, Lock, Clock, Coins, Sparkles, CheckCircle2, XCircle, Play, Timer, Brain, FileText, Users, Target, Zap } from 'lucide-react';

interface ChallengesProps {
   challenges: DailyChallenge[];
   user: User;
   onActivate: (id: string) => void;
   onAttempt: (id: string, type: string) => void; // Navigate to feature tab
}

export const Challenges: React.FC<ChallengesProps> = ({ challenges, user, onActivate, onAttempt }) => {

   const getChallengeIcon = (type: string) => {
      switch (type) {
         case 'FOCUS_MARATHON': return Timer;
         case 'QUIZ_STREAK': return Brain;
         case 'NOTE_SPRINT': return FileText;
         case 'DOUBT_SOLVER': return Users;
         default: return Target;
      }
   };

   const getChallengeColor = (type: string) => {
      switch (type) {
         case 'FOCUS_MARATHON': return { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-500' };
         case 'QUIZ_STREAK': return { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-500' };
         case 'NOTE_SPRINT': return { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'text-emerald-500' };
         case 'DOUBT_SOLVER': return { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-500' };
         default: return { bg: 'from-slate-500/20 to-slate-600/20', border: 'border-slate-500/30', text: 'text-slate-400', icon: 'text-slate-500' };
      }
   };

   const getTimeRemaining = (expiresAt: number) => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) return "Expired";
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hrs}h ${mins}m`;
   };

   return (
      <div className="h-full flex flex-col animate-fade-in pb-12">
         {/* Header */}
         <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                  <Swords className="text-red-500" size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-white">Daily Challenges</h2>
                  <p className="text-slate-400 text-sm">High risk, high reward. Complete before midnight!</p>
               </div>
            </div>
         </div>

         {/* Challenge Cards - Single Column for cleaner look */}
         <div className="flex-1 overflow-y-auto space-y-4">
            {challenges.map(challenge => {
               const isLocked = challenge.status === 'LOCKED';
               const isActive = challenge.status === 'ACTIVE';
               const isCompleted = challenge.status === 'COMPLETED';
               const isFailed = challenge.status === 'FAILED';
               const canAfford = user.coins >= challenge.cost;
               const colors = getChallengeColor(challenge.type);
               const ChallengeIcon = getChallengeIcon(challenge.type);
               const progressPercent = (challenge.progress / challenge.target) * 100;

               return (
                  <div
                     key={challenge.id}
                     className={`relative rounded-xl border transition-all overflow-hidden ${isCompleted
                           ? 'bg-emerald-950/30 border-emerald-500/40'
                           : isFailed
                              ? 'bg-red-950/30 border-red-500/40 opacity-60'
                              : isActive
                                 ? `bg-gradient-to-r ${colors.bg} ${colors.border} shadow-lg`
                                 : 'bg-slate-900/80 border-slate-700/50 hover:border-slate-600/50'
                        }`}
                  >
                     <div className="p-4">
                        {/* Top Row: Icon, Title, Status, Time */}
                        <div className="flex items-start gap-3 mb-3">
                           <div className={`p-2.5 rounded-lg bg-slate-900/80 ${colors.icon}`}>
                              <ChallengeIcon size={20} />
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                 <h3 className={`font-bold ${isFailed ? 'text-red-400' : isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                                    {challenge.title}
                                 </h3>

                                 {/* Status Badge */}
                                 {isLocked && (
                                    <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] font-bold rounded uppercase">
                                       Locked
                                    </span>
                                 )}
                                 {isActive && (
                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded uppercase animate-pulse">
                                       Active
                                    </span>
                                 )}
                                 {isCompleted && (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                                       <CheckCircle2 size={10} /> Done
                                    </span>
                                 )}
                                 {isFailed && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">
                                       Failed
                                    </span>
                                 )}
                              </div>

                              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{challenge.description}</p>
                           </div>

                           {/* Timer */}
                           {!isCompleted && !isFailed && (
                              <div className="text-right shrink-0">
                                 <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {getTimeRemaining(challenge.expiresAt)}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Progress Bar (Active only) */}
                        {isActive && (
                           <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                 <span className="text-slate-400">Progress</span>
                                 <span className="text-white font-mono">{challenge.progress} / {challenge.target}</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                 <div
                                    className={`h-full transition-all rounded-full ${colors.text.replace('text-', 'bg-')}`}
                                    style={{ width: `${progressPercent}%` }}
                                 />
                              </div>
                           </div>
                        )}

                        {/* Bottom Row: Rewards + Action */}
                        <div className="flex items-center justify-between gap-4">
                           {/* Rewards Display */}
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                 <Zap size={14} className="text-emerald-400" />
                                 <span className="text-emerald-400 font-bold text-sm">+{challenge.xpReward}</span>
                                 <span className="text-slate-500 text-xs">XP</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                 <Coins size={14} className="text-yellow-400" />
                                 <span className="text-yellow-400 font-bold text-sm">+{challenge.coinReward}</span>
                              </div>
                           </div>

                           {/* Action Button */}
                           <div className="shrink-0">
                              {isLocked ? (
                                 <button
                                    onClick={() => onActivate(challenge.id)}
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${canAfford
                                          ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                                          : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/50'
                                       }`}
                                 >
                                    <Lock size={14} />
                                    {challenge.cost} <Coins size={12} className="text-yellow-400" />
                                 </button>
                              ) : isActive ? (
                                 <button
                                    onClick={() => onAttempt(challenge.id, challenge.type)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-all bg-gradient-to-r ${colors.bg} ${colors.border} hover:opacity-90`}
                                 >
                                    <Play size={14} fill="currentColor" />
                                    Attempt
                                 </button>
                              ) : isCompleted ? (
                                 <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                    <Sparkles size={14} />
                                    Claimed!
                                 </div>
                              ) : (
                                 <div className="text-red-400 text-sm font-medium flex items-center gap-1">
                                    <XCircle size={14} />
                                    -50 XP
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}

            {challenges.length === 0 && (
               <div className="py-16 text-center">
                  <Swords size={48} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-500">No challenges available today. Check back tomorrow!</p>
               </div>
            )}
         </div>

         {/* Warning Footer - Compact */}
         <div className="mt-4 p-3 bg-red-950/30 border border-red-900/40 rounded-lg flex items-center gap-3">
            <div className="p-1.5 bg-red-500/20 rounded-lg shrink-0">
               <XCircle className="text-red-500" size={16} />
            </div>
            <p className="text-red-300/80 text-xs">
               <span className="font-bold text-red-400">Warning:</span> Failing a challenge (time expires or low quiz score) costs <span className="font-bold text-white">50 XP</span>. Only accept if ready!
            </p>
         </div>
      </div>
   );
};
