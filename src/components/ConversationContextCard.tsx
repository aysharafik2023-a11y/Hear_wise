import React, { useRef, useEffect } from 'react';
import {
  Coffee,
  ChevronDown,
  Volume2,
  Users,
  Sparkles,
  Flame,
  Radio,
} from 'lucide-react';
import { EnvironmentType } from '../types';

interface ConversationContextCardProps {
  environment: EnvironmentType;
  onSelectEnvironment: (env: EnvironmentType) => void;
  isRecording: boolean;
  recordingDuration: string;
  noiseDb: number;
  situation: string;
}

export const ConversationContextCard: React.FC<ConversationContextCardProps> = ({
  environment,
  onSelectEnvironment,
  isRecording,
  recordingDuration,
  noiseDb,
  situation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated waveform effect overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const numBars = 42;
      const barWidth = 4;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + gap);
        // Sinusoidal wave modified by noise amplitude
        const wave1 = Math.sin((i * 0.25) + phase) * 0.5 + 0.5;
        const wave2 = Math.cos((i * 0.15) - phase * 0.7) * 0.5 + 0.5;
        const factor = (wave1 * 0.6 + wave2 * 0.4);
        const barHeight = isRecording
          ? Math.max(8, factor * (height * 0.75) * (noiseDb / 70))
          : Math.max(6, Math.sin(i * 0.3) * 16 + 18);

        // Gradient from cyan to bright blue
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.5, '#2dd4bf');
        gradient.addColorStop(1, '#0284c7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += isRecording ? 0.08 : 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording, noiseDb]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
      {/* Central Visual Atmosphere Card */}
      <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-slate-900 shadow-md group min-h-[160px] sm:min-h-[180px]">
        {/* Café background photo */}
        <img
          src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&auto=format&fit=crop&q=80"
          alt="Conversing in a lively café setting"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65 group-hover:scale-102 transition-transform duration-700"
        />

        {/* Ambient Dark/Warm overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-slate-950/70" />

        {/* Top Floating Controls */}
        <div className="relative z-10 p-4 flex items-center justify-between gap-3">
          {/* Environment dropdown button */}
          <div className="flex items-center gap-2 bg-amber-500/90 hover:bg-amber-500 text-slate-900 font-bold px-3.5 py-1.5 rounded-full text-xs sm:text-sm shadow-md backdrop-blur-md cursor-pointer transition-colors">
            <Coffee className="w-4 h-4 text-slate-950" />
            <span>{environment}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          {/* Live Recording Badge */}
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRecording ? 'bg-red-500 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-white tracking-wide">
              {isRecording ? 'Live' : 'Standby'}
            </span>
            <span className="text-xs font-mono font-medium text-slate-300 border-l border-white/20 pl-2">
              {recordingDuration}
            </span>
          </div>
        </div>

        {/* Center Animated Dynamic Audio Waveform Overlay */}
        <div className="absolute inset-x-0 bottom-4 px-6 flex items-center justify-center pointer-events-none">
          <canvas
            ref={canvasRef}
            width={480}
            height={70}
            className="w-full max-w-[420px] h-[60px] drop-shadow-[0_2px_8px_rgba(45,212,191,0.6)]"
          />
        </div>
      </div>

      {/* Noise Level & Situation Quick Widgets */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-3">
        {/* Noise Level Widget */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
              <Volume2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Noise Level</span>
          </div>

          <div className="my-2">
            <div className="flex items-end gap-1.5 h-9 mb-1.5">
              <span
                className={`w-2.5 rounded-full transition-all ${
                  noiseDb >= 40 ? 'h-4 bg-amber-400' : 'h-2 bg-slate-200'
                }`}
              />
              <span
                className={`w-2.5 rounded-full transition-all ${
                  noiseDb >= 55 ? 'h-6 bg-amber-500' : 'h-2 bg-slate-200'
                }`}
              />
              <span
                className={`w-2.5 rounded-full transition-all ${
                  noiseDb >= 65 ? 'h-8 bg-teal-500' : 'h-2 bg-slate-200'
                }`}
              />
              <span
                className={`w-2.5 rounded-full transition-all ${
                  noiseDb >= 75 ? 'h-9 bg-emerald-500' : 'h-2 bg-slate-200'
                }`}
              />
            </div>
            <div className="text-sm font-bold text-slate-800">
              {noiseDb >= 75 ? 'High' : noiseDb >= 60 ? 'Moderate' : 'Low'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">({noiseDb} dB SPL)</div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium">
            Threshold: Normal conversation
          </div>
        </div>

        {/* Situation Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Situation</span>
          </div>

          <div className="my-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-slate-800">{situation}</div>
            <div className="text-[11px] text-slate-400 font-medium">Multi-speaker turn</div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium">
            Directional focus: Front
          </div>
        </div>
      </div>
    </div>
  );
};
