import { useEffect, useRef, useState } from 'react';
import type { Nav } from './nav';
import type { ContentItem } from '../../core/types';
import { CATALOG } from '../../core/catalog';
import { evaluateAll } from '../../core/rules';
import { useApp } from '../../core/state';
import { haptic } from '../../core/utils';
import { BigButton, ContentCard, EmptyState, Modal, Note, ProgressBar, ScreenTitle, Section, SmallButton } from '../../components/ui';

export function CatalogList({ nav, mode }: { nav: Nav; mode: 'learn' | 'music' | 'favorites' }) {
  const { state, activeProfile, toggleFavorite, log } = useApp();
  const [all, setAll] = useState(false);
  const items: ContentItem[] = mode === 'favorites'
    ? CATALOG.filter((item) => activeProfile.favorites.includes(item.id))
    : mode === 'music'
      ? CATALOG.filter((item) => item.kind === 'music')
      : CATALOG.filter((item) => item.kind === 'activity' || item.tags.includes('apprendre')).slice(0, 10);

  const evaluated = evaluateAll(items, state.rules);
  const shown = all ? evaluated : evaluated.slice(0, 4);
  const config = {
    learn: { emoji: '📚', title: 'Apprendre', subtitle: 'Une activité à la fois. Pas de chronomètre.' },
    music: { emoji: '🎵', title: 'Musique', subtitle: 'Les sons ne démarrent jamais tout seuls.' },
    favorites: { emoji: '⭐', title: 'Mes favoris', subtitle: 'Les contenus que tu as gardés.' },
  }[mode];

  function open(item: ContentItem) {
    if (item.kind === 'activity') {
      log({ type: 'routine', label: `Activité : ${item.simpleTitle}`, detail: item.summary });
      nav.go({ name: 'calm', message: `${item.summary} Quand tu as fini, touche Retour.` });
    } else {
      nav.go({ name: 'detail', itemId: item.id });
    }
  }

  return (
    <>
      <ScreenTitle emoji={config.emoji} title={config.title} subtitle={config.subtitle} />
      {shown.length === 0 && (
        <EmptyState emoji="⭐" title="Pas encore de favori" text="Tu peux ajouter une vidéo avec le bouton ☆.">
          <SmallButton onClick={() => nav.go({ name: 'videos' })}>🎬 Voir les vidéos</SmallButton>
        </EmptyState>
      )}
      {shown.map(({ item, evaluation }) => (
        <ContentCard key={item.id} item={item} evaluation={evaluation} onClick={() => open(item)}
          favorite={activeProfile.favorites.includes(item.id)} onFavorite={() => toggleFavorite(item.id)} />
      ))}
      {evaluated.length > 4 && (
        <div className="button-row">
          <SmallButton variant="quiet" onClick={() => setAll(!all)}>{all ? '↑ Voir moins' : '↓ Voir plus'}</SmallButton>
        </div>
      )}
      <Note tone="calm">Tu peux revenir à l’accueil quand tu veux. Rien ne change tout seul.</Note>
    </>
  );
}

export function Help({ nav }: { nav: Nav }) {
  const { state, log } = useApp();
  const [confirm, setConfirm] = useState<{ label: string; phone: string } | null>(null);
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    log({ type: 'help', label: 'L’enfant a demandé de l’aide', detail: 'Écran AIDE' });
  }, [log]);

  return (
    <>
      <ScreenTitle emoji="🆘" title="AIDE" subtitle="Je ne sais pas quoi faire." />
      <Note tone="calm">C’est bien de demander. Tu peux choisir une personne, ou simplement respirer.</Note>
      {state.contacts.length === 0 ? (
        <Note tone="info">Un adulte n’a pas encore ajouté de contact. Tu peux demander de l’aide juste ici.</Note>
      ) : (
        <div className="contact-grid">
          {state.contacts.map((contact) => (
            <BigButton key={contact.id} variant="warm" emoji={contact.emoji} label={`Appeler ${contact.label}`}
              onClick={() => setConfirm({ label: contact.label, phone: contact.phone })} />
          ))}
        </div>
      )}
      <div className="more-grid">
        <BigButton emoji="🧑" label="Demander de l'aide" sub="Un message calme"
          onClick={() => nav.go({ name: 'calm', message: 'Un adulte peut t’aider. Tu peux respirer doucement. Rien ne presse.' })} />
        <BigButton variant="quiet" emoji="↩️" label="Retour" sub="Revenir à ce que tu faisais" onClick={nav.back} />
      </div>
      {confirm && (
        <Modal title={`Appeler ${confirm.label} ?`} onClose={() => setConfirm(null)}>
          <p className="muted">On appelle seulement si tu touches « Oui ».</p>
          <div className="button-row">
            <SmallButton variant="danger" onClick={() => setConfirm(null)}>Non</SmallButton>
            <SmallButton variant="primary" onClick={() => {
              log({ type: 'help', label: `Appel demandé : ${confirm.label}` });
              window.location.href = `tel:${confirm.phone.replace(/\s/g, '')}`;
              setConfirm(null);
            }}>Oui, appeler</SmallButton>
          </div>
        </Modal>
      )}
    </>
  );
}

