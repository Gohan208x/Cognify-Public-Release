
import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import {
  Gamepad2,
  PlayCircle,
  Trash2,
  Trophy,
  Timer,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Brain,
  Grid3X3,
  HelpCircle,
  Menu
} from 'lucide-react';

interface StudyArcadeProps {
  decks: Deck[];
  onAddXp: (amount: number, coins: number) => void;
  onDeleteDeck: (id: string) => void;
  onOpenTimer: () => void;
  onSessionComplete: (subject: string, type: 'QUIZ' | 'FLASHCARD' | 'MEMORY', score: number, duration: number) => void;
}

interface MemoryCard {
  id: string;
  content: string;
  type: 'FRONT' | 'BACK';
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const StudyArcade: React.FC<StudyArcadeProps> = ({ decks, onAddXp, onDeleteDeck, onOpenTimer, onSessionComplete }) => {
  const [view, setView] = useState<'MENU' | 'FLASHCARD' | 'MEMORY' | 'QUIZ'>('MENU');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  // Game States
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);

  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Timer for session duration tracking
  const [startTime, setStartTime] = useState<number>(0);

  // Outcome States
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // --- ACTIONS ---

  const resetToMenu = () => {
    setView('MENU');
    setActiveDeck(null);
    setGameOver(false);
    setMemoryCards([]);
    setQuizQuestions([]);
  };

  const initSession = () => {
    setStartTime(Date.now());
  };

  // --- GAME STARTERS ---

  const startFlashcards = (deck: Deck) => {
    setActiveDeck(deck);
    setCardIndex(0);
    setIsFlipped(false);
    setScore(0);
    setGameOver(false);
    setView('FLASHCARD');
    initSession();
  };

  const startMemory = (deck: Deck) => {
    setActiveDeck(deck);
    setGameOver(false);
    setMemoryMoves(0);
    setSelectedCards([]);
    initSession();

    // Take first 6 cards (12 tiles max)
    const pairs = deck.cards.slice(0, 6);
    const gameCards: MemoryCard[] = [];

    pairs.forEach((card, idx) => {
      gameCards.push({ id: `f-${idx}`, content: card.front, type: 'FRONT', matchId: card.id, isFlipped: false, isMatched: false });
      gameCards.push({ id: `b-${idx}`, content: card.back, type: 'BACK', matchId: card.id, isFlipped: false, isMatched: false });
    });

    gameCards.sort(() => Math.random() - 0.5);
    setMemoryCards(gameCards);
    setView('MEMORY');
  };

  const startQuiz = (deck: Deck) => {
    setActiveDeck(deck);
    setGameOver(false);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    initSession();

    const questions: QuizQuestion[] = deck.cards.map((card) => {
      const distractors = deck.cards
        .filter(c => c.id !== card.id)
        .map(c => c.back)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Fill with dummy if not enough distractors
      while (distractors.length < 3) {
        distractors.push("N/A");
      }

      const options = [...distractors, card.back].sort(() => 0.5 - Math.random());
      return { question: card.front, options, correctAnswer: card.back };
    });

    setQuizQuestions(questions);
    setView('QUIZ');
  };

  // --- GAME LOGIC HANDLERS ---

