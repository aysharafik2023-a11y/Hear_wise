/**
 * Web Audio API Audio Capture and Analyser Service
 */

export interface AudioAnalyzerHook {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  stream: MediaStream | null;
  getByteFrequencyData: () => Uint8Array;
  getByteTimeDomainData: () => Uint8Array;
  getDecibels: () => number;
  stop: () => void;
}

export async function createLiveAudioAnalyzer(): Promise<AudioAnalyzerHook> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: false, // keep raw for our research analyzer
      autoGainControl: true,
    },
  });

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  const freqArray = new Uint8Array(analyser.frequencyBinCount);
  const timeArray = new Uint8Array(analyser.fftSize);

  return {
    audioContext,
    analyser,
    stream,
    getByteFrequencyData: () => {
      analyser.getByteFrequencyData(freqArray);
      return freqArray;
    },
    getByteTimeDomainData: () => {
      analyser.getByteTimeDomainData(timeArray);
      return timeArray;
    },
    getDecibels: () => {
      analyser.getByteFrequencyData(freqArray);
      let sum = 0;
      for (let i = 0; i < freqArray.length; i++) {
        sum += freqArray[i];
      }
      const avg = sum / freqArray.length;
      // Map 0-255 to roughly 35dB - 90dB
      const db = Math.round(35 + (avg / 255) * 55);
      return Math.min(Math.max(db, 32), 95);
    },
    stop: () => {
      try {
        stream.getTracks().forEach((track) => track.stop());
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch (e) {
        console.error('Error stopping audio analyzer:', e);
      }
    },
  };
}

import { soundEngine } from './soundEngine';

/**
 * Text to speech helper with rate control and acoustic tone fallback
 */
export function speakText(text: string, rate: number = 1.0) {
  soundEngine.speak(text, { rate });
}
