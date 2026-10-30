
import React, { useState } from 'react';
import { PlannerEvent, StudySession } from '../types';
import { CalendarDays, Plus, Trash2, CheckCircle, Circle, Clock, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { generateStudySchedule } from '../services/geminiService';

interface PlannerProps {
  events: PlannerEvent[];
  studySessions: StudySession[];
  onAddEvent: (event: PlannerEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggleEvent: (id: string) => void;
  userLevel?: number; // Optional now - not used for locking
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const Planner: React.FC<PlannerProps> = ({ events, studySessions, onAddEvent, onDeleteEvent, onToggleEvent }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');

  // Manual Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [subject, setSubject] = useState('');

  // AI Form State
  const [aiSubjects, setAiSubjects] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // All features unlocked - no level restrictions
  const isAILocked = false;

  // --- MANUAL HANDLERS ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddEvent({
      id: Date.now().toString(),
      title,
      day: activeDay,
      time,
      subject: subject || 'General',
      completed: false,
      rewardClaimed: false
    });

    setTitle('');
    setSubject('');
    setShowModal(false);
  };

  const openAddModal = (day: string) => {
    setActiveDay(day);
    setShowModal(true);
  };

  // --- AI HANDLERS ---
  const handleAIGenerate = async () => {
    if (!aiSubjects) return;
    setIsGenerating(true);

    // 1. Analyze User Data for Best Time
    let context = "No prior study data. Assume standard study hours (09:00 - 17:00).";

    if (studySessions.length > 5) {
      // Calculate peak hour
      const hourCounts: Record<number, number> = {};
      studySessions.forEach(s => {
        const h = new Date(s.timestamp).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      });

      const bestHour = Object.keys(hourCounts).sort((a, b) => hourCounts[parseInt(b)] - hourCounts[parseInt(a)])[0];
      const bestH = parseInt(bestHour);
      const period = bestH < 12 ? "Morning" : bestH < 17 ? "Afternoon" : "Evening";

      context = `User data indicates peak productivity around ${bestH}:00 (${period}). Please schedule intensive tasks near this time.`;
    }

    // 2. Call AI
    const schedule = await generateStudySchedule(aiSubjects, context);

    // 3. Add events
    schedule.forEach((item: any, index: number) => {
      onAddEvent({
        id: Date.now().toString() + index,
        title: item.title,
        day: item.day,
        time: item.time,
        subject: item.subject,
        completed: false,
        rewardClaimed: false
      });
    });

    setIsGenerating(false);
    setShowAIModal(false);
    setAiSubjects('');
  };

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="text-primary-500" size={28} /> Weekly Planner
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Organize your study schedule and crush your goals.</p>
        </div>
        <button
          onClick={() => {
            if (isAILocked) return;
            setShowAIModal(true);
          }}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 transition-all border bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-900/20 border-purple-400/30 text-sm md:text-base"
        >
          <Sparkles size={18} className="text-yellow-300" />
          <span>AI Auto-Plan</span>
        </button>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {DAYS.map(day => (
            <div key={day} className="flex-1 min-w-[200px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Day Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <span className="font-bold text-white">{day}</span>
                <button
                  onClick={() => openAddModal(day)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-primary-400 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {events.filter(e => e.day === day).sort((a, b) => a.time.localeCompare(b.time)).map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-xl border transition-all group ${event.completed
                      ? 'bg-emerald-500/10 border-emerald-500/20 opacity-70'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Clock size={12} /> {event.time}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onToggleEvent(event.id)} className="text-slate-400 hover:text-emerald-400">
                          {event.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                        </button>
                        <button onClick={() => onDeleteEvent(event.id)} className="text-slate-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className={`font-bold text-sm ${event.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {event.title}
                    </h4>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-950 rounded text-[10px] text-slate-400 font-medium">
                      {event.subject}
                    </span>
                  </div>
                ))}

                {events.filter(e => e.day === day).length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-xs italic">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add Task to {activeDay}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500"
                  placeholder="e.g. Read Chapter 4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500"
                    placeholder="General"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Planner Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={100} className="text-purple-500" /></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> AI Study Planner
              </h3>
              <p className="text-slate-400 mb-6 text-sm">
                Tell me what courses you need to study, and I'll build a balanced schedule optimized for your best study times.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 font-bold mb-2">Subjects / Topics</label>
                  <textarea
                    value={aiSubjects}
                    onChange={(e) => setAiSubjects(e.target.value)}
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none resize-none"
                    placeholder="e.g. Calculus, World History, Intro to Java, Organic Chemistry..."
                  />
                </div>

                {studySessions.length > 5 && (
                  <div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg flex items-start gap-3">
                    <Clock size={16} className="text-purple-400 mt-0.5" />
                    <p className="text-xs text-purple-200">
                      I've analyzed your past sessions. I'll prioritize scheduling difficult tasks during your peak productivity hours.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAIModal(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium">Cancel</button>
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiSubjects || isGenerating}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : "Generate Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
