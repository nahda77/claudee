import { useEffect, useMemo, useRef, useState } from 'react';
import type { Nav } from './nav';
import type { ContentItem } from '../../core/types';
import { CATEGORIES, CATALOG } from '../../core/catalog';
import { DISCLAIMER } from '../../core/sources';
import { evaluateAll, evaluateContent, searchCatalog } from '../../core/rules';
import { isVoiceSupported, listenOnce } from '../../core/voice';
import { useApp } from '../../core/state';
import { formatDuration, haptic } from '../../core/utils';
import {
  BigButton, ContentCard, EmptyState, Note, ProgressBar, ScreenTitle, Section, SmallButton, StatusBadge,
} from '../../components/ui';

export function Videos({ nav }: { nav: Nav }) {
  const { state, activeProfile, log } = useApp();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [category, setCategory] = useState<string | null>(nav.current.category ?? null);
  const [allCategories, setAllCategories] = useState(false);
  const [allResults, setAllResults] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');

  const ordered = useMemo(() => [...CATEGORIES].sort(
    (a, b) => Number(activeProfile.interests.includes(b.id)) - Number(activeProfile.interests.includes(a.id)),
  ), [activeProfile.interests]);

  const videos = CATALOG.filter((item) => item.kind === 'video');
  const results = submitted
    ? searchCatalog(videos, submitted)
    : category
      ? videos.filter((item) => item.category === category)
      : [];
  const evaluated = evaluateAll(results, state.rules);
  const shown = allResults ? evaluated : evaluated.slice(0, 6);
  const voiceOk = state.rules.voiceSearchEnabled && isVoiceSupported();

  function submitSearch() {
    const clean = query.trim();
    if (!clean) return;
    setSubmitted(clean);
    setCategory(null);
    setVoiceMessage('');
    log({ type: 'search', label: `Recherche vidéo : ${clean}`, detail: 'Espace vidéos' });
  }

  function chooseCategory(id: string, label: string) {
    setCategory(id);
    setSubmitted('');
    setQuery('');
    setAllResults(false);
    log({ type: 'video', label: `Catégorie : ${label}`, detail: 'Choix de l’enfant' });
  }

  function openItem(item: ContentItem) {
    const evaluation = evaluateContent(item, state.rules);
    if (evaluation.status === 'bloque') {
      log({ type: 'blocked', label: item.simpleTitle, detail: 'Règle parentale', site: item.site });
    }
    nav.go({ name: 'detail', itemId: item.id });
  }

  return (
    <>
      <ScreenTitle emoji="🎬" title="Qu'aimerais-tu regarder ?" subtitle="Choisis une catégorie ou écris un mot." />

      <div className="search-box">
        <input className="search-input" value={query} placeholder="Écris un mot…" aria-label="Rechercher une vidéo"
          onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }} />
        {voiceOk && (
          <button type="button" className="voice-btn" aria-label="Recherche vocale" title="Parler pour chercher"
            onClick={() => listenOnce(
              (text) => { setQuery(text); setVoiceMessage(`J'ai entendu : ${text}`); },
              () => setVoiceMessage('La recherche vocale n’est pas disponible ici. Tu peux écrire.'),
            )}>🎤</button>
        )}
        <button type="button" className="small-button primary" onClick={submitSearch}>Chercher</button>
      </div>
      {voiceMessage && <Note tone="info">{voiceMessage}</Note>}

      <div className="button-row">
        <SmallButton variant="quiet" onClick={() => { setCategory(null); setSubmitted(''); setQuery(''); }}>
          ☰ Toutes les catégories
        </SmallButton>
      </div>

      {!category && !submitted && (
        <>
          <div className="category-grid">
            {(allCategories ? ordered : ordered.slice(0, 4)).map((cat) => (
              <button type="button" key={cat.id} className="category-card" style={{ background: cat.color }}
                onClick={() => chooseCategory(cat.id, cat.label)}>
                <span aria-hidden="true">{cat.emoji}</span>{cat.label}<small>Voir les vidéos</small>
              </button>
            ))}
          </div>
          <div className="button-row">
            <SmallButton variant="quiet" onClick={() => setAllCategories(!allCategories)}>
              {allCategories ? '↑ Moins de catégories' : '↓ Plus de catégories'}
            </SmallButton>
          </div>
          <Note tone="calm">Ici, il n’y a ni commentaires, ni chat, ni publicité, ni vidéo proposée toute seule.</Note>
        </>
      )}

      {(category || submitted) && (
        <>
          <Section title={submitted ? `Résultats pour « ${submitted} »` : `Vidéos : ${CATEGORIES.find((c) => c.id === category)?.label}`}
            note={`${evaluated.length} vidéo(s). Touche une vidéo pour savoir si elle te convient.`}>
            {shown.length === 0 && (
              <EmptyState emoji="🔎" title="Aucune vidéo trouvée" text="Tu peux essayer un autre mot ou choisir une catégorie.">
                <SmallButton onClick={() => { setSubmitted(''); setCategory(null); }}>Voir les catégories</SmallButton>
              </EmptyState>
            )}
            {shown.map(({ item, evaluation }) => (
              <ContentCard key={item.id} item={item} evaluation={evaluation} onClick={() => openItem(item)}
                footer={
                  <SmallButton variant={evaluation.status === 'bloque' ? 'danger' : 'soft'} onClick={() => openItem(item)}>
                    Est-ce que cette vidéo me convient ?
                  </SmallButton>
                }
              />
            ))}
            {evaluated.length > 6 && (
              <SmallButton variant="quiet" onClick={() => setAllResults(!allResults)}>
                {allResults ? '↑ Voir moins' : `↓ Voir les ${evaluated.length - 6} autres`}
              </SmallButton>
            )}
          </Section>
          <BigButton variant="quiet" emoji="↩️" label="Choisir une autre catégorie"
            onClick={() => { setCategory(null); setSubmitted(''); setQuery(''); }} />
        </>
      )}
    </>
  );
}

