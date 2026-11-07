import React, { useState } from 'react';
import {
  Radio,
  Clock,
  Settings as SettingsIcon,
  FlaskConical,
  ChevronDown,
  Volume2,
  CheckCircle2,
  Mic,
  ShieldCheck,
} from 'lucide-react';

interface AppHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isRecording: boolean;
  hasApiKey: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onSelectTab,
  isRecording,
  hasApiKey,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('live')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            {/* Ear wave custom SVG logo */}
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 4-2.5 6-4 7.5-1.2 1.2-1.5 2.5-1.5 4" />
              <path d="M9 13a3 3 0 0 0 4-2.5" />
              <path d="M3 10a9 9 0 0 1 3-6.5" />
              <path d="M21 10a9 9 0 0 0-3-6.5" />
            </svg>
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                HearWise AI
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Assistive Tech
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              Fill the missing words. Hear the full conversation.
            </p>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200"
        >
          <button
            onClick={() => onSelectTab('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'live'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Conversations</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => onSelectTab('research')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'research'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Research</span>
          </button>
        </nav>

        {/* User Profile & Status */}
        <div className="relative flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiKey ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            />
            <span>{hasApiKey ? 'Gemini 3.8 Flash' : 'Research Pipeline Active'}</span>
          </div>

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              S
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                Sarah
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">Sarah Jenkins</p>
                <p className="text-xs text-slate-500">Cochlear Implant (Right Ear) • Med-El</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectTab('accessibility');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  Hearing Aid / CI Profile
                </button>
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Privacy & Data Retention
                </button>
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400">
                HearWise AI v1.2 Research Prototype
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
