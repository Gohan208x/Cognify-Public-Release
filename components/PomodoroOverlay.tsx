
import React, { useEffect } from 'react';
import { TimerState } from '../types';
import { Play, Pause, X, Coffee, Brain, RotateCcw, Settings, Timer } from 'lucide-react';

interface PomodoroOverlayProps {
  timer: TimerState;
  onToggle: () => void;
  onStop: () => void;
  onUpdateSettings: (focusMin: number, breakMin: number) => void;
  onCompleteBreak: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PomodoroOverlay: React.FC<PomodoroOverlayProps> = ({
  timer,
  onToggle,
  onStop,
  onUpdateSettings,
  onCompleteBreak,
  isOpen = false,
  onClose
}) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [tempFocus, setTempFocus] = React.useState(timer.durationFocus);
  const [tempBreak, setTempBreak] = React.useState(timer.durationBreak);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = timer.mode === 'FOCUS'
    ? ((timer.durationFocus * 60 - timer.timeLeft) / (timer.durationFocus * 60)) * 100
    : ((timer.durationBreak * 60 - timer.timeLeft) / (timer.durationBreak * 60)) * 100;

  // --- FULL SCREEN BREAK MODE ---
  if (timer.mode === 'BREAK') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-center animate-fade-in p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 pointer-events-none"></div>

        <div className="mb-8 p-6 bg-slate-900 rounded-full border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20 relative">
          <Coffee size={64} className="text-emerald-400 animate-bounce" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Time to Relax</h1>
        <p className="text-slate-400 text-xl mb-12 max-w-md">
          Step away from the screen. Stretch, drink water, or just breathe. The app is paused for you.
        </p>

        <div className="text-8xl font-mono font-bold text-emerald-400 mb-12 relative">
          {formatTime(timer.timeLeft)}
          <span className="text-sm absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-500 uppercase tracking-widest font-sans">Break Timer</span>
        </div>

        <button
          onClick={onCompleteBreak}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <X size={20} /> Skip Break
        </button>
      </div>
    );
  }

  // --- SETTINGS MODAL ---
  if (showSettings) {
    return (
      <div className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings size={20} /> Timer Settings
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Focus Duration (min)</label>
              <input
                type="number"
                value={tempFocus}
                onChange={(e) => setTempFocus(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Break Duration (min)</label>
              <input
                type="number"
                value={tempBreak}
                onChange={(e) => setTempBreak(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowSettings(false)} className="flex-1 py-2 bg-slate-800 text-white rounded-lg">Cancel</button>
            <button
              onClick={() => { onUpdateSettings(tempFocus, tempBreak); setShowSettings(false); }}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-bold"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TIMER CONTROLS PANEL (shown when isOpen) ---
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl w-full max-w-xs">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-orange-400" />
              <span className="text-sm font-bold text-white">Focus Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white p-1">
                <Settings size={16} />
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={timer.isActive ? "#f97316" : "#475569"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-white">{formatTime(timer.timeLeft)}</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">
                  {timer.isActive ? 'Focusing' : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={onToggle}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${timer.isActive
                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
            >
              {timer.isActive ? <Pause size={20} /> : <Play size={20} />}
              {timer.isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={onStop}
              className="p-3 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-colors"
              title="Reset Timer"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not showing anything
  return null;
};
