
import React, { useState, useRef } from 'react';
import { generateSmartNotes, generateFlashcardsJSON } from '../services/geminiService';
import { Sparkles, BookOpen, Flame, Copy, Check, BrainCircuit, Download, Loader2, Gamepad2, Lock, X, PartyPopper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Deck } from '../types';

interface SmartNotesProps {
  onAddXp: (amount: number) => void;
  onSaveDeck: (deck: Deck) => void;
  userLevel?: number; // Optional now - not used for locking
  onNavigateToArcade?: () => void; // New prop for navigation
}

// Reuse styled markdown for consistency
const BeautifulMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 mt-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2 mt-6 mb-3 flex items-center gap-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-blue-300 mt-4 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-purple-300" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-yellow-500 pl-4 py-2 my-4 bg-yellow-500/5 rounded-r-lg italic text-slate-400" {...props} />
        ),
        ul: ({ node, ...props }) => <ul className="list-none space-y-2 mb-4" {...props} />,
        li: ({ node, ...props }) => (
          <li className="flex gap-2 text-slate-300 items-start">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
            <span {...props} />
          </li>
        ),
        code: ({ node, ...props }) => <code className="bg-slate-800 text-pink-400 px-1 rounded font-mono text-xs" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const SmartNotes: React.FC<SmartNotesProps> = ({ onAddXp, onSaveDeck, userLevel, onNavigateToArcade }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [pyqContent, setPyqContent] = useState('');
  const [usePyq, setUsePyq] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Deck Generation State
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [deckCreatedPopup, setDeckCreatedPopup] = useState<{ topic: string; cardCount: number } | null>(null);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const notesRef = useRef<HTMLDivElement>(null);

  // All features unlocked - no level restrictions
  const isPyqLocked = false;
  const isArcadeLocked = false;

  const handleGenerate = async () => {
    if (!topic || !content) return;
    setLoading(true);
    const finalPyq = usePyq ? pyqContent : "";

    // AI Call
    const notes = await generateSmartNotes(topic, content, finalPyq);
    setGeneratedNotes(notes);
    setLoading(false);

    // Gamification
    onAddXp(25);
  };

  const handleCreateDeck = async () => {
    if (isArcadeLocked) return;
    if (!topic || !content) return;

    // Check if notes have been generated first
    if (!generatedNotes) {
      setErrorPopup('Please generate notes first before creating a deck.');
      return;
    }

    setCreatingDeck(true);

    // AI Call for JSON
    const cardsData = await generateFlashcardsJSON(topic, content);

    if (cardsData && cardsData.length > 0) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        topic: topic,
        cards: cardsData.map((c: any, i: number) => ({
          id: i.toString(),
          front: c.front,
          back: c.back,
          status: 'new'
        })),
        createdAt: new Date().toISOString(),
        bestScore: 0
      };

      try {
        await onSaveDeck(newDeck);
        onAddXp(50); // Big reward
        setDeckCreatedPopup({ topic, cardCount: cardsData.length });
      } catch (err) {
        console.error('Failed to save deck:', err);
        setErrorPopup('Failed to save deck. Please try again.');
      }
    } else {
      setErrorPopup('Could not generate cards. Try adding more context to the content.');
    }

    setCreatingDeck(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!generatedNotes || !notesRef.current) return;
    setDownloading(true);

    try {
      const cloneDiv = document.createElement('div');
      cloneDiv.innerHTML = notesRef.current.innerHTML;
      Object.assign(cloneDiv.style, {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '700px',
        padding: '40px',
        backgroundColor: '#ffffff',
        color: '#1a202c',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        lineHeight: '1.5'
      });

      const headings = cloneDiv.querySelectorAll('h1, h2, h3');
      headings.forEach((el: any) => el.style.color = '#111827');
      const strongs = cloneDiv.querySelectorAll('strong');
      strongs.forEach((el: any) => el.style.color = '#000000');

      document.body.appendChild(cloneDiv);
      const canvas = await html2canvas(cloneDiv, { scale: 2, useCORS: true, logging: false });
      document.body.removeChild(cloneDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${topic.replace(/[^a-z0-9]/gi, '_')}.pdf`);

      onAddXp(10); // Download reward

    } catch (e) {
      console.error(e);
      alert("PDF Error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-yellow-400" /> Smart Notes
          </h2>
          <p className="text-slate-400 text-sm mt-1">Generate notes & flashcards from your text.</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1 block">Subject / Topic</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              placeholder="e.g. Java"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="flex-col flex">
            <label className="text-sm font-medium text-slate-300 mb-1 block">Content</label>
            <textarea
              className="w-full min-h-[120px] bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="Paste chapter text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div
              onClick={() => {
                if (!isPyqLocked) setUsePyq(!usePyq);
              }}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between ${isPyqLocked ? 'cursor-not-allowed opacity-70 bg-slate-950 border-slate-800' :
                usePyq ? 'bg-orange-500/10 border-orange-500/50 cursor-pointer' : 'bg-slate-950 border-slate-700 hover:border-slate-500 cursor-pointer'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${usePyq ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {isPyqLocked ? <Lock size={18} /> : <Flame size={18} />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${usePyq ? 'text-orange-400' : 'text-slate-300'}`}>PYQ Mode</p>
                  {isPyqLocked && <p className="text-[10px] text-red-400">Unlocks at Level 3</p>}
                </div>
              </div>
              {!isPyqLocked && <div className={`w-4 h-4 rounded-full border ${usePyq ? 'bg-orange-500 border-orange-500' : 'border-slate-600'}`}></div>}
            </div>

            {usePyq && !isPyqLocked && (
              <textarea
                className="w-full min-h-[80px] bg-slate-950 border border-orange-500/30 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                placeholder="Paste Previous Year Questions here..."
                value={pyqContent}
                onChange={(e) => setPyqContent(e.target.value)}
              />
            )}
          </div>

          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleGenerate}
              disabled={loading || !topic || !content}
              className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <BookOpen size={20} />}
              Generate
            </button>

            <button
              onClick={handleCreateDeck}
              disabled={creatingDeck || !topic || !content || isArcadeLocked}
              className={`px-4 py-3 border rounded-xl transition-all disabled:opacity-50 flex items-center justify-center ${isArcadeLocked
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                }`}
              title={isArcadeLocked ? "Requires Level 2" : "Create Flashcards for Arcade"}
            >
              {creatingDeck ? <Loader2 className="animate-spin" size={20} /> : isArcadeLocked ? <Lock size={20} /> : <Gamepad2 size={20} className="text-purple-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-full md:w-2/3 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[500px]">
        {!generatedNotes ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <BrainCircuit className="text-slate-700 mb-4" size={40} />
            <p>Notes will appear here.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-emerald-400">Generated Notes</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadPdf} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                  {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                </button>
                <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                  {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar h-full" ref={notesRef}>
              <BeautifulMarkdown content={generatedNotes} />
            </div>
          </>
        )}
      </div>

      {/* Deck Created Success Popup */}
      {deckCreatedPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Deck Created! 🎉</h3>
            <p className="text-slate-400 mb-2">
              <span className="text-primary-400 font-semibold">"{deckCreatedPopup.topic}"</span>
            </p>
            <p className="text-slate-500 text-sm mb-6">
              {deckCreatedPopup.cardCount} flashcards ready to study
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeckCreatedPopup(null)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeckCreatedPopup(null);
                  onNavigateToArcade?.();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Gamepad2 size={18} />
                Try Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Oops!</h3>
            <p className="text-slate-400 mb-6">{errorPopup}</p>
            <button
              onClick={() => setErrorPopup(null)}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
