import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  ChevronDown,
  Info,
  Play,
  Pause,
  Sliders,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface AudioAnalysisPanelProps {
  isRecording: boolean;
  noiseDb: number;
}

export const AudioAnalysisPanel: React.FC<AudioAnalysisPanelProps> = ({
  isRecording,
  noiseDb,
}) => {
  const [enhancementMode, setEnhancementMode] = useState<'enhanced' | 'raw'>('enhanced');
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100
  const [isPlayingComparison, setIsPlayingComparison] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw real-time dynamic spectrogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const renderSpectrogram = () => {
      const w = canvas.width;
      const h = canvas.height;
      const splitX = (splitPos / 100) * w;

      ctx.clearRect(0, 0, w, h);

      // Draw background dark deep space
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // LEFT SIDE: Noisy Input (frequency hash + noise babble)
      const colWidth = 4;
      const cols = Math.floor(splitX / colWidth);

      for (let c = 0; c < cols; c++) {
        const x = c * colWidth;
        const rows = 28;
        const rowH = h / rows;

        for (let r = 0; r < rows; r++) {
          const y = h - (r + 1) * rowH;
          // Noise randomness + speech formant simulation
          const noise = Math.sin(c * 0.3 + r * 0.5 + t) * 0.3 + Math.random() * 0.4;
          const isFormant = (r >= 8 && r <= 12) || (r >= 16 && r <= 19);
          const intensity = isFormant ? Math.min(1, noise + 0.5) : noise;

          if (intensity > 0.25) {
            // Hot colormap: purple -> red -> yellow -> white
            const rVal = Math.floor(intensity * 255);
            const gVal = Math.floor(Math.max(0, intensity - 0.3) * 220);
            const bVal = Math.floor(Math.max(0, 0.6 - intensity) * 240);
            ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
            ctx.fillRect(x, y, colWidth - 1, rowH - 1);
          }
        }
      }

      // RIGHT SIDE: Enhanced Speech (Clean Formant Tracks, background suppressed)
      const rightCols = Math.floor((w - splitX) / colWidth);
      for (let c = 0; c < rightCols; c++) {
        const x = splitX + c * colWidth;
        const rows = 28;
        const rowH = h / rows;

        for (let r = 0; r < rows; r++) {
          const y = h - (r + 1) * rowH;
          // Formant tracks preserved with clean harmonic bands
          const isFormant = (r >= 8 && r <= 12) || (r >= 16 && r <= 19);
          const signal = isFormant
            ? (Math.sin((c + cols) * 0.25 + t * 1.2) * 0.35 + 0.65)
            : Math.random() * 0.08; // noise floor attenuated by 20dB

          if (signal > 0.2) {
            // Clean cyan / teal formant visualization
            const gVal = Math.floor(signal * 240);
            const bVal = Math.floor(signal * 255);
            ctx.fillStyle = `rgb(45, ${gVal}, ${bVal})`;
            ctx.fillRect(x, y, colWidth - 1, rowH - 1);
          }
        }
      }

      // Draw vertical separator line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      t += 0.05;
      animationId = requestAnimationFrame(renderSpectrogram);
    };

    renderSpectrogram();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [splitPos, isRecording]);

  const toggleComparisonPlayback = () => {
    if (isPlayingComparison) {
      soundEngine.stopComparisonSample();
      setIsPlayingComparison(false);
    } else {
      setIsPlayingComparison(true);
      // If splitPos > 50, user is looking more at enhanced speech or split
      const mode = splitPos < 40 ? 'noisy' : 'enhanced';
      soundEngine.playComparisonSample(mode, () => {
        setIsPlayingComparison(false);
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Audio Analysis</h2>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-lg z-30">
              Spectrogram showing time vs frequency. Drag slider to compare raw noisy input with neural speech enhancement.
            </div>
          </div>
        </div>

        {/* Dropdown menu indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Enhanced speech</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Split Spectrogram Visualization */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-900 shadow-inner group">
        <canvas
          ref={canvasRef}
          width={460}
          height={130}
          className="w-full h-[125px] block bg-slate-950 cursor-ew-resize"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
            setSplitPos(pct);
          }}
        />

        {/* Center Play Button Overlay */}
        <button
          onClick={toggleComparisonPlayback}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          title="Play before/after audio comparison"
        >
          {isPlayingComparison ? (
            <Pause className="w-4 h-4 fill-current text-blue-600" />
          ) : (
            <Play className="w-4 h-4 fill-current text-blue-600 ml-0.5" />
          )}
        </button>

        {/* Labels at bottom left & right */}
        <div className="absolute bottom-2 left-3 text-[11px] font-bold text-white/90 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs pointer-events-none">
          Noisy input
        </div>
        <div className="absolute bottom-2 right-3 text-[11px] font-bold text-teal-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs pointer-events-none">
          Enhanced speech
        </div>
      </div>

      {/* Metric Breakdown Beneath Spectrogram */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-medium">Input SNR</div>
          <div className="font-bold text-slate-700">8.2 dB</div>
        </div>
        <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
          <div className="text-[10px] text-teal-600 font-medium">Enhanced SNR</div>
          <div className="font-bold text-teal-800">22.4 dB (+14 dB)</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] text-slate-400 font-medium">VAD Latency</div>
          <div className="font-bold text-slate-700">22 ms</div>
        </div>
      </div>
    </div>
  );
};
