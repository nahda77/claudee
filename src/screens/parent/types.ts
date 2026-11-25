export type TabId =
  | 'dashboard' | 'rules' | 'profiles' | 'time' | 'sensory'
  | 'history' | 'recommendations' | 'routine' | 'privacy';

export type SetTab = (tab: TabId) => void;
