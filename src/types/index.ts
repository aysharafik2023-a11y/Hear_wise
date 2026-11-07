export type EnvironmentType = 'Quiet' | 'Café' | 'Traffic' | 'Meeting' | 'Classroom' | 'Custom' | 'Auto detect';

export interface CandidateWord {
  word: string;
  score: number; // 0.0 to 1.0 (e.g. 0.78 = 78%)
  phoneticMatch: 'High' | 'Medium' | 'Low';
  rationale: string;
}

export interface RecoveryData {
  leadingCandidate: string;
  candidates: CandidateWord[];
  completedUtterance: string;
  reasons: string[];
  acousticEvidence: string;
  confidenceCategory: 'High' | 'Moderate' | 'Tentative';
  limitationsWarning: string;
  source?: string;
  accepted?: boolean;
  userOverrideWord?: string;
}

export interface ChatMessage {
  id: string;
  speaker: string;
  speakerRole?: 'Speaker 1' | 'Speaker 2' | 'You' | 'Other';
  avatarUrl?: string;
  avatarColor?: string;
  timestamp: string;
  text: string;
  hasUnclear: boolean;
  unclearPlaceholder?: string;
  audioDuration?: string;
  recoveryData?: RecoveryData;
  acceptedWord?: string;
  isKeptUncertain?: boolean;
}

export interface SessionHistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  environment: EnvironmentType;
  noiseLevelDb: number;
  language: string;
  totalWords: number;
  unclearCount: number;
  acceptedCount: number;
  messages: ChatMessage[];
  completedSummary: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  category: 'Dining' | 'Medical' | 'Work' | 'Everyday' | 'Names';
  phoneticHint: string;
  dateAdded: string;
  timesRecovered: number;
  notes?: string;
}

export interface ResearchSample {
  id: string;
  name: string;
  environment: string;
  snrDb: number;
  audioDurationSec: number;
  referenceTranscript: string;
  baselineAsrTranscript: string;
  hearwiseTranscript: string;
  notes: string;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  captionTheme: 'mint' | 'light' | 'dark' | 'yellow-on-black';
  highlightInferred: boolean;
  showUncertaintyLabels: boolean;
  reducedMotion: boolean;
  visualNoiseAlerts: boolean;
  dyslexicFont: boolean;
  ttsSpeed: number; // 0.8 - 1.5
}

export interface SystemSettings {
  microphoneId: string;
  inputGain: number;
  noiseSuppressionActive: boolean;
  hearingAidPreset: 'Flat' | 'High-Frequency Boost' | 'Cochlear Implant Sharp' | 'Speech Focus';
  recoveryThreshold: number; // 0.50 to 0.90
  candidateCount: number;
  saveTranscriptsLocally: boolean;
  saveRecordingsLocally: boolean;
  demoMode: boolean;
}
