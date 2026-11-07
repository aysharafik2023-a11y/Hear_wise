/**
 * HearWise AI Sound Engine
 * Provides reliable, cross-browser Web Audio API & Speech Synthesis audio playback
 * for conversation timeline, acoustic spectrogram comparison, and text-to-speech.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientNoiseSource: AudioNode | null = null;
  private isConversationPlaying = false;
  private currentUtteranceIndex = 0;
  private onTimelineProgressCallback: ((sec: number) => void) | null = null;
  private onConversationStateCallback: ((playing: boolean) => void) | null = null;
  private comparisonPlaying = false;
  private comparisonSource: AudioBufferSourceNode | null = null;

  constructor() {
    // Pre-initialize voice list
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  // Ensure AudioContext is initialized and unlocked after user gesture
  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.warn('AudioContext resume error:', e));
    }
    return this.ctx;
  }

  /**
   * Play an acoustic notification tone (audio cue)
   */
  public playTone(freq: number = 440, type: OscillatorType = 'sine', durationSec: number = 0.25, gainVal: number = 0.2) {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (e) {
      console.warn('Could not play tone:', e);
    }
  }

  /**
   * Speak a text string using Web Speech API with fallback acoustic tone
   */
  public speak(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      voiceGender?: 'male' | 'female';
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): void {
    const { pitch = 1.0, rate = 1.0, voiceGender, onEnd, onError } = options;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Audio fallback: play cheerful acoustic chime
      this.playTone(523.25, 'triangle', 0.2); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.25), 180); // E5
      if (onEnd) setTimeout(onEnd, 500);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
        const pool = englishVoices.length > 0 ? englishVoices : voices;

        if (voiceGender === 'male') {
          const maleVoice = pool.find((v) =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('george')
          );
          if (maleVoice) utterance.voice = maleVoice;
        } else if (voiceGender === 'female') {
          const femaleVoice = pool.find((v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('victoria')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
        }
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        // Play fallback chime so user always gets audio feedback
        this.playTone(440, 'sine', 0.2);
        if (onError) onError();
        if (onEnd) onEnd();
      };

      // Play soft speech prep tone to ensure AudioContext and hardware outputs are awake
      this.playTone(880, 'sine', 0.05, 0.02);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis exception:', err);
      this.playTone(440, 'sine', 0.25);
      if (onEnd) onEnd();
    }
  }

  /**
   * Starts ambient background noise (Café babble / pink noise)
   */
  public startAmbientNoise(levelDb: number = 65): void {
    try {
      this.stopAmbientNoise();
      const ctx = this.getAudioContext();

      // Generate 2 seconds of pink/café noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Bandpass filter to simulate restaurant ambient chatter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.value = Math.min(0.12, (levelDb / 100) * 0.08);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      this.ambientNoiseSource = noiseSource;
    } catch (e) {
      console.warn('Failed to start ambient noise:', e);
    }
  }

  public stopAmbientNoise(): void {
    if (this.ambientNoiseSource) {
      try {
        (this.ambientNoiseSource as AudioBufferSourceNode).stop();
        this.ambientNoiseSource.disconnect();
      } catch (e) {
        // Ignore
      }
      this.ambientNoiseSource = null;
    }
  }

  /**
   * Play full multi-speaker conversation sequentially
   */
  public playConversation(
    messages: { speaker: string; text: string; acceptedWord?: string }[],
    options: {
      startIndex?: number;
      rate?: number;
      includeAmbientNoise?: boolean;
      noiseDb?: number;
      onProgress?: (index: number, timeSec: number) => void;
      onStateChange?: (playing: boolean) => void;
    } = {}
  ): void {
    this.stopConversation();

    const {
      startIndex = 0,
      rate = 1.0,
      includeAmbientNoise = true,
      noiseDb = 68,
      onProgress,
      onStateChange,
    } = options;

    this.isConversationPlaying = true;
    this.currentUtteranceIndex = startIndex;
    if (onStateChange) onStateChange(true);

    if (includeAmbientNoise) {
      this.startAmbientNoise(noiseDb);
    }

    const playNext = (index: number) => {
      if (!this.isConversationPlaying || index >= messages.length) {
        this.stopConversation();
        return;
      }

      this.currentUtteranceIndex = index;
      const msg = messages[index];
      const isSpeaker2 = msg.speaker.toLowerCase().includes('2') || msg.speaker.toLowerCase().includes('sarah');

      // Replace [unclear] with accepted word or a natural pause representation
      const cleanText = msg.text.replace('[unclear]', msg.acceptedWord || 'something');

      if (onProgress) {
        const estTime = index * 4;
        onProgress(index, estTime);
      }

      this.speak(cleanText, {
        pitch: isSpeaker2 ? 1.2 : 0.85,
        rate,
        voiceGender: isSpeaker2 ? 'female' : 'male',
        onEnd: () => {
          if (this.isConversationPlaying) {
            // Small conversational turn pause
            setTimeout(() => {
              playNext(index + 1);
            }, 500);
          }
        },
        onError: () => {
          if (this.isConversationPlaying) {
            setTimeout(() => playNext(index + 1), 800);
          }
        },
      });
    };

    playNext(startIndex);
  }

  /**
   * Stop conversation playback
   */
  public stopConversation(): void {
    this.isConversationPlaying = false;
    this.stopAmbientNoise();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.onConversationStateCallback) {
      this.onConversationStateCallback(false);
    }
  }

  /**
   * Play before/after audio comparison for the Spectrogram Panel
   */
  public playComparisonSample(
    mode: 'noisy' | 'enhanced',
    onEnd?: () => void
  ): void {
    this.stopComparisonSample();
    const ctx = this.getAudioContext();

    const sampleText = 'Do you want some more sauce for your pasta?';

    if (mode === 'noisy') {
      // Start heavy background babble
      this.startAmbientNoise(78);
      this.speak(sampleText, {
        pitch: 0.9,
        rate: 1.0,
        voiceGender: 'male',
        onEnd: () => {
          this.stopAmbientNoise();
          if (onEnd) onEnd();
        },
      });
    } else {
      // Enhanced speech: 0 background noise, crystal clear formant delivery
      this.stopAmbientNoise();
      this.speak(sampleText, {
        pitch: 1.0,
        rate: 0.95,
        voiceGender: 'male',
        onEnd: () => {
          if (onEnd) onEnd();
        },
      });
    }
  }

  public stopComparisonSample(): void {
    this.stopAmbientNoise();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
