
import React, { useState } from 'react';
import { PanicModule, PanicContent } from '../types';
import { generateSyllabusBreakdown, generatePanicContent, generateModuleInsight } from '../services/geminiService';
import { ResourceHub } from './ResourceHub';
import {
   AlertTriangle,
   BookOpen,
   BrainCircuit,
   CheckCircle2,
   ChevronRight,
   FileText,
   Loader2,
   ArrowLeft,
   Zap,
   Library,
   RotateCcw,
   BarChart,
   Target,
   Timer,
   Play,
   Pause
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- STYLED MARKDOWN COMPONENT ---
const BeautifulMarkdown: React.FC<{ content: string }> = ({ content }) => {
   return (
      <ReactMarkdown
         components={{
            h1: ({ node, ...props }) => <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6 mt-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white border-b-2 border-slate-800 pb-2 mt-8 mb-4 flex items-center gap-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-blue-400 mt-6 mb-3" {...props} />,
            p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-4 text-lg" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded" {...props} />,
            em: ({ node, ...props }) => <em className="italic text-purple-300" {...props} />,
            blockquote: ({ node, ...props }) => (
               <blockquote className="border-l-4 border-yellow-500 pl-4 py-2 my-6 bg-yellow-500/5 rounded-r-lg italic text-slate-200" {...props} />
            ),
            ul: ({ node, ...props }) => <ul className="list-none space-y-2 mb-6" {...props} />,
            li: ({ node, ...props }) => (
               <li className="flex gap-3 text-slate-300 items-start">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <span {...props} />
               </li>
            ),
            code: ({ node, ...props }) => <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />,
         }}
      >
         {content}
      </ReactMarkdown>
   );
};

interface PanicModeProps {
   onExit: () => void;
   onTimerClick?: () => void;
   isTimerActive?: boolean;
   timerTimeLeft?: number;
}

export const PanicMode: React.FC<PanicModeProps> = ({ onExit, onTimerClick, isTimerActive = false, timerTimeLeft = 0 }) => {
   // --- STATE ---
   const [step, setStep] = useState<'INTRO' | 'SETUP' | 'PLAN' | 'STUDY' | 'SUMMARY' | 'RESOURCES'>('INTRO');

   // Setup
   const [courseName, setCourseName] = useState('');
   const [syllabus, setSyllabus] = useState('');
   const [generatingPlan, setGeneratingPlan] = useState(false);

   // Plan
   const [modules, setModules] = useState<PanicModule[]>([]);

   // Study Active Module
   const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
   const [moduleContent, setModuleContent] = useState<PanicContent | null>(null);
   const [loadingContent, setLoadingContent] = useState(false);

   // Study Phase (NOTES -> QUIZ -> FLASHCARDS)
   const [studyPhase, setStudyPhase] = useState<'NOTES' | 'QUIZ' | 'FLASHCARDS'>('NOTES');

   // Quiz State
   const [quizIndex, setQuizIndex] = useState(0);
   const [quizScore, setQuizScore] = useState(0);
   const [quizAnswered, setQuizAnswered] = useState(false);

   // Flashcard State
   const [fcIndex, setFcIndex] = useState(0);
   const [fcFlipped, setFcFlipped] = useState(false);

   // Summary State
   const [insight, setInsight] = useState('');
   const [generatingInsight, setGeneratingInsight] = useState(false);

   // --- HANDLERS ---

   const handleGeneratePlan = async () => {
      if (!courseName || !syllabus) return;
      setGeneratingPlan(true);
      const plan = await generateSyllabusBreakdown(courseName, syllabus);
      setModules(plan);
      setGeneratingPlan(false);
      setStep('PLAN');
   };

   const startModule = async (module: PanicModule) => {
      setActiveModuleId(module.id);

      // Check if content already exists
      if (module.cachedContent) {
         setModuleContent(module.cachedContent);
         setStudyPhase('NOTES');
         setStep('STUDY');
         resetSessionStates();
         return;
      }

      setLoadingContent(true);
      setModuleContent(null);

      const content = await generatePanicContent(module.title, syllabus);

      // Save content to module for re-visiting
      if (content) {
         setModules(prev => prev.map(m => m.id === module.id ? { ...m, cachedContent: content } : m));
      }

      setModuleContent(content);
      setLoadingContent(false);
      setStudyPhase('NOTES');
      setStep('STUDY');

      resetSessionStates();
   };

   const resetSessionStates = () => {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setFcIndex(0);
      setFcFlipped(false);
   };

   const finishModule = async () => {
      setStep('SUMMARY');
      setGeneratingInsight(true);

      // Generate simple insight
      const module = modules.find(m => m.id === activeModuleId);
      if (module && moduleContent) {
         const text = await generateModuleInsight(module.title, quizScore, moduleContent.quiz.length);
         setInsight(text);

         // Mark complete
         setModules(prev => prev.map(m => m.id === activeModuleId ? { ...m, status: 'completed' } : m));
      }
      setGeneratingInsight(false);
   };

   const returnToPlan = () => {
      setStep('PLAN');
      setActiveModuleId(null);
   };

   // Format timer time
   const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
   };

   // Deep Focus Timer Button - Floating button in top-right
   const renderTimerButton = () => (
      <button
         onClick={onTimerClick}
         className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all hover:scale-105 ${isTimerActive
            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x border border-purple-400/30'
            : 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border border-purple-500/30 hover:from-purple-500 hover:to-blue-500'
            }`}
         title="Focus Timer"
      >
         {/* Timer Icon with glow */}
         <div className={`relative ${isTimerActive ? 'animate-pulse' : ''}`}>
            <Timer size={20} className="text-white" />
            {isTimerActive && (
               <div className="absolute inset-0 bg-white/30 rounded-full blur-sm animate-ping"></div>
            )}
         </div>

         {/* Timer Display */}
         <span className="text-white font-mono font-bold text-sm">
            {formatTime(timerTimeLeft)}
         </span>

         {/* Status indicator */}
         {isTimerActive && (
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
         )}
      </button>
   );

   // --- RENDERERS ---

   // 0. INTRO SCREEN - Animated Welcome
   if (step === 'INTRO') {
      return (
         <>
            <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
               {/* Animated Background Elements */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
               </div>

               {/* Main Content */}
               <div className="relative z-10 max-w-lg text-center animate-fade-in">
                  {/* Animated Icon */}
                  <div className="relative mx-auto mb-8">
                     <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/30 relative">
                        <Target size={48} className="text-purple-400" />
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping"></div>
                        <div className="absolute -inset-3 rounded-full border border-blue-500/20 animate-pulse"></div>
                     </div>

                     {/* Floating icons around */}
                     <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                        <BrainCircuit size={20} className="text-emerald-400" />
                     </div>
                     <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                        <Zap size={20} className="text-yellow-400" />
                     </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">Deep Focus</span> Activated
                  </h1>

                  {/* Message */}
                  <div className="bg-slate-900/60 backdrop-blur border border-purple-500/20 rounded-2xl p-6 mb-8 shadow-2xl shadow-purple-900/20">
                     <p className="text-lg text-white mb-4 font-medium">
                        🔕 Distracting features have been blocked
                     </p>
                     <p className="text-purple-300 leading-relaxed">
                        It's time to focus, study hard, and <span className="text-emerald-400 font-bold">ace your exams!</span>
                     </p>
                     <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 flex items-center gap-1">
                           <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span> Music Paused
                        </span>
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 flex items-center gap-1">
                           <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span> Gamification Off
                        </span>
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 flex items-center gap-1">
                           <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Pure Study Mode
                        </span>
                     </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                     <button
                        onClick={() => setStep('SETUP')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                     >
                        <Zap size={20} /> I'm Ready!
                     </button>
                     <button
                        onClick={onExit}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                     >
                        <ArrowLeft size={20} /> Go Back
                     </button>
                  </div>

                  {/* Motivational footer */}
                  <p className="mt-8 text-sm text-slate-500 italic">
                     "Success is the sum of small efforts, repeated day in and day out."
                  </p>
               </div>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // 1. SETUP SCREEN
   if (step === 'SETUP') {
      return (
         <>
            <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in relative bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 overflow-y-auto">
               <div className="absolute top-6 left-6 z-10">
                  <button onClick={onExit} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                     <ArrowLeft size={20} /> Exit Focus Mode
                  </button>
               </div>

               <div className="max-w-xl w-full my-auto">
                  <div className="flex flex-col items-center text-center mb-8">
                     <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 mb-4">
                        <Target size={48} className="text-purple-400" />
                     </div>
                     <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Deep Focus Mode</h1>
                     <p className="text-purple-300/80">Distraction-free intensive study session</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur border border-purple-500/20 p-8 rounded-2xl shadow-2xl shadow-purple-900/20">
                     <div className="space-y-6">
                        <div>
                           <label className="block text-slate-300 text-sm font-bold mb-2">Course Name</label>
                           <input
                              type="text"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                              placeholder="e.g., Data Structures & Algorithms"
                              value={courseName}
                              onChange={(e) => setCourseName(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-slate-300 text-sm font-bold mb-2">Syllabus / Topics</label>
                           <textarea
                              className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none resize-none transition-colors"
                              placeholder="Paste your syllabus list here..."
                              value={syllabus}
                              onChange={(e) => setSyllabus(e.target.value)}
                           />
                        </div>
                        <button
                           onClick={handleGeneratePlan}
                           disabled={!courseName || !syllabus || generatingPlan}
                           className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/30"
                        >
                           {generatingPlan ? <Loader2 className="animate-spin" /> : <BrainCircuit size={24} />}
                           Generate Study Plan
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // 4. RESOURCE HUB ACCESS
   if (step === 'RESOURCES') {
      return (
         <>
            <div className="h-full flex flex-col p-6 animate-fade-in bg-slate-950">
               <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setStep('PLAN')} className="flex items-center gap-2 text-slate-400 hover:text-white">
                     <ArrowLeft size={20} /> Back to Plan
                  </button>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <Library /> Reference Materials
                  </h2>
               </div>
               <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
                  <ResourceHub />
               </div>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // 2. PLAN DASHBOARD
   if (step === 'PLAN') {
      const completedCount = modules.filter(m => m.status === 'completed').length;
      const progress = (completedCount / modules.length) * 100;

      return (
         <>
            <div className="h-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950">
               <div className="max-w-4xl mx-auto p-6 flex flex-col animate-fade-in min-h-full">
                  <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{courseName}</h2>
                        <div className="flex items-center gap-3 text-slate-400">
                           <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30 font-bold uppercase">Focus Mode Active</span>
                           <span>{completedCount}/{modules.length} Modules Done</span>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setStep('RESOURCES')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors">
                           <Library size={18} /> Resources
                        </button>
                        <button onClick={onExit} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg border border-slate-700 transition-colors">
                           Exit
                        </button>
                     </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-4 rounded-full mb-8 overflow-hidden border border-slate-800 shrink-0">
                     <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>

                  {/* Modules List */}
                  <div className="grid gap-4 pb-20">
                     {modules.map((module, idx) => (
                        <div
                           key={module.id}
                           className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${module.status === 'completed'
                              ? 'bg-slate-900/50 border-emerald-500/30'
                              : 'bg-slate-900 border-slate-700 hover:border-purple-500'
                              }`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${module.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-purple-500/20 text-purple-400'
                                 }`}>
                                 {module.status === 'completed' ? <CheckCircle2 size={20} /> : idx + 1}
                              </div>
                              <h3 className={`text-xl font-bold ${module.status === 'completed' ? 'text-slate-300' : 'text-white'}`}>
                                 {module.title}
                              </h3>
                           </div>

                           <button
                              onClick={() => startModule(module)}
                              disabled={loadingContent}
                              className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all ${module.status === 'completed'
                                 ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700'
                                 : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-900/30'
                                 }`}
                           >
                              {loadingContent && activeModuleId === module.id ? <Loader2 className="animate-spin" /> : (module.status === 'completed' ? "Review" : "Start")}
                              {!loadingContent && <ChevronRight />}
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // 5. SUMMARY SCREEN
   if (step === 'SUMMARY') {
      return (
         <>
            <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in bg-slate-950 overflow-y-auto">
               <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl my-auto">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 size={48} />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-2">Module Complete!</h2>
                  <p className="text-slate-400 mb-8">{modules.find(m => m.id === activeModuleId)?.title}</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-slate-800 p-4 rounded-xl">
                        <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Quiz Score</span>
                        <div className="text-3xl font-bold text-white">
                           {quizScore} <span className="text-lg text-slate-500">/ {moduleContent?.quiz.length}</span>
                        </div>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-xl">
                        <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Status</span>
                        <div className="text-xl font-bold text-emerald-400 mt-1">
                           Analyzed
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl text-left mb-8">
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <BrainCircuit size={20} className="text-purple-400" /> AI Analysis
                     </h3>
                     <p className="text-slate-300 leading-relaxed">
                        {generatingInsight ? (
                           <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Analyzing performance...</span>
                        ) : (
                           insight
                        )}
                     </p>
                  </div>

                  <button
                     onClick={returnToPlan}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-900/20 transition-all"
                  >
                     Continue to Plan
                  </button>
               </div>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // 3. STUDY INTERFACE (Notes -> Quiz -> Flashcards)
   if (step === 'STUDY' && moduleContent) {
      return (
         <>
            <div className="h-full flex flex-col p-4 md:p-6 animate-fade-in bg-slate-950 overflow-hidden">
               {/* Study Header */}
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-4">
                     <button onClick={() => setStep('PLAN')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <ArrowLeft />
                     </button>
                     <div>
                        <h2 className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-md">
                           {modules.find(m => m.id === activeModuleId)?.title}
                        </h2>
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                           {/* Phase Pills */}
                           <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${studyPhase === 'NOTES' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1. Read Notes</span>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${studyPhase === 'QUIZ' ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500'}`}>2. Quiz</span>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${studyPhase === 'FLASHCARDS' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>3. Flashcards</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* CONTENT AREA */}
               <div className="flex-1 overflow-hidden relative flex flex-col">

                  {/* 1. NOTES PHASE */}
                  {studyPhase === 'NOTES' && (
                     <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-6 bg-slate-900 rounded-2xl border border-slate-800">
                           <BeautifulMarkdown content={moduleContent.notesMarkdown} />
                        </div>
                        <div className="mt-4 flex justify-end shrink-0">
                           <button
                              onClick={() => setStudyPhase('QUIZ')}
                              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
                           >
                              Take Quiz <ChevronRight />
                           </button>
                        </div>
                     </div>
                  )}

                  {/* 2. QUIZ PHASE */}
                  {studyPhase === 'QUIZ' && (
                     <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full overflow-y-auto custom-scrollbar">
                        <div className="w-full bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-2xl mb-6 shadow-xl my-auto">
                           <div className="flex justify-between text-slate-400 text-sm mb-4">
                              <span>Question {quizIndex + 1} of {moduleContent.quiz.length}</span>
                              <span>Score: {quizScore}</span>
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-white mb-8">{moduleContent.quiz[quizIndex].question}</h3>
                           <div className="space-y-3">
                              {moduleContent.quiz[quizIndex].options.map((opt, i) => {
                                 let bgClass = "bg-slate-800 border-slate-700 hover:bg-slate-700";
                                 if (quizAnswered) {
                                    if (opt === moduleContent.quiz[quizIndex].correctAnswer) bgClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                    else bgClass = "opacity-50";
                                 }
                                 return (
                                    <button
                                       key={i}
                                       onClick={() => {
                                          if (quizAnswered) return;
                                          setQuizAnswered(true);
                                          if (opt === moduleContent.quiz[quizIndex].correctAnswer) setQuizScore(s => s + 1);
                                       }}
                                       disabled={quizAnswered}
                                       className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all text-white ${bgClass}`}
                                    >
                                       {opt}
                                    </button>
                                 )
                              })}
                           </div>
                        </div>
                        {quizAnswered && (
                           <button
                              onClick={() => {
                                 if (quizIndex < moduleContent.quiz.length - 1) {
                                    setQuizIndex(p => p + 1);
                                    setQuizAnswered(false);
                                 } else {
                                    setStudyPhase('FLASHCARDS');
                                 }
                              }}
                              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl mb-8"
                           >
                              {quizIndex < moduleContent.quiz.length - 1 ? "Next Question" : "Start Flashcards"}
                           </button>
                        )}
                     </div>
                  )}

                  {/* 3. FLASHCARDS PHASE */}
                  {studyPhase === 'FLASHCARDS' && (
                     <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full overflow-y-auto">
                        <div className="w-full aspect-[3/2] relative cursor-pointer perspective-1000 mb-8 my-auto" onClick={() => setFcFlipped(!fcFlipped)}>
                           <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${fcFlipped ? 'rotate-y-180' : ''}`}>
                              {/* Front */}
                              <div className="absolute inset-0 bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl z-10">
                                 <span className="text-purple-400 font-bold uppercase text-xs tracking-widest mb-4">Concept</span>
                                 <h3 className="text-2xl md:text-3xl font-bold text-white">{moduleContent.flashcards[fcIndex].front}</h3>
                                 <p className="absolute bottom-6 text-slate-500 text-xs animate-pulse">Tap to Flip</p>
                              </div>
                              {/* Back */}
                              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl z-10">
                                 <span className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Definition</span>
                                 <p className="text-lg md:text-xl text-white">{moduleContent.flashcards[fcIndex].back}</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                           <button
                              onClick={() => {
                                 if (fcIndex > 0) {
                                    setFcIndex(p => p - 1);
                                    setFcFlipped(false);
                                 }
                              }}
                              disabled={fcIndex === 0}
                              className="px-6 py-3 bg-slate-800 text-white rounded-xl disabled:opacity-50"
                           >
                              Previous
                           </button>
                           <button
                              onClick={() => {
                                 if (fcIndex < moduleContent.flashcards.length - 1) {
                                    setFcIndex(p => p + 1);
                                    setFcFlipped(false);
                                 } else {
                                    finishModule();
                                 }
                              }}
                              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                           >
                              {fcIndex < moduleContent.flashcards.length - 1 ? "Next Card" : "See Summary"}
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
            </div>
            {renderTimerButton()}
         </>
      );
   }

   // Fallback (Loading or Error)
   return <div className="flex items-center justify-center h-full text-white"><Loader2 className="animate-spin" /></div>;
};
