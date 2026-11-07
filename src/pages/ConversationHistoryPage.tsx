import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Coffee,
  Car,
  Users,
  Home,
  GraduationCap,
  Sparkles,
  FileText,
  Volume2,
} from 'lucide-react';
import { SessionHistoryItem } from '../types';

interface ConversationHistoryPageProps {
  history: SessionHistoryItem[];
  onDeleteSession: (id: string) => void;
  onLoadSession: (session: SessionHistoryItem) => void;
}

export const ConversationHistoryPage: React.FC<ConversationHistoryPageProps> = ({
  history,
  onDeleteSession,
  onLoadSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnv, setFilterEnv] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.completedSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = filterEnv === 'All' || item.environment === filterEnv;
    return matchesSearch && matchesEnv;
  });

  const exportSessionJson = (session: SessionHistoryItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hearwise-session-${session.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getEnvIcon = (env: string) => {
    switch (env) {
      case 'Café':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'Traffic':
        return <Car className="w-4 h-4 text-rose-600" />;
      case 'Meeting':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'Classroom':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      default:
        return <Home className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-600" />
            Conversation History
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Review past assisted listening sessions, verified word completions, and acoustic metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {history.length} Sessions Logged
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcripts, topics, or accepted words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Environments</option>
            <option value="Café">Café</option>
            <option value="Meeting">Meeting</option>
            <option value="Traffic">Traffic</option>
            <option value="Quiet">Quiet</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHistory.map((sess) => (
          <div
            key={sess.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                    {getEnvIcon(sess.environment)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sess.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      {sess.date} • {sess.time}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sess.duration}
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                "{sess.completedSummary}"
              </p>

              {/* Statistics Badges */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">Noise Level</div>
                  <div className="text-xs font-bold text-slate-800">{sess.noiseLevelDb} dB SPL</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-[10px] text-amber-600 font-medium">Unclear Words</div>
                  <div className="text-xs font-bold text-amber-800">{sess.unclearCount} detected</div>
                </div>
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                  <div className="text-[10px] text-teal-600 font-medium">Recovered</div>
                  <div className="text-xs font-bold text-teal-800">{sess.acceptedCount} accepted</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => onLoadSession(sess)}
                className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in Live Assist</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportSessionJson(sess)}
                  title="Export session data as JSON"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSession(sess.id)}
                  title="Delete recorded session"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
