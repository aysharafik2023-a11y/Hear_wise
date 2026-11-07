import React from 'react';
import {
  Accessibility,
  Eye,
  Type,
  SunMoon,
  Volume2,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { speakText } from '../services/audioCapture';

interface AccessibilityPageProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const handleTestTts = () => {
    speakText('Testing HearWise text-to-speech audio with configured playback rate.', settings.ttsSpeed);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Accessibility className="w-7 h-7 text-blue-600" />
          Accessibility & Caption Display Preferences
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Customize visual typography, contrast ratios, and sensory feedback tailored for hearing-impaired users.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Caption Preview
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Current Configuration
          </span>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all ${
            settings.captionTheme === 'dark'
              ? 'bg-slate-950 text-white border-slate-800'
              : settings.captionTheme === 'yellow-on-black'
              ? 'bg-black text-yellow-300 border-yellow-400 font-bold'
              : settings.captionTheme === 'light'
              ? 'bg-white text-slate-900 border-slate-300'
              : 'bg-[#ecfdf5] text-slate-900 border-teal-200'
          }`}
        >
          <p
            className={`font-semibold leading-relaxed ${
              settings.fontSize === 'extra-large'
                ? 'text-3xl'
                : settings.fontSize === 'large'
                ? 'text-2xl'
                : 'text-xl'
            } ${settings.dyslexicFont ? 'font-mono' : 'font-sans'}`}
          >
            Do you want some more{' '}
            {settings.highlightInferred ? (
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-teal-300 text-teal-950 font-extrabold border border-teal-500 shadow-xs">
                sauce
              </span>
            ) : (
              <span>sauce</span>
            )}{' '}
            for your pasta?
          </p>

          {settings.showUncertaintyLabels && (
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                [Inferred: 78% confidence]
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Caption Font Size & Typography */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Caption Font Size</h2>
            <p className="text-xs text-slate-500">Choose a comfortable text size for fast scanning</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['normal', 'large', 'extra-large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onUpdateSettings({ fontSize: size })}
              className={`py-3 px-4 rounded-2xl font-bold text-sm border capitalize transition-all ${
                settings.fontSize === size
                  ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {size.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Dyslexic font toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              High-Legibility Monospace Font
            </span>
            <span className="text-xs text-slate-500">
              Increases letter distinction for reduced cognitive reading fatigue
            </span>
          </div>
          <button
            role="switch"
            aria-checked={settings.dyslexicFont}
            onClick={() => onUpdateSettings({ dyslexicFont: !settings.dyslexicFont })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.dyslexicFont ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>
      </div>

      {/* Caption Color Theme */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
            <SunMoon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Caption Color & Contrast Themes</h2>
            <p className="text-xs text-slate-500">Optimized WCAG contrast themes for varied visual needs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'mint', label: 'Pale Mint (Default)', bg: 'bg-[#ecfdf5] border-teal-300' },
            { id: 'light', label: 'Classic White', bg: 'bg-white border-slate-300' },
            { id: 'dark', label: 'Dark Slate', bg: 'bg-slate-900 text-white border-slate-700' },
            { id: 'yellow-on-black', label: 'High Contrast Yellow', bg: 'bg-black text-yellow-300 border-yellow-400' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateSettings({ captionTheme: theme.id as any })}
              className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all ${
                theme.bg
              } ${
                settings.captionTheme === theme.id
                  ? 'ring-4 ring-blue-500/30 border-blue-600'
                  : 'hover:opacity-90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{theme.label}</span>
                {settings.captionTheme === theme.id && <Check className="w-4 h-4 ml-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sensory & Behavioral Toggles */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          Sensory Feedback & Movement
        </h2>

        {/* Visual Flash Alert on Loud Noise */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Visual Flash Alert on Loud Sounds (&gt; 80 dB)
            </span>
            <span className="text-xs text-slate-500">
              Flashes a subtle screen perimeter warning when sudden acoustic spikes or alarms occur
            </span>
          </div>
          <button
            role="switch"
            aria-checked={settings.visualNoiseAlerts}
            onClick={() => onUpdateSettings({ visualNoiseAlerts: !settings.visualNoiseAlerts })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.visualNoiseAlerts ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Reduced Motion Mode
            </span>
            <span className="text-xs text-slate-500">
              Disables oscillating waveform animations and high-speed pulsing
            </span>
          </div>
          <button
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.reducedMotion ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        {/* Highlight Inferred Words */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Highlight Inferred Words with Teal Badge
            </span>
            <span className="text-xs text-slate-500">
              Explicitly delineates AI-predicted words from verified speech acoustic signals
            </span>
          </div>
          <button
            role="switch"
            aria-checked={settings.highlightInferred}
            onClick={() => onUpdateSettings({ highlightInferred: !settings.highlightInferred })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.highlightInferred ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
          </button>
        </div>

        {/* TTS Speed */}
        <div className="py-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Text-to-Speech Playback Speed
              </span>
              <span className="text-xs text-slate-500">
                Pacing for reading aloud completed captions
              </span>
            </div>
            <button
              onClick={handleTestTts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Test Voice ({settings.ttsSpeed}x)</span>
            </button>
          </div>

          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={settings.ttsSpeed}
            onChange={(e) => onUpdateSettings({ ttsSpeed: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
