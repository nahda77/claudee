import { useState } from 'react';
import type { TabId } from './types';
import ParentDashboard from './ParentDashboard';
import ParentRules from './ParentRules';
import ParentProfiles from './ParentProfiles';
import { TimeTab, SensoryTab, HistoryTab, RecommendationsTab, RoutineTab, PrivacyTab } from './ParentExtras';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: '📊 Tableau de bord' },
  { id: 'rules', label: '⚙️ Règles' },
  { id: 'profiles', label: '👨‍👩‍👧 Profils' },
  { id: 'time', label: '⏳ Temps' },
  { id: 'sensory', label: '🫧 Sensoriel' },
  { id: 'history', label: '📜 Historique' },
  { id: 'recommendations', label: '💡 Idées' },
  { id: 'routine', label: '🧩 Routine' },
  { id: 'privacy', label: '🔐 Confidentialité' },
];

export default function ParentSpace({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">🔒</span> Espace parent</div>
        <div className="top-actions">
          <button type="button" className="icon-btn" onClick={onClose}>↩️ Fermer</button>
        </div>
      </header>

      <nav className="parent-tabs" aria-label="Sections de l'espace parent">
        {TABS.map((entry) => (
          <button type="button" key={entry.id} className={`parent-tab ${tab === entry.id ? 'active' : ''}`}
            onClick={() => setTab(entry.id)}>{entry.label}</button>
        ))}
      </nav>

      <main className="screen-scroll parent" key={tab}>
        {tab === 'dashboard' && <ParentDashboard setTab={setTab} />}
        {tab === 'rules' && <ParentRules />}
        {tab === 'profiles' && <ParentProfiles />}
        {tab === 'time' && <TimeTab />}
        {tab === 'sensory' && <SensoryTab />}
        {tab === 'history' && <HistoryTab setTab={setTab} />}
        {tab === 'recommendations' && <RecommendationsTab setTab={setTab} />}
        {tab === 'routine' && <RoutineTab />}
        {tab === 'privacy' && <PrivacyTab onClose={onClose} />}
      </main>

      <footer className="bottom-bar">
        <button type="button" onClick={onClose}>↩️ Retour à l’espace enfant</button>
      </footer>
    </>
  );
}
