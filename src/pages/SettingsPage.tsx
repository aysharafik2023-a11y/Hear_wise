import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Mic,
  Sliders,
  ShieldCheck,
  Brain,
  Volume2,
  Trash2,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { SystemSettings, AccessibilitySettings } from '../types';

interface SettingsPageProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (newSettings: Partial<SystemSettings>) => void;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibilitySettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onClearLocalData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  systemSettings,
  onUpdateSystemSettings,
  accessibilitySettings,
  onUpdateAccessibilitySettings,
  onClearLocalData,
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all locally cached transcripts and settings?')) {
      onClearLocalData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-blue-600" />
          Settings & Assistive Pipeline Configuration
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage audio devices, neural recovery thresholds, privacy controls, and hearing device profiles.
        </p>
      </div>

      {clearedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          All local session caches and transcripts have been purged.
        </div>
      )}

      {/* Audio Capture & Processing Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Audio Capture & Hardware</h2>
            <p className="text-xs text-slate-500">Microphone stream and front-end noise reduction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Active Audio Input Device
            </label>
            <select
              value={systemSettings.microphoneId}
              onChange={(e) => onUpdateSystemSettings({ microphoneId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="default">Default Built-in Array Microphone (Omnidirectional)</option>
              <option value="ci-bluetooth">Cochlear Implant Direct Bluetooth Stream</option>
              <option value="roger-pen">Phonak Roger On / Assistive Remote Mic</option>
              <option value="external-usb">External USB Directional Microphone</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hearing Device Frequency Profile
            </label>
            <select
              value={systemSettings.hearingAidPreset}
              onChange={(e) => onUpdateSystemSettings({ hearingAidPreset: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="Speech Focus">Speech Focus (High clarity on 1-4 kHz)</option>
              <option value="Cochlear Implant Sharp">Cochlear Implant Sharp (Steep spectral roll-off)</option>
              <option value="High-Frequency Boost">High-Frequency Boost (Mild-to-moderate presbycusis)</option>
              <option value="Flat">Flat / Transparent (Clinical baseline)</option>
            </select>
          </div>
        </div>

        {/* Noise suppression toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Neural Speech Noise Suppression
            </span>
            <span className="text-xs text-slate-500">
              Suppresses restaurant babble and traffic rumbling before streaming to ASR
            </span>
          </div>
          <button
            role="switch"
            aria-checked={systemSettings.noiseSuppressionActive}
            onClick={() => onUpdateSystemSettings({ noiseSuppressionActive: !systemSettings.noiseSuppressionActive })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              systemSettings.noiseSuppressionActive ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>
      </div>

      {/* AI Speech Recovery & LLM Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Speech Recovery & Confidence Gate</h2>
            <p className="text-xs text-slate-500">Tuning candidate generation and statistical certainty bounds</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Minimum Confidence Gate Threshold: {Math.round(systemSettings.recoveryThreshold * 100)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Lower = more suggestions; Higher = fewer, strictly verified
            </span>
          </div>
          <input
            type="range"
            min="0.40"
            max="0.90"
            step="0.05"
            value={systemSettings.recoveryThreshold}
            onChange={(e) => onUpdateSystemSettings({ recoveryThreshold: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Number of Suggestion Candidates
            </label>
            <select
              value={systemSettings.candidateCount}
              onChange={(e) => onUpdateSystemSettings({ candidateCount: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="3">Top 3 Candidates (Standard)</option>
              <option value="4">Top 4 Candidates</option>
              <option value="5">Top 5 Candidates</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mode Execution
            </label>
            <select
              value={systemSettings.demoMode ? 'demo' : 'live'}
              onChange={(e) => onUpdateSystemSettings({ demoMode: e.target.value === 'demo' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="live">Live Pipeline (Web Audio + Gemini API)</option>
              <option value="demo">Interactive Research Demo (Simulated Audio)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & Data Retention */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Privacy & Ephemeral Audio Retention</h2>
            <p className="text-xs text-slate-500">Strict zero-retention policy for sensitive conversations</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <p className="font-bold text-slate-800">Research Prototype Privacy Guarantee:</p>
          <p>
            • Audio chunks are analyzed in temporary memory buffers and discarded after speech completion.
          </p>
          <p>
            • No raw audio recordings are stored on cloud servers.
          </p>
          <p>
            • Only user-accepted transcripts and custom vocabulary remain in local browser storage unless cleared.
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Save Conversation Transcripts Locally
            </span>
            <span className="text-xs text-slate-500">
              Stores session history inside local browser storage
            </span>
          </div>
          <button
            role="switch"
            aria-checked={systemSettings.saveTranscriptsLocally}
            onClick={() => onUpdateSystemSettings({ saveTranscriptsLocally: !systemSettings.saveTranscriptsLocally })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              systemSettings.saveTranscriptsLocally ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Purge Local Cache & Session Logs
            </span>
            <span className="text-xs text-slate-500">
              Instantly deletes all saved conversations and reset settings
            </span>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
