import React, { useState } from 'react';
import {
  Car,
  Coffee,
  Users,
  Home,
  GraduationCap,
  Sliders,
  Upload,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { EnvironmentType } from '../types';

export const NoiseEnvironmentsPage: React.FC = () => {
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>('Café');
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Equalizer frequencies for hearing assistance
  const [eqBands, setEqBands] = useState([
    { freq: '250 Hz', gain: 0, label: 'Bass Rumble' },
    { freq: '500 Hz', gain: 2, label: 'Vowel Energy' },
    { freq: '1 kHz', gain: 4, label: 'Formant F1' },
    { freq: '2 kHz', gain: 6, label: 'Formant F2 / Clarity' },
    { freq: '4 kHz', gain: 8, label: 'Consonants / Sibilants' },
    { freq: '8 kHz', gain: 5, label: 'Air & Transients' },
  ]);

  const envProfiles = [
    {
      id: 'Café',
      icon: Coffee,
      title: 'Busy Café & Bistro',
      snr: '6–10 dB SPL',
      challenge: 'Multi-talker babble and high-frequency clattering cutlery',
      filterStrategy: 'Aggressive transient suppression + sibilant boost',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'Traffic',
      icon: Car,
      title: 'Urban Traffic & Street',
      snr: '2–6 dB SPL',
      challenge: 'Heavy low-frequency engine rumbling and wind gusts',
      filterStrategy: 'High-pass notch filtering below 350 Hz',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      id: 'Meeting',
      icon: Users,
      title: 'Conference Room & Huddle',
      snr: '12–18 dB SPL',
      challenge: 'Overlapping turn-taking, HVAC fan hum, table taps',
      filterStrategy: 'Beamforming focus on front speaker + echo cancellation',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      id: 'Classroom',
      icon: GraduationCap,
      title: 'Lecture Hall & Classroom',
      snr: '8–14 dB SPL',
      challenge: 'Distant speaker, long reverberation tail (RT60 > 1.2s)',
      filterStrategy: 'Dereverberation filter + spectral envelope restoration',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      id: 'Quiet',
      icon: Home,
      title: 'Quiet Home & Office',
      snr: '20+ dB SPL',
      challenge: 'Minimal interference; focus on high fidelity speech',
      filterStrategy: 'Linear transparent bypass',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  const handleGainChange = (index: number, val: number) => {
    const updated = [...eqBands];
    updated[index].gain = val;
    setEqBands(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('Please upload an audio file (e.g. .wav, .mp3, .m4a, .webm)');
        return;
      }
      setUploadedFileName(file.name);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Car className="w-7 h-7 text-blue-600" />
          Noise Environment Presets & Acoustic Tuning
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Calibrate acoustic enhancement filters and noise gating thresholds for diverse sound environments.
        </p>
      </div>

      {/* Environment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {envProfiles.map((env) => {
          const Icon = env.icon;
          const isSelected = selectedEnv === env.id;

          return (
            <div
              key={env.id}
              onClick={() => setSelectedEnv(env.id as EnvironmentType)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-2 border-blue-600 bg-blue-50/40 shadow-md ring-4 ring-blue-500/10'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    SNR: {env.snr}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-1">
                  {env.title}
                </h2>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {env.challenge}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Enhancement Mode:
                </span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 block">
                  {env.filterStrategy}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hearing-Aid / CI 6-Band Graphic Equalizer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hearing-Aid & Cochlear-Implant Band Equalizer
              </h2>
              <p className="text-xs text-slate-500">
                Targeted frequency gain for enhanced consonant recognition and speech clarity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Reset to optimal speech curve
                setEqBands([
                  { freq: '250 Hz', gain: 0, label: 'Bass Rumble' },
                  { freq: '500 Hz', gain: 2, label: 'Vowel Energy' },
                  { freq: '1 kHz', gain: 4, label: 'Formant F1' },
                  { freq: '2 kHz', gain: 6, label: 'Formant F2 / Clarity' },
                  { freq: '4 kHz', gain: 8, label: 'Consonants / Sibilants' },
                  { freq: '8 kHz', gain: 5, label: 'Air & Transients' },
                ]);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Reset to Optimal Curve
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {eqBands.map((band, idx) => (
            <div
              key={band.freq}
              className="flex flex-col items-center bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100"
            >
              <span className="text-xs font-mono font-bold text-blue-600 mb-2">
                {band.gain > 0 ? `+${band.gain}` : band.gain} dB
              </span>

              {/* Vertical Slider */}
              <input
                type="range"
                min="-6"
                max="12"
                step="1"
                value={band.gain}
                onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                className="h-28 w-2 appearance-none bg-slate-200 rounded-lg cursor-pointer accent-blue-600 orient-vertical"
              />

              <span className="text-xs font-bold text-slate-800 mt-3">{band.freq}</span>
              <span className="text-[10px] text-center text-slate-400 font-medium leading-tight mt-0.5">
                {band.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Custom Audio Sample */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Test Custom Audio Recording
          </h2>
          <p className="text-xs text-slate-500">
            Upload a local .wav or .mp3 sample to analyze acoustic noise floor and test recovery accuracy.
          </p>
          {uploadedFileName && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mt-2">
              Loaded: {uploadedFileName}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm shadow-blue-600/30 transition-all shrink-0">
          <Upload className="w-4 h-4" />
          <span>Select Audio File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
