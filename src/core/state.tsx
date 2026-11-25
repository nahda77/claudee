import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import type {
  AppState, ChildProfile, EmergencyContact, HistoryType, ParentAccount, Recommendation,
  RoutineStep, RuleSet, SensorySettings, Schedule,
} from './types';
import { createInitialState, newProfile, todayStamp } from './catalog';
import { clearStoredData, hashPin, loadState, saveState, verifyPin, newSalt, registerBiometric, authenticateBiometric } from './security';
import { uid } from './utils';

type LogInput = { type: HistoryType; label: string; detail?: string; site?: string };

export type Action =
  | { type: 'replace'; state: AppState }
  | { type: 'activeProfile'; id: string }
  | { type: 'addProfile'; profile: ChildProfile }
  | { type: 'updateProfile'; id: string; patch: Partial<ChildProfile> }
  | { type: 'removeProfile'; id: string }
  | { type: 'rules'; patch: Partial<RuleSet> }
  | { type: 'sensory'; patch: Partial<SensorySettings> }
  | { type: 'schedules'; schedules: Schedule[] }
  | { type: 'contacts'; contacts: EmergencyContact[] }
  | { type: 'parent'; parent: ParentAccount | null }
  | { type: 'log'; entry: LogInput }
  | { type: 'clearHistory' }
  | { type: 'favorite'; itemId: string }
  | { type: 'tick'; seconds: number; day: string }
  | { type: 'bonus'; minutes: number }
  | { type: 'recommendations'; items: Recommendation[] }
  | { type: 'decideRecommendation'; id: string; status: 'approved' | 'rejected' }
  | { type: 'routine'; routine: RoutineStep[] };

