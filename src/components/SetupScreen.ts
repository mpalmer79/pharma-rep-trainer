'use client';

import React from 'react';
import { Drug, Persona } from '@/types';
import { Clock, Brain, Shield } from 'lucide-react';

interface SetupScreenProps {
  drugs: Drug[];
  personas: Persona[];
  selectedDrug: string;
  selectedPersona: string;
  onDrugSelect: (drugId: string) => void;
  onPersonaSelect: (personaId: string) => void;
  onStart: () => void;
}

export default function SetupScreen({
  drugs,
  personas,
  selectedDrug,
  selectedPersona,
  onDrugSelect,
  onPersonaSelect,
  onStart,
}: SetupScreenProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Configure Your Training
        </h2>
        <p className="text-slate-400">Select a product and physician persona to begin your simulation</p>
      </div>

      {/* Drug Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Select Product
        </label>
        <div className="grid gap-3">
          {drugs.map(drug => (
            <button
              key={drug.id}
              onClick={() => onDrugSelect(drug.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedDrug === drug.id 
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30' 
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{drug.name}</h3>
                  <p className="text-sm text-slate-400">{drug.category} • {drug.indication}</p>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDrug === drug.id ? 'border-blue-400 bg-blue-400' : 'border-slate-500'
                }`}>
                  {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{drug.keyData}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Persona Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Select Physician
        </label>
        <div className="grid gap-3">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={() => onPersonaSelect(persona.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedPersona === persona.id 
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30' 
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex gap-4 items-start">
                <span className="text-3xl">{persona.avatar}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{persona.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getDifficultyColor(persona.difficulty)}`}>
                          {persona.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{persona.title}</p>
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPersona === persona.id ? 'border-blue-400 bg-blue-400' : 'border-slate-500'
                    }`}>
                      {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{persona.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!selectedDrug}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Training Session
      </button>
    </div>
  );
}
