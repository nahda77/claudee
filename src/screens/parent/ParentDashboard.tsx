import { useState } from 'react';
import type { SetTab } from './types';
import { useApp } from '../../core/state';
import { CATEGORIES } from '../../core/catalog';
import { sameDay, formatClock } from '../../core/utils';
import { Field, Note, ScreenTitle, Section, StatCard, SmallButton } from '../../components/ui';

export default function ParentDashboard({ setTab }: { setTab: SetTab }) {
  const { state, activeProfile, addMinutes, blockSite, allowSite, blockKeyword, blockChannel } = useApp();
  const [quick, setQuick] = useState<null | 'block' | 'allow' | 'site'>(null);
  const [value, setValue] = useState('');
  const today = state.history.filter((entry) => sameDay(entry.at, Date.now()));
  const viewed = today.filter((entry) => ['video', 'page', 'music'].includes(entry.type)).length;
  const searches = today.filter((entry) => entry.type === 'search').length;
  const blocked = today.filter((entry) => entry.type === 'blocked').length;
  const interests = activeProfile.interests.map((id) => CATEGORIES.find((c) => c.id === id)?.label).filter(Boolean).join(', ');

  function applyQuick() {
    const clean = value.trim();
    if (!clean || !quick) return;
    if (quick === 'block') {
      if (clean.includes('.')) blockSite(clean.toLowerCase());
      else if (clean.startsWith('@')) blockChannel(clean.slice(1));
      else blockKeyword(clean);
    } else {
      allowSite(clean.toLowerCase());
    }
    setValue('');
    setQuick(null);
  }

  const labels: Record<string, string> = {
    video: '🎬 Vidéo', page: '📄 Page', search: '🔎 Recherche', blocked: '🔴 Bloqué',
    help: '🆘 Aide', routine: '🧩 Routine', music: '🎵 Musique',
  };

  return (
    <>
      <ScreenTitle emoji="📊" title="Tableau de bord" subtitle={`Profil actif : ${activeProfile.emoji} ${activeProfile.name}`} />
      <div className="stat-grid">
        <StatCard label="Temps aujourd'hui" value={`${Math.round(activeProfile.secondsUsed / 60)} min`}
          detail={`sur ${activeProfile.dailyMinutes + activeProfile.bonusMinutes} min`} />
        <StatCard label="Contenus consultés" value={String(viewed)} detail="aujourd'hui" />
        <StatCard label="Recherches" value={String(searches)} detail="aujourd'hui" />
        <StatCard label="Contenus bloqués" value={String(blocked)} detail="aujourd'hui" />
        <StatCard label="Catégories préférées" value={interests || '—'} detail="centres d'intérêt du profil" />
        <StatCard label="Sites autorisés" value={String(state.rules.allowedSites.length)} detail="liste blanche" />
        <StatCard label="Sites bloqués" value={String(state.rules.blockedSites.length)} detail={`${state.rules.blockedKeywords.length} mots-clés`} />
        <StatCard label="Horaires" value={state.schedules.length ? state.schedules.map((s) => s.start).join(' / ') : 'Libres'}
          detail={state.rules.enforceSchedules ? 'horaires appliqués' : 'horaires informatifs'} />
      </div>

      <Section title="Actions rapides" note="Bloquer ou autoriser en un geste. Les règles s'appliquent tout de suite.">
        <div className="button-row">
          <SmallButton variant="danger" onClick={() => { setQuick('block'); setValue(''); }}>🚫 Bloquer ce contenu</SmallButton>
          <SmallButton onClick={() => { setQuick('allow'); setValue(''); }}>✅ Autoriser ce contenu</SmallButton>
          <SmallButton onClick={() => { setQuick('site'); setValue(''); }}>➕ Ajouter ce site</SmallButton>
          <SmallButton variant="primary" onClick={() => setTab('rules')}>⚙️ Modifier les règles</SmallButton>
        </div>
        {quick && (
          <div className="inline-form">
            <Field label={quick === 'block' ? 'Site, mot-clé ou @chaîne à bloquer' : 'Site à autoriser'}
              value={value} onChange={setValue}
              placeholder={quick === 'block' ? 'exemple.fr ou mot ou @Chaine' : 'kiddle.co'} />
            <SmallButton variant="primary" onClick={applyQuick}>Valider</SmallButton>
            <SmallButton onClick={() => setQuick(null)}>Annuler</SmallButton>
          </div>
        )}
        {state.rules.whitelistOnly && <Note tone="info">Liste blanche active : seuls les sites autorisés peuvent s’ouvrir.</Note>}
      </Section>

      <Section title="Temps d'écran" note="Ajouter du temps ne modifie pas la règle quotidienne des prochains jours.">
        <div className="button-row">
          <SmallButton onClick={() => addMinutes(5)}>+ 5 min</SmallButton>
          <SmallButton onClick={() => addMinutes(10)}>+ 10 min</SmallButton>
          <SmallButton onClick={() => addMinutes(20)}>+ 20 min</SmallButton>
        </div>
      </Section>

      <Section title="Activité récente" note="Historique minimal, local et effaçable. Aucune donnée envoyée.">
        {state.history.length === 0 && <p className="muted">Aucun événement pour le moment.</p>}
        {state.history.slice(0, 6).map((entry) => (
          <div className="list-row" key={entry.id}>
            <div className="row-main">
              <strong>{labels[entry.type] ?? entry.type} · {entry.label}</strong>
              <small>{formatClock(entry.at)}{entry.detail ? ` · ${entry.detail}` : ''}{entry.site ? ` · ${entry.site}` : ''}</small>
            </div>
            <div className="row-actions">
              <SmallButton variant="danger" onClick={() => entry.site ? blockSite(entry.site) : blockKeyword(entry.label)}>
                Bloquer
              </SmallButton>
              {entry.site && <SmallButton onClick={() => allowSite(entry.site!)}>Autoriser</SmallButton>}
            </div>
          </div>
        ))}
        {state.history.length > 6 && <SmallButton variant="quiet" onClick={() => setTab('history')}>Voir tout l'historique</SmallButton>}
      </Section>

      <Section title="Réglages en place" note="Vue d'ensemble, modifiable dans les autres onglets.">
        <p className="muted">
          Thème : {activeProfile.theme} · Animations : {state.sensory.animations ? 'oui' : 'non'} ·
          Sons : {state.sensory.sounds ? 'oui' : 'non'} · Vibrations : {state.sensory.vibration ? 'oui' : 'non'} ·
          Interface minimale : {state.sensory.minimalMode ? 'oui' : 'non'}
        </p>
        <p className="muted">
          Filtrage : {state.rules.level} · YouTube contrôlé : {state.rules.youtubeManaged ? 'oui' : 'non'} ·
          Modération externe : {state.rules.externalModeration ? 'demandée' : 'non'} ·
          Catégories : {state.rules.allowedCategories.length}/{CATEGORIES.length}
        </p>
      </Section>
    </>
  );
}
