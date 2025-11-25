import React from 'react';

interface LoadingProgressProps {
  current: number;
  total: number;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ current, total }) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-space-900/30 backdrop-blur border border-space-800/50 rounded-2xl text-center shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-quantum-500/5 blur-3xl -z-10"></div>

      <div className="mb-6 relative">
        <div className="relative h-24 w-24 mx-auto">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path
                    className="text-space-800"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Progress Circle */}
                <path
                    className="text-quantum-500 transition-all duration-500 ease-out"
                    strokeDasharray={`${percentage}, 100`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{Math.round(percentage)}%</span>
            </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-100 mb-2">Generating Interview Set</h3>
      <p className="text-sm text-slate-400 mb-6">
        Constructing complex queries for Space-Air-Ground Integration & Quantum ML...
      </p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-space-950 rounded-full border border-space-800">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-quantum-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-quantum-500"></span>
        </span>
        <span className="text-xs font-mono text-quantum-300">
            Fetching Batch: {Math.floor(current / 20) + 1}
        </span>
      </div>
    </div>
  );
};