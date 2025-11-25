import React, { useState, useCallback, useRef } from 'react';
import { generateQuestionBatch } from './services/geminiService';
import { QuestionCard } from './components/QuestionCard';
import { LoadingProgress } from './components/LoadingProgress';
import { InterviewQuestion, RoleType, Topic } from './types';

// Constants
const TARGET_TOTAL = 100;
const BATCH_SIZE = 20; 

const App: React.FC = () => {
  // App State: 'SETUP' | 'PRACTICE'
  const [appMode, setAppMode] = useState<'SETUP' | 'PRACTICE'>('SETUP');
  
  // Data State
  const [role, setRole] = useState<RoleType>(RoleType.POSTDOC);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [filterTopic, setFilterTopic] = useState<string>('All');
  
  // Logic Refs
  const generationActive = useRef(false);

  const startPracticeSession = () => {
    setAppMode('PRACTICE');
    startGeneration();
  };

  const startGeneration = useCallback(async () => {
    if (generationActive.current) return;
    
    // Reset if starting fresh
    if (questions.length === 0) {
        setLoadedCount(0);
        setError(null);
    }

    setIsGenerating(true);
    generationActive.current = true;

    const totalBatches = Math.ceil(TARGET_TOTAL / BATCH_SIZE);
    
    // Loop through batches to reach target
    // We start from current batch index based on loaded count
    const startBatchIndex = Math.floor(loadedCount / BATCH_SIZE);

    for (let i = startBatchIndex; i < totalBatches; i++) {
        if (!generationActive.current) break;

        try {
            const newBatch = await generateQuestionBatch(role, BATCH_SIZE, i);
            
            setQuestions(prev => {
                const updated = [...prev, ...newBatch];
                setLoadedCount(updated.length);
                return updated;
            });

        } catch (err) {
            console.error("Batch failed", err);
            setError(`Network interruption on batch ${i+1}. Some questions may be missing.`);
            // Don't break completely, just stop generation loop so user can try 'continue'
            break; 
        }
    }

    generationActive.current = false;
    setIsGenerating(false);
  }, [role, loadedCount, questions.length]);

  const resetApp = () => {
    generationActive.current = false;
    setQuestions([]);
    setLoadedCount(0);
    setIsGenerating(false);
    setError(null);
    setAppMode('SETUP'); // Go back to landing page
  };

  const filteredQuestions = questions.filter(q => {
    if (filterTopic === 'All') return true;
    const search = filterTopic.toLowerCase();
    return q.category.toLowerCase().includes(search) || q.topic.toLowerCase().includes(search);
  });

  // --- RENDER: SETUP VIEW ---
  if (appMode === 'SETUP') {
    return (
        <div className="min-h-screen bg-space-950 text-slate-200 flex flex-col justify-center items-center p-4">
            <div className="max-w-2xl w-full animate-fade-in">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-quantum-500 to-galaxy-500 flex items-center justify-center font-bold text-4xl text-white mx-auto mb-6 shadow-lg shadow-quantum-500/30">
                        Q
                    </div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-quantum-300 via-white to-galaxy-300 mb-6">
                        QuantumSat Interview
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Prepare for roles in <span className="text-quantum-400 font-semibold">Quantum AI</span>, <span className="text-quantum-400 font-semibold">6G/NTN</span>, and <span className="text-galaxy-400 font-semibold">Academia</span>.
                        <br/>
                        We will generate a specialized set of <span className="text-white font-bold">100 bilingual questions</span> for you.
                    </p>
                </div>

                <div className="bg-space-900/50 backdrop-blur-sm border border-space-800 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Select Your Target Role</label>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.values(RoleType).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`relative p-4 rounded-xl text-left border transition-all duration-300 group ${
                                        role === r 
                                        ? 'bg-quantum-900/20 border-quantum-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                                        : 'bg-space-950 border-space-800 hover:border-space-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-semibold text-lg ${role === r ? 'text-quantum-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {r}
                                        </span>
                                        {role === r && (
                                            <div className="w-4 h-4 rounded-full bg-quantum-500 shadow-[0_0_10px_#06b6d4]"></div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startPracticeSession}
                        className="w-full bg-gradient-to-r from-quantum-600 to-galaxy-600 hover:from-quantum-500 hover:to-galaxy-500 text-white text-xl font-bold py-5 rounded-2xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <span>Start Loading 100 Questions</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                    <p className="text-center text-slate-500 text-sm mt-4">
                        Includes Technical (Quantum/6G) & Behavioral questions.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  // --- RENDER: PRACTICE VIEW ---
  return (
    <div className="min-h-screen bg-space-950 text-slate-200 pb-20">
      {/* Sticky Navbar with Stats */}
      <nav className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-md border-b border-space-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
             <div className="w-8 h-8 rounded bg-gradient-to-tr from-quantum-500 to-galaxy-500 flex items-center justify-center font-bold text-white text-sm">Q</div>
             <div className="hidden sm:block">
                 <h1 className="font-bold text-base leading-none text-white">QuantumSat</h1>
                 <span className="text-xs text-slate-500">{role}</span>
             </div>
          </div>
          
          {/* Top Progress Bar - Compact */}
          <div className="flex-1 max-w-md mx-4">
             <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Loaded: {loadedCount}/{TARGET_TOTAL}</span>
                {isGenerating && <span className="text-quantum-400 animate-pulse">Generating...</span>}
             </div>
             <div className="w-full bg-space-800 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-quantum-500 to-galaxy-500 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(loadedCount / TARGET_TOTAL) * 100}%` }}
                ></div>
             </div>
          </div>

          <button 
            onClick={resetApp}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-space-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 transition-colors"
          >
            End Session
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* State: Initial Loading (Empty List) */}
        {questions.length === 0 && isGenerating && (
             <div className="mt-20 flex flex-col items-center animate-fade-in">
                <LoadingProgress current={loadedCount} total={TARGET_TOTAL} />
             </div>
        )}

        {/* State: Content Visible */}
        {questions.length > 0 && (
            <div className="animate-fade-in-up">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-space-900/40 p-4 rounded-xl border border-space-800">
                    <div className="w-full sm:w-auto">
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">Filter Topic</label>
                        <select 
                            className="bg-space-950 border border-space-700 text-slate-200 text-sm rounded-lg focus:ring-quantum-500 focus:border-quantum-500 block w-full p-2.5"
                            value={filterTopic}
                            onChange={(e) => setFilterTopic(e.target.value)}
                        >
                            <option value="All">All Topics</option>
                            <option value="Technical">Technical (General)</option>
                            <option value="Quantum">Quantum AI / QML</option>
                            <option value="Satellite">6G / NTN / SAGINs</option>
                            <option value="Behavioral">Behavioral / Communication</option>
                        </select>
                    </div>
                    <div className="text-right">
                         <p className="text-2xl font-bold text-white">{filteredQuestions.length}</p>
                         <p className="text-xs text-slate-500">Visible Questions</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-sm text-red-200 bg-red-900/20 border border-red-800 rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={startGeneration} className="text-white underline hover:text-red-100">Try Continue</button>
                    </div>
                )}

                <div className="space-y-6">
                    {filteredQuestions.map((q, idx) => (
                        <QuestionCard key={q.id} question={q} index={idx} />
                    ))}
                </div>
                
                {/* Bottom Status */}
                {isGenerating && (
                    <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-500 mb-3"></div>
                        <p className="text-slate-500 text-sm">Analyzing current set & generating more questions...</p>
                    </div>
                )}
                
                {!isGenerating && loadedCount >= TARGET_TOTAL && (
                    <div className="py-12 text-center">
                        <div className="inline-block p-4 rounded-full bg-green-500/10 text-green-400 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Set Complete</h3>
                        <p className="text-slate-400 mt-2">You have loaded all 100 questions.</p>
                        <button onClick={resetApp} className="mt-6 px-6 py-2 bg-space-800 hover:bg-space-700 rounded-lg text-white font-medium transition-colors">
                            Start New Set
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;