function mapActive(state: AppState, fn: (profile: ChildProfile) => ChildProfile): AppState {
  return { ...state, profiles: state.profiles.map((p) => (p.id === state.activeProfileId ? fn(p) : p)) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replace': return action.state;
    case 'activeProfile':
      return state.profiles.some((p) => p.id === action.id) ? { ...state, activeProfileId: action.id } : state;
    case 'addProfile': return { ...state, profiles: [...state.profiles, action.profile], activeProfileId: action.profile.id };
    case 'updateProfile':
      return { ...state, profiles: state.profiles.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case 'removeProfile': {
      if (state.profiles.length <= 1) return state;
      const profiles = state.profiles.filter((p) => p.id !== action.id);
      return { ...state, profiles, activeProfileId: state.activeProfileId === action.id ? profiles[0].id : state.activeProfileId };
    }
    case 'rules': return { ...state, rules: { ...state.rules, ...action.patch } };
    case 'sensory': return { ...state, sensory: { ...state.sensory, ...action.patch } };
    case 'schedules': return { ...state, schedules: action.schedules };
    case 'contacts': return { ...state, contacts: action.contacts };
    case 'parent': return { ...state, parent: action.parent };
    case 'log': {
      const entry = {
        id: uid(), at: Date.now(), profileId: state.activeProfileId,
        type: action.entry.type, label: action.entry.label,
        detail: action.entry.detail, site: action.entry.site,
      };
      // Journalisation minimale : 200 evenements maximum, sur l appareil uniquement.
      return { ...state, history: [entry, ...state.history].slice(0, 200) };
    }
    case 'clearHistory': return { ...state, history: [] };
    case 'favorite':
      return mapActive(state, (p) => ({
        ...p,
        favorites: p.favorites.includes(action.itemId)
          ? p.favorites.filter((id) => id !== action.itemId)
          : [...p.favorites, action.itemId],
      }));
    case 'tick':
      return mapActive(state, (p) => {
        const freshDay = p.dayStamp !== action.day;
        const used = (freshDay ? 0 : p.secondsUsed) + (freshDay ? 0 : action.seconds);
        return { ...p, secondsUsed: used, dayStamp: action.day, bonusMinutes: freshDay ? 0 : p.bonusMinutes };
      });
    case 'bonus': return mapActive(state, (p) => ({ ...p, bonusMinutes: p.bonusMinutes + action.minutes }));
    case 'recommendations': {
      const known = new Set(state.recommendations.map((r) => `${r.profileId}:${r.itemId}`));
      const fresh = action.items.filter((r) => !known.has(`${r.profileId}:${r.itemId}`));
      return fresh.length ? { ...state, recommendations: [...fresh, ...state.recommendations].slice(0, 60) } : state;
    }
    case 'decideRecommendation':
      return {
        ...state,
        recommendations: state.recommendations.map((r) =>
          r.id === action.id ? { ...r, status: action.status, decidedAt: Date.now() } : r),
      };
    case 'routine': return mapActive(state, (p) => ({ ...p, routine: action.routine }));
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  ready: boolean;
  activeProfile: ChildProfile;
  remainingSeconds: number;
  timeUp: boolean;
  dispatch: (action: Action) => void;
  log: (entry: LogInput) => void;
  toggleFavorite: (id: string) => void;
  blockSite: (site: string) => void;
  allowSite: (site: string) => void;
  blockKeyword: (keyword: string) => void;
  blockChannel: (channel: string) => void;
  addMinutes: (minutes: number) => void;
  addProfile: (name: string, emoji: string) => void;
  setupPin: (pin: string) => Promise<void>;
  checkPin: (pin: string) => Promise<boolean>;
  enableBiometrics: () => Promise<boolean>;
  biometricUnlock: () => Promise<boolean>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const saved = await loadState();
      if (!alive) return;
      if (saved && saved.version === 1 && saved.profiles?.length) {
        const defaults = createInitialState();
        dispatch({ type: 'replace', state: {
          ...defaults, ...saved,
          rules: { ...defaults.rules, ...saved.rules },
          sensory: { ...defaults.sensory, ...saved.sensory },
        } });
      }
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => { void saveState(state); }, 300);
    return () => window.clearTimeout(timer);
  }, [state, ready]);

  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];
  const allowedSeconds = (activeProfile.dailyMinutes + activeProfile.bonusMinutes) * 60;
  const remainingSeconds = Math.max(0, allowedSeconds - activeProfile.secondsUsed);
  const timeUp = remainingSeconds <= 0;

  const log = useCallback((entry: LogInput) => dispatch({ type: 'log', entry }), []);
  const toggleFavorite = useCallback((id: string) => dispatch({ type: 'favorite', itemId: id }), []);
  const addMinutes = useCallback((minutes: number) => dispatch({ type: 'bonus', minutes }), []);
  const addProfile = useCallback((name: string, emoji: string) => dispatch({ type: 'addProfile', profile: newProfile(name, emoji) }), []);

  const blockSite = useCallback((site: string) => {
    const clean = site.trim().toLowerCase();
    if (!clean) return;
    const next = [...new Set([...state.rules.blockedSites, clean])];
    const allowed = state.rules.allowedSites.filter((s) => !s.includes(clean));
    dispatch({ type: 'rules', patch: { blockedSites: next, allowedSites: allowed } });
  }, [state.rules]);

  const allowSite = useCallback((site: string) => {
    const clean = site.trim().toLowerCase();
    if (!clean) return;
    dispatch({ type: 'rules', patch: {
      allowedSites: [...new Set([...state.rules.allowedSites, clean])],
      blockedSites: state.rules.blockedSites.filter((s) => !s.includes(clean)),
    } });
  }, [state.rules]);

  const blockKeyword = useCallback((keyword: string) => {
    const clean = keyword.trim().toLowerCase();
    if (!clean) return;
    dispatch({ type: 'rules', patch: { blockedKeywords: [...new Set([...state.rules.blockedKeywords, clean])] } });
  }, [state.rules]);

  const blockChannel = useCallback((channel: string) => {
    const clean = channel.trim();
    if (!clean) return;
    dispatch({ type: 'rules', patch: { blockedChannels: [...new Set([...state.rules.blockedChannels, clean])] } });
  }, [state.rules]);

  const setupPin = useCallback(async (pin: string) => {
    const salt = newSalt();
    const pinHash = await hashPin(pin, salt);
    dispatch({ type: 'parent', parent: { pinHash, salt, createdAt: Date.now() } });
  }, []);

  const checkPin = useCallback(async (pin: string) => {
    if (!state.parent) return false;
    return verifyPin(pin, state.parent.salt, state.parent.pinHash);
  }, [state.parent]);

  const enableBiometrics = useCallback(async () => {
    if (!state.parent) return false;
    const id = await registerBiometric();
    if (!id) return false;
    dispatch({ type: 'parent', parent: { ...state.parent, biometricCredentialId: id } });
    return true;
  }, [state.parent]);

  const biometricUnlock = useCallback(async () => {
    if (!state.parent?.biometricCredentialId) return false;
    return authenticateBiometric(state.parent.biometricCredentialId);
  }, [state.parent]);

  const resetAll = useCallback(async () => {
    await clearStoredData();
    dispatch({ type: 'replace', state: createInitialState() });
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    state, ready, activeProfile, remainingSeconds, timeUp, dispatch, log, toggleFavorite,
    blockSite, allowSite, blockKeyword, blockChannel, addMinutes, addProfile,
    setupPin, checkPin, enableBiometrics, biometricUnlock, resetAll,
  }), [
    state, ready, activeProfile, remainingSeconds, timeUp, log, toggleFavorite,
    blockSite, allowSite, blockKeyword, blockChannel, addMinutes, addProfile,
    setupPin, checkPin, enableBiometrics, biometricUnlock, resetAll,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp doit etre utilise dans AppProvider');
  return context;
}

export function currentDay(): string { return todayStamp(); }
