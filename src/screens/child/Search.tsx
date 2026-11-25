import { useEffect, useState } from 'react';
import type { Nav } from './nav';
import type { ContentItem } from '../../core/types';
import type { EvaluatedItem } from '../../core/rules';
import { CATALOG } from '../../core/catalog';
import { searchAllSources } from '../../core/sources';
import { evaluateAll, evaluateContent } from '../../core/rules';
import { isVoiceSupported, listenOnce } from '../../core/voice';
import { normalize } from '../../core/utils';
import { useApp } from '../../core/state';
import { EmptyState, ContentCard, Note, ScreenTitle, Section, SmallButton, BigButton, StatusBadge } from '../../components/ui';

const SUGGESTIONS = ['dinosaures', 'chats', 'espace', 'couleurs', 'volcans', 'trains'];

export function SearchScreen({ nav }: { nav: Nav }) {
  const { state, log } = useApp();
  const [query, setQuery] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const voiceOk = state.rules.voiceSearchEnabled && isVoiceSupported();

  function submit(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const blocked = state.rules.blockedKeywords.find((word) => normalize(clean).includes(normalize(word)));
    if (blocked) {
      log({ type: 'blocked', label: `Recherche : ${clean}`, detail: `Mot-clé non autorisé : ${blocked}` });
      nav.go({ name: 'calm', message: 'Cette recherche n’est pas disponible. Tu peux demander à un adulte.' });
      return;
    }
    log({ type: 'search', label: clean, detail: 'Recherche Internet simplifiée' });
    nav.go({ name: 'results', query: clean });
  }

  return (
    <>
      <ScreenTitle emoji="🔎" title="Chercher quelque chose" subtitle="Écris un mot. On montre seulement les pages autorisées." />
      <div className="search-box">
        <input className="search-input" value={query} placeholder="Exemple : dinosaures" aria-label="Ta recherche"
          onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(query); }} />
        {voiceOk && (
          <button type="button" className="voice-btn" aria-label="Dicter la recherche"
            onClick={() => listenOnce(
              (text) => { setQuery(text); setVoiceMessage(`J'ai entendu : ${text}`); },
              () => setVoiceMessage('La recherche vocale n’est pas disponible ici. Tu peux écrire.'),
            )}>🎤</button>
        )}
      </div>
      {voiceMessage && <Note tone="info">{voiceMessage}</Note>}
      <BigButton emoji="🔎" label="Chercher" sub="Afficher les résultats autorisés" onClick={() => submit(query)} />
      <Section title="Idées" note="Tu peux toucher un mot pour commencer.">
        <div className="pill-grid">
          {SUGGESTIONS.map((word) => <button type="button" key={word} className="chip" onClick={() => { setQuery(word); submit(word); }}>{word}</button>)}
        </div>
      </Section>
      <Note tone="calm">Pas de publicité, pas de pop-up, pas de lien surprise. Une page s’ouvre dans l’application, simplement.</Note>
    </>
  );
}

export function SearchResults({ nav }: { nav: Nav }) {
  const { state, log } = useApp();
  const query = nav.current.query ?? '';
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const found = await searchAllSources(query, ['page']);
      if (alive) { setItems(found.filter((item) => item.kind === 'page')); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [query]);

  const evaluated: EvaluatedItem[] = evaluateAll(items, state.rules);
  const allowed = evaluated.filter((e) => e.evaluation.status === 'adapte');
  const uncertain = evaluated.filter((e) => e.evaluation.status === 'a-verifier');
  const removed = evaluated.filter((e) => e.evaluation.status === 'bloque').length;

  return (
    <>
      <ScreenTitle emoji="✅" title="Recherche terminée." subtitle={`Mot : « ${query} »`} />
      <Note tone="calm">{allowed.length} résultat(s) autorisé(s). {removed} résultat(s) retiré(s) par les règles des parents.</Note>

      {loading && <p className="muted">On prépare les résultats…</p>}
      {!loading && allowed.length === 0 && (
        <EmptyState emoji="🫧" title="Aucune page autorisée" text="Tu peux essayer un autre mot, ou demander à un adulte.">
          <SmallButton onClick={() => nav.go({ name: 'search' })}>↩️ Nouvelle recherche</SmallButton>
        </EmptyState>
      )}

      {allowed.map(({ item }) => (
        <ContentCard key={item.id} item={item} compact evaluation={evaluateContent(item, state.rules)}
          onClick={() => nav.go({ name: 'reader', itemId: item.id })}
          footer={<SmallButton variant="soft" onClick={() => nav.go({ name: 'reader', itemId: item.id })}>📄 Lire la page</SmallButton>}
        />
      ))}

      {uncertain.length > 0 && (
        <Section title="À vérifier avec un adulte" note="Ces pages ne s’ouvrent pas sans accord.">
          {uncertain.map(({ item }) => (
            <ContentCard key={item.id} item={item} compact evaluation={evaluateContent(item, state.rules)}
              onClick={() => nav.go({ name: 'calm', message: 'Demande à un adulte pour cette page.' })} />
          ))}
        </Section>
      )}

      <div className="button-row">
        <SmallButton onClick={() => nav.go({ name: 'search' })}>🔎 Autre recherche</SmallButton>
        <SmallButton onClick={() => { log({ type: 'help', label: 'Aide après une recherche', detail: query }); nav.go({ name: 'help' }); }}>
          🆘 Demander de l'aide
        </SmallButton>
      </div>
      <p className="disclaimer">Les résultats viennent de sources déclarées par les parents et sont filtrés par les règles locales. Aucune ouverture automatique d’un site externe.</p>
    </>
  );
}

export function Reader({ nav }: { nav: Nav }) {
  const { state, log } = useApp();
  const item = CATALOG.find((candidate) => candidate.id === nav.current.itemId);
  const itemId = item?.id;

  useEffect(() => {
    if (!item) return;
    log({ type: 'page', label: item.simpleTitle, detail: 'Lecture simplifiée', site: item.site });
  }, [itemId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return <EmptyState emoji="↩️" title="Page introuvable" text="Tu peux faire une autre recherche.">
    <SmallButton onClick={() => nav.go({ name: 'search' })}>Retour</SmallButton>
  </EmptyState>;

  const evaluation = evaluateContent(item, state.rules);

  return (
    <>
      <ScreenTitle emoji={item.emoji} title={item.simpleTitle} subtitle="Lecture simplifiée, sans publicité." />
      <div className="section">
        <div className="player-stage" style={{ background: item.color, minHeight: 150 }}>
          <span className="scene-emoji" aria-hidden="true">{item.emoji}</span>
        </div>
        <div style={{ marginTop: 12 }}><StatusBadge status={evaluation.status} /></div>
        <p style={{ lineHeight: 1.6, marginTop: 14 }}>{item.summary}</p>
        <p className="muted">Site : {item.site}</p>
      </div>
      <Section title="Lecture terminée." note="Tu peux revenir aux résultats ou demander à un adulte pour ouvrir le site complet.">
        <div className="button-row">
          <SmallButton onClick={nav.back}>↩️ Retour aux résultats</SmallButton>
          <SmallButton onClick={() => nav.go({ name: 'calm', message: 'Demande à un adulte pour ouvrir ce site.' })}>👨‍👩‍👧 Demander à un adulte</SmallButton>
        </div>
      </Section>
    </>
  );
}
