import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Screen, Nav } from './screens/child/nav';
import { useApp } from './core/state';
import { todayStamp } from './core/catalog';
import { isWithinSchedules, nextScheduleLabel } from './core/time';
import { ChildFrame } from './components/ChildFrame';
import Home from './screens/child/Home';
import { Videos, VideoDetail, VideoPlayer } from './screens/child/Videos';
import { SearchScreen, SearchResults, Reader } from './screens/child/Search';
import { CatalogList, Help, Routine, Calm, TimeUp, ScheduleClosed } from './screens/child/Other';
import ParentGate from './screens/parent/ParentGate';
import ParentSpace from './screens/parent/ParentSpace';

export default function App() {
  const { state, ready, activeProfile, timeUp, dispatch } = useApp();
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const [parentOpen, setParentOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [clock, setClock] = useState(0);
  const current = stack[stack.length - 1];

  // Le temps ne tourne que dans l'espace enfant, jamais dans l'espace parent.
  useEffect(() => {
    if (!ready || parentOpen || timeUp) return;
    const timer = window.setInterval(() => {
      dispatch({ type: 'tick', seconds: 5, day: todayStamp() });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [ready, parentOpen, timeUp, dispatch]);

  // Re-evalue les horaires sans notification ni rechargement.
  useEffect(() => {
    const timer = window.setInterval(() => setClock((value) => value + 1), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduleClosed = useMemo(
    () => state.rules.enforceSchedules && !isWithinSchedules(state.schedules, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.rules.enforceSchedules, state.schedules, clock],
  );
  const restricted = timeUp || scheduleClosed;

  const openParent = useCallback(() => { setParentOpen(true); setUnlocked(false); }, []);
  const closeParent = useCallback(() => {
    setParentOpen(false);
    setUnlocked(false);
    setStack([{ name: 'home' }]);
  }, []);

  const nav: Nav = useMemo(() => ({
    current,
    go: (screen: Screen) => setStack((previous) => [...previous, screen]),
    back: () => setStack((previous) => previous.length > 1 ? previous.slice(0, -1) : previous),
    home: () => setStack([{ name: 'home' }]),
    openParent,
  }), [current, openParent]);

  function renderScreen() {
    if (restricted && current.name !== 'help' && current.name !== 'calm') {
      return timeUp
        ? <TimeUp nav={nav} />
        : <ScheduleClosed nav={nav} next={nextScheduleLabel(state.schedules)} />;
    }
    switch (current.name) {
      case 'home': return <Home nav={nav} />;
      case 'videos': return <Videos nav={nav} />;
      case 'detail': return <VideoDetail nav={nav} />;
      case 'player': return <VideoPlayer nav={nav} />;
      case 'search': return <SearchScreen nav={nav} />;
      case 'results': return <SearchResults nav={nav} />;
      case 'reader': return <Reader nav={nav} />;
      case 'learn': return <CatalogList nav={nav} mode="learn" />;
      case 'music': return <CatalogList nav={nav} mode="music" />;
      case 'favorites': return <CatalogList nav={nav} mode="favorites" />;
      case 'help': return <Help nav={nav} />;
      case 'routine': return <Routine nav={nav} />;
      case 'calm': return <Calm nav={nav} />;
      case 'timeup': return <TimeUp nav={nav} />;
      default: return <Home nav={nav} />;
    }
  }

  const phoneProps = {
    'data-theme': activeProfile.theme,
    'data-animations': state.sensory.animations ? 'true' : 'false',
    'data-slow': state.sensory.slowTransitions ? 'true' : 'false',
    'data-minimal': state.sensory.minimalMode ? 'true' : 'false',
    'data-text': state.sensory.largeText ? 'large' : 'normal',
  };

  return (
    <div className="stage">
      <aside className="stage-note">
        <div className="kicker">Prototype interactif</div>
        <h1>OasisNet</h1>
        <p>Un Internet calme, prévisible et sécurisé pour les enfants. Tout fonctionne localement, sans publicité ni traceur.</p>
        <ul>
          <li>Espace enfant : 4 choix maximum, pictogrammes, phrases courtes.</li>
          <li>Vidéos et recherche filtrées par les règles des parents.</li>
          <li>Temps d'écran, routine, AIDE et faible stimulation.</li>
          <li>Espace parent protégé : touchez 🔒 en haut à droite.</li>
        </ul>
        <p className="foot">Premier accès parent : créez votre code PIN. Aucun code par défaut.</p>
      </aside>

      <div className="phone" {...phoneProps}>
        <div className="app">
          {!ready ? (
            <div className="screen-scroll">
              <div className="empty-state"><span aria-hidden="true">🫧</span><h2>On prépare ton espace calme…</h2></div>
            </div>
          ) : parentOpen ? (
            unlocked
              ? <ParentSpace onClose={closeParent} />
              : <ParentGate onUnlock={() => setUnlocked(true)} onCancel={closeParent} />
          ) : (
            <ChildFrame nav={nav} onParent={openParent} restricted={restricted}>
              {renderScreen()}
            </ChildFrame>
          )}
        </div>
      </div>
    </div>
  );
}
