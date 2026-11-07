import React from 'react';
import {
  Sparkles,
  Home,
  Coffee,
  Car,
  Users,
  GraduationCap,
  Sliders,
  Square,
  Mic,
  PenSquare,
  BarChart3,
} from 'lucide-react';
import { EnvironmentType } from '../types';

interface EnvironmentToolbarProps {
  currentEnvironment: EnvironmentType;
  onSelectEnvironment: (env: EnvironmentType) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onTakeNotes: () => void;
}

export const EnvironmentToolbar: React.FC<EnvironmentToolbarProps> = ({
  currentEnvironment,
  onSelectEnvironment,
  isRecording,
  onToggleRecording,
  onTakeNotes,
}) => {
  const environments: { id: EnvironmentType; label: string; icon: any }[] = [
    { id: 'Auto detect', label: 'Auto detect', icon: Sparkles },
    { id: 'Quiet', label: 'Quiet', icon: Home },
    { id: 'Café', label: 'Café', icon: Coffee },
    { id: 'Traffic', label: 'Traffic', icon: Car },
    { id: 'Meeting', label: 'Meeting', icon: Users },
    { id: 'Classroom', label: 'Classroom', icon: GraduationCap },
    { id: 'Custom', label: 'Custom', icon: Sliders },
  ];

  return (
    <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Environment Category Label & Buttons */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2 py-1">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>Environment</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {environments.map((env) => {
            const Icon = env.icon;
            const isActive = currentEnvironment === env.id;

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => onSelectEnvironment(env.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{env.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: Stop / Start Recording & Take Notes */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Recording Toggle Button */}
        <button
          type="button"
          onClick={onToggleRecording}
          className={`flex items-center justify-center gap-2 px-5 py-2 rounded-2xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
            isRecording
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Listening</span>
            </>
          )}
        </button>

        {/* Take Notes Button */}
        <button
          type="button"
          onClick={onTakeNotes}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors"
        >
          <PenSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>Take notes</span>
        </button>
      </div>
    </div>
  );
};
