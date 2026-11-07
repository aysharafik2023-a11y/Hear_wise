import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RecoveryData } from '../types';
import { speakText } from '../services/audioCapture';

interface CompletedCaptionCardProps {
  originalUtterance: string;
  recoveryData?: RecoveryData;
  activeCandidateWord?: string;
  isAccepted?: boolean;
  onAcceptWord?: (word: string) => void;
  captionTheme?: string;
}

export const CompletedCaptionCard: React.FC<CompletedCaptionCardProps> = ({
  originalUtterance,
  recoveryData,
  activeCandidateWord = 'sauce',
  isAccepted = false,
  onAcceptWord,
  captionTheme = 'mint',
}) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const wordToUse = isAccepted
    ? (recoveryData?.userOverrideWord || activeCandidateWord)
    : activeCandidateWord;

  // Build the completed caption text
  const completedText = originalUtterance.replace('[unclear]', wordToUse);

  const handleCopy = () => {
    navigator.clipboard.writeText(showOriginal ? originalUtterance : completedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayTTS = () => {
    setIsPlayingAudio(true);
    speakText(showOriginal ? originalUtterance.replace('[unclear]', 'unclear sound') : completedText);
    setTimeout(() => setIsPlayingAudio(false), 2800);
  };

  // Color theming
  const themeClasses =
    captionTheme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-white'
      : captionTheme === 'yellow-on-black'
      ? 'bg-black border-yellow-400 text-yellow-300'
      : 'bg-[#eefbf6] border-emerald-200/90 text-slate-900 shadow-sm';

  return (
    <div
      className={`rounded-3xl p-5 border transition-all mb-4 relative overflow-hidden ${themeClasses}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-100 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            AI Completed Caption
          </span>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-lg z-30">
              Recovered speech candidate generated using surrounding context, acoustic fricative detection, and language modeling.
            </div>
          </div>
        </div>

        {/* Prediction Status Badge & Toggle */}
        <div className="flex items-center gap-2">
          {/* Toggle between original & AI-completed */}
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 transition-colors shadow-2xs"
            title="Toggle between raw ASR and AI-completed text"
          >
            {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showOriginal ? 'Showing Raw' : 'Show Raw'}</span>
          </button>

          {/* Status badge */}
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              isAccepted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100/90 text-amber-900 border-amber-300'
            }`}
          >
            {isAccepted ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                User Verified
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Contextually predicted
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Large Display Text */}
      <div className="py-2 px-1">
        {showOriginal ? (
          <p className="text-xl sm:text-2xl font-semibold text-slate-700 tracking-tight leading-snug">
            {originalUtterance.split('[unclear]')[0]}
            <span className="inline-block px-2.5 py-0.5 rounded-xl bg-amber-200/80 text-amber-950 font-bold border border-amber-400 mx-1">
              [unclear]
            </span>
            {originalUtterance.split('[unclear]')[1]}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
            <span>{originalUtterance.split('[unclear]')[0]}</span>
            {/* Highlighted word in teal background and bold typography */}
            <span className="inline-flex items-center px-3 py-0.5 rounded-xl bg-teal-200/80 text-teal-950 font-extrabold border border-teal-400 shadow-xs">
              {wordToUse}
            </span>
            <span>{originalUtterance.split('[unclear]')[1]}</span>

            {/* Read aloud / play button */}
            <button
              onClick={handlePlayTTS}
              className={`p-2 rounded-xl transition-colors ml-2 ${
                isPlayingAudio
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-blue-600 border border-slate-200/80 shadow-2xs'
              }`}
              title="Speak completed caption"
              aria-label="Speak completed caption"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Tools & Safety Limitation Warning */}
      <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-[11px] text-slate-600">
            Research Notice: Inferred words are statistical estimations based on conversational context.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-medium transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
