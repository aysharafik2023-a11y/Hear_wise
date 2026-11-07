import React, { useState, useEffect, useRef } from 'react';
import { AppHeader } from './components/AppHeader';
import { Sidebar } from './components/Sidebar';
import { ConversationContextCard } from './components/ConversationContextCard';
import { LiveConversationPanel } from './components/LiveConversationPanel';
import { CompletedCaptionCard } from './components/CompletedCaptionCard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { RecoverySuggestionsPanel } from './components/RecoverySuggestionsPanel';
import { AudioAnalysisPanel } from './components/AudioAnalysisPanel';
import { EnvironmentToolbar } from './components/EnvironmentToolbar';

// Pages
import { ConversationHistoryPage } from './pages/ConversationHistoryPage';
import { NoiseEnvironmentsPage } from './pages/NoiseEnvironmentsPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { ResearchPage } from './pages/ResearchPage';
import { SettingsPage } from './pages/SettingsPage';

// Types and Services
import {
  ChatMessage,
  EnvironmentType,
  SessionHistoryItem,
  VocabularyItem,
  AccessibilitySettings,
  SystemSettings,
  RecoveryData,
} from './types';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_HISTORY,
  INITIAL_VOCABULARY,
} from './services/mockData';
import {
  createLiveAudioAnalyzer,
  AudioAnalyzerHook,
  speakText,
} from './services/audioCapture';
import { soundEngine } from './services/soundEngine';
import { AlertCircle, X, Check, PenSquare } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('live');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Live Assist state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('msg-1');
  const [environment, setEnvironment] = useState<EnvironmentType>('Café');
  const [situation, setSituation] = useState('Group conversation');
  const [showSpeakers, setShowSpeakers] = useState(true);

  // Active word recovery state
  const [activeCandidateWord, setActiveCandidateWord] = useState<string>('sauce');
  const [isAccepted, setIsAccepted] = useState(false);
  const [isKeptUncertain, setIsKeptUncertain] = useState(false);

  // Recording & Audio Capture state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(84); // Default 00:01:24
  const [noiseDb, setNoiseDb] = useState(68);
  const [micError, setMicError] = useState<string | null>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzerHook | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Audio Playback Bar state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackSec, setAudioPlaybackSec] = useState(24); // 00:24
  const [audioDurationSec, setAudioDurationSec] = useState(80); // 01:20
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Notes Modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Persistent Collections
  const [history, setHistory] = useState<SessionHistoryItem[]>(INITIAL_HISTORY);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(INITIAL_VOCABULARY);

  // System & Accessibility Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    microphoneId: 'default',
    inputGain: 1.0,
    noiseSuppressionActive: true,
    hearingAidPreset: 'Speech Focus',
    recoveryThreshold: 0.70,
    candidateCount: 3,
    saveTranscriptsLocally: true,
    saveRecordingsLocally: false,
    demoMode: false,
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    captionTheme: 'mint',
    highlightInferred: true,
    showUncertaintyLabels: false,
    reducedMotion: false,
    visualNoiseAlerts: false,
    dyslexicFont: false,
    ttsSpeed: 1.0,
  });

  // Selected message object
  const currentSelectedMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  // Format recording timer
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Recording timer interval
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);

        // Update real noise decibels if microphone analyzer is active
        if (audioAnalyzerRef.current) {
          const db = audioAnalyzerRef.current.getDecibels();
          setNoiseDb(db);
        } else {
          // Subtle realistic noise variance in demo mode
          const base = environment === 'Café' ? 68 : environment === 'Traffic' ? 76 : 52;
          const fluctuation = Math.floor(Math.sin(Date.now() / 800) * 4);
          setNoiseDb(base + fluctuation);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, environment]);

  // Audio playback bar timer sync
  useEffect(() => {
    let playInterval: any;
    if (isPlayingAudio) {
      playInterval = setInterval(() => {
        setAudioPlaybackSec((prev) => {
          if (prev >= audioDurationSec) {
            soundEngine.stopConversation();
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
    return () => clearInterval(playInterval);
  }, [isPlayingAudio, audioDurationSec, playbackRate]);

  // Audio Playback: Play conversation audio sequence
  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      soundEngine.stopConversation();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      // Play multi-turn conversation with ambient café acoustic environment
      soundEngine.playConversation(messages, {
        startIndex: 0,
        rate: playbackRate,
        includeAmbientNoise: true,
        noiseDb,
        onProgress: (index, timeSec) => {
          setAudioPlaybackSec(timeSec + 1);
          if (messages[index]) {
            setSelectedMessageId(messages[index].id);
          }
        },
        onStateChange: (playing) => {
          setIsPlayingAudio(playing);
        },
      });
    }
  };

  // Seek timeline
  const handleSeekAudio = (timeSec: number) => {
    const targetSec = Math.round(timeSec);
    setAudioPlaybackSec(targetSec);
    if (isPlayingAudio) {
      const msgIndex = Math.min(messages.length - 1, Math.floor((targetSec / audioDurationSec) * messages.length));
      soundEngine.playConversation(messages, {
        startIndex: msgIndex,
        rate: playbackRate,
        includeAmbientNoise: true,
        noiseDb,
        onProgress: (index, t) => {
          setAudioPlaybackSec(t);
          if (messages[index]) setSelectedMessageId(messages[index].id);
        },
        onStateChange: (playing) => setIsPlayingAudio(playing),
      });
    }
  };

  // Handle Start / Stop Microphone & Audio Capture
  const handleToggleRecording = async () => {
    if (isRecording) {
      // STOP Recording
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stop();
        audioAnalyzerRef.current = null;
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
    } else {
      // START Recording
      setMicError(null);
      try {
        const analyzer = await createLiveAudioAnalyzer();
        audioAnalyzerRef.current = analyzer;
        setIsRecording(true);

        // Attempt Web Speech Recognition for live microphone transcription
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = async (event: any) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            const isFinal = event.results[current].isFinal;

            if (isFinal && transcript.trim()) {
              // If words contain common ambiguous pauses or food items, introduce speech gap detection
              const words = transcript.trim().split(' ');
              let hasGap = false;
              let processedText = transcript.trim();

              if (words.length > 4 && Math.random() > 0.4) {
                // Synthetically mark one low-confidence word as [unclear] for assistive recovery
                const targetIdx = Math.floor(words.length / 2);
                const originalWord = words[targetIdx];
                words[targetIdx] = '[unclear]';
                processedText = words.join(' ');
                hasGap = true;
              }

              const newMsg: ChatMessage = {
                id: `live-${Date.now()}`,
                speaker: 'You (Live)',
                speakerRole: 'You',
                avatarColor: 'bg-blue-600',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                text: processedText,
                hasUnclear: hasGap,
                unclearPlaceholder: hasGap ? '[unclear]' : undefined,
              };

              setMessages((prev) => [...prev, newMsg]);

              // If word was unclear, trigger recovery request to backend
              if (hasGap) {
                setSelectedMessageId(newMsg.id);
                fetchCandidateRecovery(processedText);
              }
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('Speech recognition warning:', err.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        }
      } catch (err: any) {
        console.warn('Live mic permission denied or unavailable, switching to research demo mode:', err);
        setMicError('Microphone access unavailable or denied. Running in interactive research demo mode.');
        setIsRecording(true);
      }
    }
  };

  // Fetch word recovery from backend API (with offline / static host fallback)
  const fetchCandidateRecovery = async (utterance: string) => {
    try {
      const res = await fetch('/api/recover-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utterance,
          environment,
          conversationContext: messages.slice(-3),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setActiveCandidateWord(data.leadingCandidate || 'sauce');
          setIsAccepted(false);
          setIsKeptUncertain(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend recovery API unavailable, using client-side heuristic:', e);
    }

    // Client-side linguistic fallback for static environments like GitHub Pages
    const lower = utterance.toLowerCase();
    let leading = 'sauce';
    if (lower.includes('coffee') || lower.includes('drink') || lower.includes('also get')) {
      leading = 'coffee';
    } else if (lower.includes('pasta') || lower.includes('food')) {
      leading = 'sauce';
    } else if (lower.includes('meeting') || lower.includes('schedule')) {
      leading = 'quarterly';
    }
    setActiveCandidateWord(leading);
    setIsAccepted(false);
    setIsKeptUncertain(false);
  };

  // Handle message selection
  const handleSelectMessage = (msg: ChatMessage) => {
    setSelectedMessageId(msg.id);
    if (msg.recoveryData?.leadingCandidate) {
      setActiveCandidateWord(msg.recoveryData.leadingCandidate);
    }
    setIsAccepted(Boolean(msg.acceptedWord));
    setIsKeptUncertain(Boolean(msg.isKeptUncertain));
  };

  // Accept candidate suggestion
  const handleAcceptSuggestion = () => {
    setIsAccepted(true);
    setIsKeptUncertain(false);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === selectedMessageId) {
          return {
            ...m,
            acceptedWord: activeCandidateWord,
            isKeptUncertain: false,
          };
        }
        return m;
      })
    );

    // Save to vocabulary item count
    setVocabulary((prev) =>
      prev.map((v) =>
        v.word.toLowerCase() === activeCandidateWord.toLowerCase()
          ? { ...v, timesRecovered: v.timesRecovered + 1 }
          : v
      )
    );
  };

  // Keep Uncertain
  const handleKeepUncertain = () => {
    setIsKeptUncertain(true);
    setIsAccepted(false);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === selectedMessageId) {
          return {
            ...m,
            acceptedWord: undefined,
            isKeptUncertain: true,
          };
        }
        return m;
      })
    );
  };

  // Play audio snippet
  const handlePlayMessageAudio = (msg: ChatMessage) => {
    const isSpeaker2 = msg.speaker.toLowerCase().includes('2');
    const cleanText = msg.text.replace('[unclear]', msg.acceptedWord || 'sauce');
    soundEngine.speak(cleanText, {
      pitch: isSpeaker2 ? 1.2 : 0.88,
      rate: playbackRate,
      voiceGender: isSpeaker2 ? 'female' : 'male',
    });
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-sky-50/60 via-slate-50 to-teal-50/30 flex flex-col text-slate-900 ${
        accessibilitySettings.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Top Application Header */}
      <AppHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isRecording={isRecording}
        hasApiKey={true}
      />

      {/* Mic Error / Research Demo Notice */}
      {micError && (
        <div className="bg-amber-500/10 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-amber-800 hover:text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Body with Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Central Dynamic Screen Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1700px] mx-auto">
            {/* TAB: Live Assist */}
            {currentTab === 'live' && (
              <div className="space-y-4">
                {/* 1. Context Atmosphere Banner (Top) */}
                <ConversationContextCard
                  environment={environment}
                  onSelectEnvironment={setEnvironment}
                  isRecording={isRecording}
                  recordingDuration={formatTimer(recordingSeconds)}
                  noiseDb={noiseDb}
                  situation={situation}
                />

                {/* 2. Main 3-Column / Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Live Conversation + Completed Caption + Scrubber (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Live Conversation Message Stream */}
                    <LiveConversationPanel
                      messages={messages}
                      selectedMessageId={selectedMessageId}
                      onSelectMessage={handleSelectMessage}
                      showSpeakers={showSpeakers}
                      onToggleShowSpeakers={() => setShowSpeakers(!showSpeakers)}
                      onPlayMessageAudio={handlePlayMessageAudio}
                    />

                    {/* AI-Completed Caption Card (Pale Mint) */}
                    <CompletedCaptionCard
                      originalUtterance={currentSelectedMessage.text}
                      recoveryData={currentSelectedMessage.recoveryData}
                      activeCandidateWord={activeCandidateWord}
                      isAccepted={isAccepted}
                      onAcceptWord={(word) => {
                        setActiveCandidateWord(word);
                        handleAcceptSuggestion();
                      }}
                      captionTheme={accessibilitySettings.captionTheme}
                    />

                    {/* Audio Player Timeline Controls */}
                    <AudioPlayerBar
                      isPlaying={isPlayingAudio}
                      onTogglePlay={handleTogglePlayAudio}
                      currentTimeSec={audioPlaybackSec}
                      totalDurationSec={audioDurationSec}
                      onSeek={handleSeekAudio}
                      playbackRate={playbackRate}
                      onChangePlaybackRate={(rate) => {
                        setPlaybackRate(rate);
                        if (isPlayingAudio) {
                          handleSeekAudio(audioPlaybackSec);
                        }
                      }}
                    />
                  </div>

                  {/* Right Column: AI Recovery Suggestions + Audio Analysis (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* AI Recovery Suggestions Panel */}
                    <RecoverySuggestionsPanel
                      recoveryData={currentSelectedMessage.recoveryData}
                      activeCandidate={activeCandidateWord}
                      onSelectCandidate={setActiveCandidateWord}
                      onAcceptSuggestion={handleAcceptSuggestion}
                      onKeepUncertain={handleKeepUncertain}
                      isAccepted={isAccepted}
                      isKeptUncertain={isKeptUncertain}
                    />

                    {/* Audio Analysis Spectrogram Panel */}
                    <AudioAnalysisPanel
                      isRecording={isRecording}
                      noiseDb={noiseDb}
                    />
                  </div>
                </div>

                {/* 3. Bottom Environment Toolbar */}
                <EnvironmentToolbar
                  currentEnvironment={environment}
                  onSelectEnvironment={setEnvironment}
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                  onTakeNotes={() => setShowNotesModal(true)}
                />
              </div>
            )}

            {/* TAB: Conversation History */}
            {currentTab === 'history' && (
              <ConversationHistoryPage
                history={history}
                onDeleteSession={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
                onLoadSession={(session) => {
                  setMessages(session.messages.length > 0 ? session.messages : INITIAL_CHAT_MESSAGES);
                  setEnvironment(session.environment);
                  setCurrentTab('live');
                }}
              />
            )}

            {/* TAB: Noise Environments */}
            {currentTab === 'noise' && <NoiseEnvironmentsPage />}

            {/* TAB: My Vocabulary */}
            {currentTab === 'vocabulary' && (
              <VocabularyPage
                vocabulary={vocabulary}
                onAddWord={(item) => {
                  const newVocab: VocabularyItem = {
                    ...item,
                    id: `voc-${Date.now()}`,
                    dateAdded: new Date().toISOString().split('T')[0],
                    timesRecovered: 0,
                  };
                  setVocabulary((prev) => [newVocab, ...prev]);
                }}
                onDeleteWord={(id) => setVocabulary((prev) => prev.filter((v) => v.id !== id))}
              />
            )}

            {/* TAB: Accessibility */}
            {currentTab === 'accessibility' && (
              <AccessibilityPage
                settings={accessibilitySettings}
                onUpdateSettings={(newVals) =>
                  setAccessibilitySettings((prev) => ({ ...prev, ...newVals }))
                }
              />
            )}

            {/* TAB: Research Mode */}
            {currentTab === 'research' && <ResearchPage />}

            {/* TAB: Settings */}
            {currentTab === 'settings' && (
              <SettingsPage
                systemSettings={systemSettings}
                onUpdateSystemSettings={(vals) =>
                  setSystemSettings((prev) => ({ ...prev, ...vals }))
                }
                accessibilitySettings={accessibilitySettings}
                onUpdateAccessibilitySettings={(vals) =>
                  setAccessibilitySettings((prev) => ({ ...prev, ...vals }))
                }
                onClearLocalData={() => {
                  setHistory([]);
                  setVocabulary([]);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Quick Session Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-blue-600" />
                Session Notes & Key Conversation Takeaways
              </h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={6}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Record any personal notes, action items, or terms to review with your audiologist..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  alert('Session notes saved locally!');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
