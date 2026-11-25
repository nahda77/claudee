import type { ReactNode } from 'react';
import type { Nav } from '../screens/child/nav';
import { useApp } from '../core/state';

export function minutesLeft(seconds: number): number {
  return Math.max(0, Math.ceil(seconds / 60));
}

export function ChildFrame({ nav, children, onParent, restricted = false }: {
  nav: Nav; children: ReactNode; onParent: () => void; restricted?: boolean;
}) {
  const { activeProfile, remainingSeconds } = useApp();
  const left = minutesLeft(remainingSeconds);
  const low = left <= 5;
  const showBack = nav.current.name !== 'home';

  return (
    <>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">🫧</span> OasisNet</div>
        <div className="top-actions">
          <span className={`time-chip ${low ? 'low' : ''}`}>⏳ {left} min</span>
          <button type="button" className="icon-btn" onClick={onParent} aria-label="Espace parent">
            🔒 <span className="sr-only">Espace parent</span>
          </button>
          <button type="button" className="icon-btn help" onClick={() => nav.go({ name: 'help' })}>🆘 AIDE</button>
        </div>
      </header>

      <main className="screen-scroll" key={nav.current.name + (nav.current.itemId ?? '')}>
        {low && remainingSeconds > 0 && (
          <div className="time-banner" role="status">
            🕊️ Encore {left} {left > 1 ? 'minutes' : 'minute'}. Tu peux finir tranquillement.
          </div>
        )}
        {children}
      </main>

      <footer className="bottom-bar">
        {!restricted && <button type="button" onClick={nav.home}>🏠 Accueil</button>}
        {!restricted && showBack && <button type="button" onClick={nav.back}>↩️ Retour</button>}
        <button type="button" className="primary" onClick={() => nav.go({ name: 'help' })}>🆘 Aide</button>
        <button type="button" onClick={onParent} title={`Espace parent — profil ${activeProfile.name}`}>🔒 Parent</button>
      </footer>
    </>
  );
}