export function Routine({ nav }: { nav: Nav }) {
  const { state, activeProfile, dispatch, log } = useApp();
  const steps = activeProfile.routine;
  const doneCount = steps.filter((step) => step.done).length;
  const currentIndex = steps.findIndex((step) => !step.done);
  const current = currentIndex >= 0 ? steps[currentIndex] : undefined;
  const next = currentIndex >= 0 ? steps[currentIndex + 1] : undefined;

  function markDone() {
    if (currentIndex < 0) return;
    dispatch({ type: 'routine', routine: steps.map((step, i) => (i === currentIndex ? { ...step, done: true } : step)) });
    log({ type: 'routine', label: `Étape terminée : ${steps[currentIndex].label}` });
    haptic(state.sensory.vibration);
  }

  return (
    <>
      <ScreenTitle emoji="🧩" title="Ma routine" subtitle="Je vois maintenant, et ensuite." />
      <Section title="Maintenant" note={current ? 'Une seule chose à la fois.' : 'Tout est terminé.'}>
        {current ? (
          <BigButton variant="primary" emoji={current.emoji} label={current.label}
            sub={next ? `Ensuite : ${next.label}` : 'C’est la dernière étape'} onClick={markDone} />
        ) : (
          <EmptyState emoji="✅" title="Routine terminée." text="Bravo. Tu as fini toutes les étapes.">
            <SmallButton onClick={() => dispatch({ type: 'routine', routine: steps.map((s) => ({ ...s, done: false })) })}>
              ↺ Recommencer
            </SmallButton>
          </EmptyState>
        )}
        <ProgressBar value={doneCount} max={steps.length || 1} label={`${doneCount} étape(s) terminée(s) sur ${steps.length}`} />
      </Section>

      <Section title="Les étapes" note="Ce qui est fait reste visible.">
        {steps.map((step, index) => (
          <div key={step.id} className={`routine-step ${step.done ? 'done' : ''} ${index === currentIndex ? 'current' : ''}`}>
            <span className="step-emoji" aria-hidden="true">{step.emoji}</span>
            <span><strong>{step.label}</strong>
              <small>{step.done ? '✅ Terminé' : index === currentIndex ? '👉 Maintenant' : 'Ensuite'}</small>
            </span>
          </div>
        ))}
      </Section>

      {current && <BigButton emoji="✅" label="C'est fait" sub="Passer à l'étape suivante" onClick={markDone} />}
      <div className="button-row"><SmallButton onClick={nav.home}>🏠 Accueil</SmallButton></div>
    </>
  );
}

export function Calm({ nav }: { nav: Nav }) {
  const message = nav.current.message ?? 'Un adulte peut t’aider. Tu peux prendre ton temps.';
  return (
    <div className="empty-state">
      <span aria-hidden="true">🫧</span>
      <h2>{message}</h2>
      <p>Rien ne clignote. Rien ne fait de bruit. Tu peux revenir quand tu veux.</p>
      <div className="button-row" style={{ justifyContent: 'center' }}>
        <SmallButton variant="primary" onClick={nav.back}>↩️ Retour</SmallButton>
        <SmallButton onClick={nav.home}>🏠 Accueil</SmallButton>
      </div>
    </div>
  );
}

export function ScheduleClosed({ nav, next }: { nav: Nav; next: string }) {
  return (
    <>
      <ScreenTitle emoji="🕊️" title="Ce n'est pas le moment." subtitle="On garde le même horaire, c'est plus simple." />
      <Section title="Horaires de la famille" note={`Tu pourras revenir à ${next}.`}>
        <BigButton variant="warm" emoji="👨‍👩‍👧" label="Demander à un adulte" sub="Un adulte peut modifier les horaires"
          onClick={nav.openParent} />
      </Section>
      <div className="button-row"><SmallButton onClick={() => nav.go({ name: 'help' })}>🆘 Aide</SmallButton></div>
      <Note tone="calm">Pas de compte à rebours, pas d’alerte. L’application attend tranquillement.</Note>
    </>
  );
}

export function TimeUp({ nav }: { nav: Nav }) {
  const { activeProfile } = useApp();
  return (
    <>
      <ScreenTitle emoji="🌙" title="C'est terminé pour aujourd'hui." subtitle="À demain 👋" />
      <Section title="Temps d'aujourd'hui" note="Tu as utilisé ton temps calme. La journée se termine doucement.">
        <ProgressBar value={activeProfile.secondsUsed} max={(activeProfile.dailyMinutes + activeProfile.bonusMinutes) * 60}
          label="Aujourd'hui" />
      </Section>
      <BigButton variant="warm" emoji="👨‍👩‍👧" label="Demander à un adulte" sub="Un adulte peut ajouter du temps"
        onClick={nav.openParent} />
      <div className="button-row"><SmallButton onClick={() => nav.go({ name: 'help' })}>🆘 Aide</SmallButton></div>
      <Note tone="calm">Pas de compte à rebours, pas de message pressé. Tu pourras revenir demain.</Note>
    </>
  );
}
