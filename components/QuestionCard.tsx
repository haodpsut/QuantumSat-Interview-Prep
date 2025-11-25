import React, { useState } from 'react';
import { InterviewQuestion } from '../types';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(false);

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-6 mb-4 hover:border-quantum-500/30 transition-all duration-300 shadow-lg shadow-black/40">
      {/* Header: Badge & Difficulty */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <span className="bg-space-800 text-slate-400 text-xs font-mono px-2 py-1 rounded">
                #{index + 1}
            </span>
            <span className="bg-galaxy-500/20 text-galaxy-400 text-xs font-semibold px-2 py-1 rounded border border-galaxy-500/20">
            {question.topic}
            </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium border ${
            question.difficulty === 'Hard' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
            question.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
            'border-green-500/30 text-green-400 bg-green-500/10'
        }`}>
            {question.difficulty}
        </span>
      </div>

      {/* Question Content */}
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
            {showVietnamese ? question.vi.question : question.en.question}
        </h3>
      </div>

      {/* Answer Section (Collapsible) */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 bg-space-950 rounded-lg border border-space-800 mt-2">
            <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                Suggested Answer ({showVietnamese ? 'VI' : 'EN'})
            </h4>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {showVietnamese ? question.vi.answer : question.en.answer}
            </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-space-800">
        <button 
            onClick={() => setShowVietnamese(!showVietnamese)}
            className="text-sm text-slate-400 hover:text-quantum-400 flex items-center gap-2 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {showVietnamese ? 'Switch to English' : 'Dịch sang Tiếng Việt'}
        </button>

        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isOpen 
                ? 'bg-space-800 text-slate-300 hover:bg-space-700' 
                : 'bg-quantum-600 text-white hover:bg-quantum-500 hover:shadow-lg hover:shadow-quantum-500/20'
            }`}
        >
            {isOpen ? 'Hide Answer' : 'Show Answer'}
        </button>
      </div>
    </div>
  );
};
