import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Lightbulb,
  CheckCircle2,
  ListPlus,
  HelpCircle,
  Volume2,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import { CandidateWord, RecoveryData } from '../types';

interface RecoverySuggestionsPanelProps {
  recoveryData?: RecoveryData;
  activeCandidate: string;
  onSelectCandidate: (word: string) => void;
  onAcceptSuggestion: () => void;
  onKeepUncertain: () => void;
  isAccepted: boolean;
  isKeptUncertain: boolean;
}

export const RecoverySuggestionsPanel: React.FC<RecoverySuggestionsPanelProps> = ({
  recoveryData,
  activeCandidate,
  onSelectCandidate,
  onAcceptSuggestion,
  onKeepUncertain,
  isAccepted,
  isKeptUncertain,
}) => {
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);

  const defaultCandidates: CandidateWord[] = [
    { word: 'sauce', score: 0.78, phoneticMatch: 'High', rationale: 'Strong collocations with pasta and unvoiced fricative onset' },
    { word: 'cheese', score: 0.15, phoneticMatch: 'Medium', rationale: 'Common Italian topping; fits vowel formant range' },
    { word: 'salt', score: 0.05, phoneticMatch: 'Low', rationale: 'Table condiment; less common in this specific prompt structure' },
  ];

  const candidates = recoveryData?.candidates && recoveryData.candidates.length > 0
    ? recoveryData.candidates
    : defaultCandidates;

  const reasons = recoveryData?.reasons || [
    'Fits the context: common with pasta',
    'Supported by partial audio evidence',
    'Related to the current topic (food)',
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <Brain className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">AI Recovery Suggestions</h2>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-lg z-30">
              Probabilistic scores represent linguistic model likelihood conditioned on partial acoustic features.
            </div>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Using context + audio
        </span>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {candidates.map((cand, idx) => {
          const isSelected = activeCandidate.toLowerCase() === cand.word.toLowerCase();
          const percent = Math.round(cand.score * 100);

          return (
            <button
              key={cand.word}
              type="button"
              onClick={() => onSelectCandidate(cand.word)}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? 'border-2 border-teal-500 bg-teal-50/50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className={`text-sm sm:text-base font-extrabold capitalize ${
                    isSelected ? 'text-teal-950' : 'text-slate-800'
                  }`}
                >
                  {cand.word}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-600 mb-2">
                {percent}%
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${percent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-teal-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-500 text-white rounded-full flex items-center justify-center text-[10px]">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Candidate Breakdown if requested */}
      {showAllAlternatives && (
        <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 animate-in fade-in duration-200">
          <p className="font-bold text-slate-700">Detailed Candidate Analysis:</p>
          {candidates.map((c) => (
            <div key={c.word} className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1.5">
              <div>
                <span className="font-bold text-slate-800 capitalize">{c.word}:</span>{' '}
                <span className="text-slate-600">{c.rationale}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-700 shrink-0">
                Phonetic: {c.phoneticMatch}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons (Accept, Alternatives, Keep Uncertain) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <button
          onClick={onAcceptSuggestion}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
            isAccepted
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 active:scale-98'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isAccepted ? 'Accepted' : 'Accept Suggestion'}</span>
        </button>

        <button
          onClick={() => setShowAllAlternatives(!showAllAlternatives)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors"
        >
          <ListPlus className="w-4 h-4 text-slate-500" />
          <span>{showAllAlternatives ? 'Hide Details' : 'Show Alternatives'}</span>
        </button>

        <button
          onClick={onKeepUncertain}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs border transition-colors ${
            isKeptUncertain
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Keep Uncertain</span>
        </button>
      </div>

      {/* "Why this word?" Reasoning Box */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
        <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
          <Lightbulb className="w-4 h-4 text-sky-600" />
          <span>Why this word?</span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-700 pl-5 list-disc marker:text-sky-500">
          {reasons.map((r, i) => (
            <li key={i} className="leading-snug">
              {r}
            </li>
          ))}
        </ul>

        {recoveryData?.acousticEvidence && (
          <div className="mt-2 pt-2 border-t border-sky-200/60 text-[11px] text-slate-600">
            <span className="font-semibold text-sky-900">Acoustic Signal: </span>
            {recoveryData.acousticEvidence}
          </div>
        )}
      </div>
    </div>
  );
};
