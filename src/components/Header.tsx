'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface HeaderProps {
  timeRemaining?: number;
  showTimer?: boolean;
}

export default function Header({ timeRemaining, showTimer }: HeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-lg">
            Rx
          </div>
          <div>
            <h1 className="font-semibold text-lg">PharmaRep Trainer</h1>
            <p className="text-xs text-slate-400">AI-Powered Sales Simulation</p>
          </div>
        </div>
        
        {showTimer && timeRemaining !== undefined && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl ${
            timeRemaining <= 30 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : 'bg-slate-700/50 text-slate-300'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>
    </header>
  );
}