export function VideoDetail({ nav }: { nav: Nav }) {
  const { state, activeProfile, log, toggleFavorite } = useApp();
  const item = CATALOG.find((candidate) => candidate.id === nav.current.itemId);
  if (!item) {
    return <EmptyState emoji="↩️" title="Vidéo introuvable" text="Tu peux choisir une autre vidéo.">
      <SmallButton onClick={() => nav.go({ name: 'videos' })}>Retour aux vidéos</SmallButton>
    </EmptyState>;
  }
  const evaluation = evaluateContent(item, state.rules);
  const favorite = activeProfile.favorites.includes(item.id);

  return (
    <>
      <ScreenTitle emoji="❓" title="Est-ce que cette vidéo me convient ?" subtitle="On regarde les règles de la famille." />
      <div className="section">
        <div className="content-card-main" style={{ padding: 0 }}>
          <span className="thumb" style={{ background: item.color, width: 96, height: 88, fontSize: '2.5em' }} aria-hidden="true">{item.emoji}</span>
          <span className="content-card-text">
            <strong style={{ fontSize: '1.05em' }}>{item.simpleTitle}</strong>
            <span className="card-meta">{formatDuration(item.durationSec)} · {item.site}</span>
            {item.channel && <span className="card-meta">Chaîne : {item.channel}</span>}
          </span>
        </div>
        <div style={{ marginTop: 14 }}><StatusBadge status={evaluation.status} /></div>
      </div>

      <Section title={evaluation.label} note={evaluation.reasons.slice(0, 3).join(' · ')}>
        {evaluation.status === 'adapte' && (
          <>
            <p className="muted">D’après les règles des parents, cette vidéo semble convenir.</p>
            <BigButton emoji="▶️" label="Regarder la vidéo" sub="Lecteur simplifié, sans commentaires"
              onClick={() => nav.go({ name: 'player', itemId: item.id })} />
          </>
        )}
        {evaluation.status === 'a-verifier' && (
          <>
            <BigButton variant="warm" emoji="👨‍👩‍👧" label="Demande à un adulte" sub="Un adulte peut vérifier avec toi" onClick={() =>
              nav.go({ name: 'calm', message: 'Demande à un adulte. Tu peux aussi choisir une autre vidéo.' })} />
            <Note tone="warn">Cette vidéo attend l’avis d’un adulte. Elle ne s’ouvre pas toute seule.</Note>
          </>
        )}
        {evaluation.status === 'bloque' && (
          <>
            <BigButton variant="danger" emoji="🔴" label="Cette vidéo n’est pas disponible."
              sub="Tu peux choisir une autre vidéo" onClick={() => nav.go({ name: 'videos' })} />
            <Note tone="info">Un adulte peut modifier les règles dans l’espace parent.</Note>
          </>
        )}
        <div className="button-row">
          <SmallButton onClick={() => toggleFavorite(item.id)}>{favorite ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}</SmallButton>
          <SmallButton onClick={() => {
            log({ type: 'help', label: 'Aide demandée pour une vidéo', detail: item.simpleTitle });
            nav.go({ name: 'help' });
          }}>🆘 Demander de l'aide</SmallButton>
          <SmallButton onClick={() => nav.go({ name: 'videos' })}>↩️ Choisir une autre vidéo</SmallButton>
        </div>
      </Section>

      <p className="disclaimer">{DISCLAIMER}</p>
    </>
  );
}

