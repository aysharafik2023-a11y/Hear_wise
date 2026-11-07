import React from 'react';
import {
  MessageSquare,
  Volume2,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveConversationPanelProps {
  messages: ChatMessage[];
  selectedMessageId: string;
  onSelectMessage: (msg: ChatMessage) => void;
  showSpeakers: boolean;
  onToggleShowSpeakers: () => void;
  onPlayMessageAudio?: (msg: ChatMessage) => void;
}

export const LiveConversationPanel: React.FC<LiveConversationPanelProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  showSpeakers,
  onToggleShowSpeakers,
  onPlayMessageAudio,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Live Conversation</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Real-time
          </span>
        </div>

        {/* Show speakers toggle switch */}
        <div className="flex items-center gap-2.5">
          <label
            htmlFor="show-speakers"
            className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
          >
            Show speakers
          </label>
          <button
            id="show-speakers"
            role="switch"
            aria-checked={showSpeakers}
            onClick={onToggleShowSpeakers}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              showSpeakers ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md block transition-all" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {messages.map((msg) => {
          const isSelected = selectedMessageId === msg.id;
          const hasUnclear = msg.hasUnclear;
          const isAccepted = Boolean(msg.acceptedWord);
          const isKeptUncertain = msg.isKeptUncertain;

          // Replace [unclear] with accepted word if user accepted suggestion
          let displayText = msg.text;
          const unclearIndex = displayText.indexOf('[unclear]');

          return (
            <div
              key={msg.id}
              onClick={() => {
                if (hasUnclear) onSelectMessage(msg);
              }}
              className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-2 border-blue-400 shadow-sm'
                  : 'hover:bg-slate-50 border border-transparent'
              } ${hasUnclear ? 'cursor-pointer' : ''}`}
            >
              {/* Speaker Avatar */}
              {showSpeakers && (
                <div className="relative shrink-0">
                  {msg.avatarUrl ? (
                    <img
                      src={msg.avatarUrl}
                      alt={msg.speaker}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-2xl ${
                        msg.avatarColor || 'bg-slate-500'
                      } text-white font-bold text-sm flex items-center justify-center shadow-sm`}
                    >
                      {msg.speaker.substring(0, 2)}
                    </div>
                  )}
                  {hasUnclear && !isAccepted && (
                    <span
                      title="Speech gap detected"
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </span>
                  )}
                </div>
              )}

              {/* Message Content Bubble */}
              <div className="flex-1 min-w-0">
                {showSpeakers && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {msg.speaker}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {msg.timestamp}
                    </span>
                    {isAccepted && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        AI Inferred & Accepted
                      </span>
                    )}
                  </div>
                )}

                {/* Text with highlighting for [unclear] or accepted word */}
                <div className="text-sm font-medium text-slate-800 leading-relaxed">
                  {unclearIndex !== -1 ? (
                    <>
                      <span>{displayText.substring(0, unclearIndex)}</span>
                      {isAccepted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 font-bold border border-teal-300 mx-1">
                          {msg.acceptedWord}
                        </span>
                      ) : isKeptUncertain ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-semibold border border-slate-300 mx-1">
                          [unclear]
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300 mx-1 animate-pulse">
                          [unclear]
                        </span>
                      )}
                      <span>{displayText.substring(unclearIndex + 9)}</span>
                    </>
                  ) : (
                    <span>{displayText}</span>
                  )}
                </div>
              </div>

              {/* Timestamp & Waveform audio button */}
              <div className="flex items-center gap-2 shrink-0 self-center">
                {!showSpeakers && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {msg.timestamp}
                  </span>
                )}
                {/* Audio snippet icon representing recorded chunk */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPlayMessageAudio) onPlayMessageAudio(msg);
                  }}
                  title="Play audio chunk"
                  className={`p-1.5 rounded-xl hover:bg-slate-200/80 transition-colors ${
                    msg.speaker === 'Speaker 2'
                      ? 'text-teal-600'
                      : isSelected
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-slate-400'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 10v4" />
                    <path d="M8 7v10" />
                    <path d="M12 4v16" />
                    <path d="M16 8v8" />
                    <path d="M20 11v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