  const handleFlashcardAnswer = (correct: boolean) => {
    if (correct) setScore(s => s + 1);

    if (activeDeck && cardIndex < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCardIndex(prev => prev + 1), 200);
    } else {
      finishGame(correct ? score + 1 : score, activeDeck!.cards.length, 'FLASHCARD');
    }
  };

  const handleMemoryCardClick = (card: MemoryCard) => {
    if (card.isMatched || card.isFlipped || selectedCards.length >= 2) return;

    // Flip
    const updatedCards = memoryCards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setMemoryCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // Match Check
    if (newSelected.length === 2) {
      setMemoryMoves(m => m + 1);
      const [c1, c2] = newSelected;

      if (c1.matchId === c2.matchId) {
        // Matched
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c =>
            c.id === c1.id || c.id === c2.id ? { ...c, isMatched: true, isFlipped: true } : c
          ));
          setSelectedCards([]);

          // Check Win
          if (updatedCards.every(c => c.isMatched || c.id === c1.id || c.id === c2.id)) {
            finishGame(100, 100, 'MEMORY');
          }
        }, 500);
      } else {
        // Fail
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c =>
            c.id === c1.id || c.id === c2.id ? { ...c, isFlipped: false } : c
          ));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const handleQuizAnswer = (selected: string) => {
    if (quizAnswered) return;
    setQuizAnswered(true);

    const correct = selected === quizQuestions[quizIndex].correctAnswer;
    if (correct) setQuizScore(s => s + 1);

    setTimeout(() => {
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex(prev => prev + 1);
        setQuizAnswered(false);
      } else {
        finishGame(correct ? quizScore + 1 : quizScore, quizQuestions.length, 'QUIZ');
      }
    }, 1500);
  };

  const finishGame = (finalScore: number, total: number, mode: 'QUIZ' | 'FLASHCARD' | 'MEMORY') => {
    setGameOver(true);
    let xp = 0;
    let coins = 0;
    let percentage = 0;

    if (mode === 'FLASHCARD' || mode === 'QUIZ') {
      percentage = (finalScore / total) * 100;
      xp = Math.floor(finalScore * 10);
      coins = Math.floor(percentage / 2);
    } else {
      percentage = 100;
      xp = 150;
      coins = 80;
    }

    setXpEarned(xp);
    setCoinsEarned(coins);
    onAddXp(xp, coins);

    // Analytics Tracking
    const duration = Math.round((Date.now() - startTime) / 1000);
    onSessionComplete(activeDeck?.topic || 'General', mode, Math.round(percentage), duration);
  };

  // --- RENDER ---

  if (gameOver) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-slide-up text-center relative overflow-hidden">
        {/* Confetti Effect Simulation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random()}s`
            }}></div>
          ))}
        </div>

        <Trophy size={80} className="text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
        <h2 className="text-4xl font-bold text-white mb-2">Victory!</h2>
        <div className="flex gap-8 mb-8 z-10">
          <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl">
            <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold">XP Earned</span>
            <span className="text-2xl font-bold text-emerald-400">+{xpEarned} XP</span>
          </div>
          <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl">
            <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold">Coins Found</span>
            <span className="text-2xl font-bold text-yellow-400">+{coinsEarned}</span>
          </div>
        </div>
        <div className="flex gap-4 z-10">
          <button onClick={resetToMenu} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg transition-all">Back to Arcade</button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  if (view === 'QUIZ' && activeDeck) {
    const currentQ = quizQuestions[quizIndex];
    return (
      <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <button onClick={resetToMenu} className="text-slate-400 hover:text-white flex items-center gap-2"><ArrowLeft /> Quit</button>
          <span className="text-lg font-bold text-slate-300">Question {quizIndex + 1} / {quizQuestions.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl mb-8 shadow-xl">
          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQ.question}</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {currentQ.options.map((option, idx) => {
            let btnClass = "bg-slate-800 border-slate-700 hover:border-primary-500 hover:bg-slate-700";
            if (quizAnswered) {
              if (option === currentQ.correctAnswer) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              else btnClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
            }
            return (
              <button key={idx} onClick={() => handleQuizAnswer(option)} disabled={quizAnswered} className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass} text-white`}>{option}</button>
            );
          })}
        </div>
      </div>
    );
  }

  // MEMORY VIEW
  if (view === 'MEMORY' && activeDeck) {
    return (
      <div className="h-full flex flex-col max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <button onClick={resetToMenu} className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft size={20} /> Quit</button>
          <div className="text-xl font-bold text-purple-400 font-mono">{memoryMoves} Moves</div>
        </div>
        <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4 auto-rows-fr">
          {memoryCards.map((card) => {
            const showContent = card.isMatched || card.isFlipped;
            return (
              <button
                key={card.id}
                onClick={() => handleMemoryCardClick(card)}
                disabled={card.isMatched || card.isFlipped}
                className={`relative rounded-xl transition-all duration-300 flex items-center justify-center p-2 text-center border-2 shadow-lg overflow-hidden
                   ${card.isMatched
                    ? 'bg-emerald-500/10 border-emerald-500 opacity-80'
                    : showContent
                      ? 'bg-slate-900 border-purple-500'
                      : 'bg-slate-800 border-slate-700 hover:border-purple-400'
                  }
                 `}
              >
                {showContent ? (
                  <span className="text-xs md:text-sm font-bold text-white overflow-hidden leading-tight animate-fade-in">{card.content}</span>
                ) : (
                  <Brain size={32} className="text-slate-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // FLASHCARD VIEW
  if (view === 'FLASHCARD' && activeDeck) {
    const card = activeDeck.cards[cardIndex];
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6 text-slate-400">
          <button onClick={resetToMenu} className="hover:text-white"><ArrowLeft /></button>
          <span>Card {cardIndex + 1} of {activeDeck.cards.length}</span>
        </div>
        <div
          className="w-full aspect-[3/2] relative cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl z-10">
              <span className="text-primary-500 font-bold tracking-widest text-xs uppercase mb-4">Question</span>
              <p className="text-2xl font-bold text-white">{card.front}</p>
              <p className="absolute bottom-6 text-slate-500 text-xs animate-pulse">Tap to Flip</p>
            </div>
            <div className="absolute inset-0 bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl z-10">
              <span className="text-emerald-500 font-bold tracking-widest text-xs uppercase mb-4">Answer</span>
              <p className="text-xl text-slate-200">{card.back}</p>
            </div>
          </div>
        </div>
        <div className={`flex gap-4 mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={(e) => { e.stopPropagation(); handleFlashcardAnswer(false); }} className="px-6 py-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"><XCircle /> Missed</button>
          <button onClick={(e) => { e.stopPropagation(); handleFlashcardAnswer(true); }} className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-xl flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 /> Got it</button>
        </div>
        <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
      </div>
    );
  }

  // MENU VIEW
  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Gamepad2 className="text-purple-400" size={32} /> Study Arcade
        </h2>
        <p className="text-slate-400 mt-1">Gamified learning. Earn XP and Coins.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-4 custom-scrollbar">
        {decks.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <Gamepad2 size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400">Your Arcade is Empty</p>
            <p className="text-sm">Go to <span className="text-primary-400 font-bold">Smart Notes</span> and generate a Deck.</p>
          </div>
        ) : (
          decks.map((deck) => (
            <div key={deck.id} className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); onDeleteDeck(deck.id); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors shadow-lg border border-slate-700"><Trash2 size={18} /></button>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white line-clamp-1" title={deck.topic}>{deck.topic}</h3>
                <p className="text-slate-500 text-sm">{deck.cards.length} Cards • {new Date(deck.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2">
                <button onClick={() => startFlashcards(deck)} className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1 transition-all border border-slate-700"><PlayCircle size={18} className="text-blue-400" /> Flashcards</button>
                <button onClick={() => startMemory(deck)} className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1 transition-all border border-slate-700"><Grid3X3 size={18} className="text-purple-400" /> Match</button>
                <button onClick={() => startQuiz(deck)} className="py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1 transition-all border border-slate-700"><HelpCircle size={18} className="text-emerald-400" /> Quiz</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div >
  );
};