export function VideoPlayer({ nav }: { nav: Nav }) {
  const { log, state } = useApp();
  const sensory = state.sensory;
  const item = CATALOG.find((candidate) => candidate.id === nav.current.itemId);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const logged = useRef(false);
  const duration = item?.durationSec ?? 300;

  useEffect(() => {
    if (!playing || finished) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= duration) { setPlaying(false); setFinished(true); return duration; }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, finished, duration]);

  useEffect(() => {
    if (finished && !logged.current) {
      logged.current = true;
      log({ type: 'video', label: item?.simpleTitle ?? 'Vidéo', detail: item?.channel, site: item?.site });
    }
  }, [finished, item, log]);

  if (!item) return <EmptyState emoji="↩️" title="Vidéo introuvable" text="Choisis une autre vidéo.">
    <SmallButton onClick={() => nav.go({ name: 'videos' })}>Retour</SmallButton>
  </EmptyState>;

  if (finished) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">✅</span>
        <h2>Vidéo terminée.</h2>
        <p>Tu peux choisir une autre vidéo, ou retourner à l’accueil. Rien ne démarre tout seul.</p>
        <div className="button-row" style={{ justifyContent: 'center' }}>
          <SmallButton variant="primary" onClick={() => nav.go({ name: 'videos' })}>🎬 Une autre vidéo</SmallButton>
          <SmallButton onClick={nav.home}>🏠 Accueil</SmallButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScreenTitle emoji="🎬" title="Tu regardes une vidéo." subtitle={item.simpleTitle} />
      <div className="player-stage" style={{ background: item.color }}>
        <span className="scene-emoji" aria-hidden="true">{item.emoji}</span>
        <h2>{item.simpleTitle}</h2>
        <span className="muted" style={{ color: '#41545a' }}>Image calme, sans surprise.</span>
      </div>
      <div className="section">
        <ProgressBar value={elapsed} max={duration} label={`${Math.floor(elapsed / 60)} min ${elapsed % 60} s sur ${formatDuration(duration)}`} />
        <div className="player-controls">
          <SmallButton variant="primary" onClick={() => { setPlaying(!playing); haptic(sensory.vibration); }}>
            {playing ? '⏸️ Pause' : '▶️ Lire'}
          </SmallButton>
          <SmallButton onClick={() => { setPlaying(false); setFinished(true); }}>⏹️ Terminer</SmallButton>
        </div>
        <Note tone="info">Pas de commentaires, pas de chat, pas de publicité, pas de recommandations, pas de liens externes.</Note>
        <p className="disclaimer">
          Lecteur simulé du prototype : aucune vidéo distante n’est chargée, aucun son automatique.
          En production, ce lecteur utilise l’adaptateur YouTube contrôlé (youtube-nocookie, sans commentaires),
          uniquement après l’accord des règles parentales.
        </p>
      </div>
    </>
  );
}
