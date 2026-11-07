import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
} from 'lucide-react';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTimeSec: number;
  totalDurationSec: number;
  onSeek: (timeSec: number) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  currentTimeSec,
  totalDurationSec,
  onSeek,
  playbackRate,
  onChangePlaybackRate,
}) => {
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDurationSec > 0 ? (currentTimeSec / totalDurationSec) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(newPercent * totalDurationSec);
  };

  // Generate 50 static waveform bars for timeline
  const waveformBars = [
    12, 18, 24, 15, 30, 42, 28, 16, 35, 48, 55, 32, 22, 40, 60, 45, 20, 28,
    38, 50, 65, 40, 25, 30, 48, 52, 36, 18, 26, 44, 58, 42, 24, 32, 45, 50,
    35, 20, 25, 38, 48, 30, 16, 22, 34, 40, 26, 18, 14, 10
  ];

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4">
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all shrink-0 active:scale-95"
        title={isPlaying ? 'Pause playback' : 'Play conversation recording'}
        aria-label={isPlaying ? 'Pause playback' : 'Play conversation recording'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Scrubber Timeline */}
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <div
          ref={scrubberRef}
          onClick={handleScrubberClick}
          className="relative h-10 w-full flex items-center cursor-pointer group py-1"
        >
          {/* Waveform Bars */}
          <div className="w-full h-8 flex items-center justify-between gap-[2px]">
            {waveformBars.map((h, i) => {
              const barPercent = (i / waveformBars.length) * 100;
              const isPast = barPercent <= progressPercent;

              return (
                <div
                  key={i}
                  style={{ height: `${h * 0.45}px` }}
                  className={`flex-1 rounded-full transition-colors ${
                    isPast
                      ? 'bg-blue-500'
                      : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Yellow Scrubber Pin (Matching reference screenshot) */}
          <div
            style={{ left: `${progressPercent}%` }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md pointer-events-none group-hover:scale-125 transition-transform"
          />
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-500">
          <span>{formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}</span>
          <span className="text-[11px] font-sans text-slate-400">Captured at 48kHz Stereo</span>
        </div>
      </div>

      {/* Right Controls: Speed & Volume */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {/* Playback speed selector */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold text-slate-600">
          {[0.75, 1.0, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangePlaybackRate(rate)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                playbackRate === rate
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
