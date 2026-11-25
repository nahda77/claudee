export type ThemeId = 'doux' | 'contraste' | 'sombre' | 'minimal';
export type FilterLevel = 'strict' | 'equilibre' | 'ouvert';
export type ContentKind = 'video' | 'page' | 'music' | 'activity';
export type ContentStatus = 'adapte' | 'a-verifier' | 'bloque';
export type RecommendationStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  simpleTitle: string;
  category: string;
  emoji: string;
  color: string;
  site: string;
  channel?: string;
  durationSec?: number;
  summary: string;
  tags: string[];
  url?: string;
  needsReview?: boolean;
  externalId?: string;
}

export interface FilterResult {
  status: ContentStatus;
  label: string;
  reasons: string[];
  needsAdult: boolean;
}

export interface RuleSet {
  level: FilterLevel;
  whitelistOnly: boolean;
  allowedSites: string[];
  blockedSites: string[];
  blockedKeywords: string[];
  allowedCategories: string[];
  blockedChannels: string[];
  trustedChannels: string[];
  maxVideoMinutes: number;
  requireAdultForUncertain: boolean;
  youtubeManaged: boolean;
  voiceSearchEnabled: boolean;
  externalModeration: boolean;
  enforceSchedules: boolean;
  /** Modules accessibles dans l'espace enfant (equivalent des "applications"). */
  enabledSections: string[];
}

export interface SensorySettings {
  animations: boolean;
  sounds: boolean;
  vibration: boolean;
  slowTransitions: boolean;
  minimalMode: boolean;
  largeText: boolean;
}

export interface Schedule {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface RoutineStep {
  id: string;
  label: string;
  emoji: string;
  done: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  emoji: string;
  theme: ThemeId;
  interests: string[];
  favorites: string[];
  dailyMinutes: number;
  bonusMinutes: number;
  secondsUsed: number;
  dayStamp: string;
  routine: RoutineStep[];
}

export type HistoryType = 'video' | 'search' | 'blocked' | 'help' | 'routine' | 'page' | 'music';

export interface HistoryEntry {
  id: string;
  at: number;
  profileId: string;
  type: HistoryType;
  label: string;
  detail?: string;
  site?: string;
}

export interface Recommendation {
  id: string;
  itemId: string;
  profileId: string;
  reason: string;
  status: RecommendationStatus;
  decidedAt?: number;
}

export interface EmergencyContact {
  id: string;
  label: string;
  emoji: string;
  phone: string;
}

export interface ParentAccount {
  pinHash: string;
  salt: string;
  biometricCredentialId?: string;
  createdAt: number;
}

export interface AppState {
  version: number;
  profiles: ChildProfile[];
  activeProfileId: string;
  rules: RuleSet;
  sensory: SensorySettings;
  schedules: Schedule[];
  history: HistoryEntry[];
  recommendations: Recommendation[];
  contacts: EmergencyContact[];
  parent: ParentAccount | null;
}
