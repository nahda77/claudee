import { useState } from 'react';
import type { Nav } from './nav';
import { BigButton, ContentCard, Note, ProgressBar, ScreenTitle, Section, SmallButton } from '../../components/ui';
import { useApp } from '../../core/state';
import { CATALOG } from '../../core/catalog';
import { evaluateContent } from '../../core/rules';
import { minutesLeft } from '../../components/ChildFrame';

export default function Home({ nav }: { nav: Nav }) {
  const { state, activeProfile, remainingSeconds } = useApp();
  const [more, setMore] = useState(false);
  const totalSeconds = (activeProfile.dailyMinutes + activeProfile.bonusMinutes) * 60;
  const usedMinutes = Math.round(activeProfile.secondsUsed / 60);

  const approved = state.recommendations
    .filter((r) => r.status === 'approved' && r.profileId === activeProfile.id)
    .map((r) => CATALOG.find((item) => item.id === r.itemId))
    .filter((item): item is (typeof CATALOG)[number] => !!item)
    .filter((item) => evaluateContent(item, state.rules).status === 'adapte')
    .slice(0, 2);

  const enabled = state.rules.enabledSections;
  const primary = [
    { id: 'videos', emoji: '🎬', label: 'Regarder une vidéo', sub: 'Choisir une vidéo', screen: 'videos' as const },
    { id: 'search', emoji: '🔎', label: 'Chercher quelque chose', sub: 'Poser une question', screen: 'search' as const },
    { id: 'learn', emoji: '📚', label: 'Apprendre', sub: 'Une activité calme', screen: 'learn' as const },
    { id: 'favorites', emoji: '⭐', label: 'Mes favoris', sub: 'Ce que j’aime', screen: 'favorites' as const },
  ].filter((entry) => enabled.includes(entry.id));
  const secondary = [
    { id: 'music', emoji: '🎵', label: 'Musique', sub: 'Sons doux, pas automatiques', screen: 'music' as const },
    { id: 'routine', emoji: '🧩', label: 'Ma routine', sub: 'Maintenant et ensuite', screen: 'routine' as const },
    { id: 'help', emoji: '👨‍👩‍👧', label: 'Aide', sub: 'Je ne sais pas quoi faire', screen: 'help' as const },
  ].filter((entry) => enabled.includes(entry.id));

  return (
    <>
      <ScreenTitle emoji={activeProfile.emoji} title={`Bonjour 👋 Que veux-tu faire ?`}
        subtitle="Choisis une chose. Tu pourras changer après." />

      <Section title="Ton temps aujourd'hui" note={`Encore ${minutesLeft(remainingSeconds)} minutes. ` +
        `${usedMinutes} min utilisées sur ${activeProfile.dailyMinutes + activeProfile.bonusMinutes} min.`}>
        <ProgressBar value={activeProfile.secondsUsed} max={totalSeconds} label="Temps calme" />
      </Section>

      <div className="home-grid">
        {primary.map((entry) => (
          <BigButton key={entry.id} emoji={entry.emoji} label={entry.label} sub={entry.sub}
            onClick={() => nav.go({ name: entry.screen })} />
        ))}
      </div>
      {primary.length === 0 && <Note tone="info">Un adulte peut ouvrir des activités dans l’espace parent.</Note>}
      {primary.length <= 2 && <Note tone="calm">Aujourd’hui, il y a peu de choix. C’est plus simple.</Note>}

      <div className="button-row">
        <SmallButton variant="quiet" onClick={() => setMore(!more)}>
          {more ? '↑ Moins de choix' : '↓ Autres choix'}
        </SmallButton>
      </div>

      {more && (
        <div className="more-grid">
          {secondary.map((entry) => (
            <BigButton key={entry.id} variant={entry.id === 'help' ? 'warm' : 'soft'} emoji={entry.emoji}
              label={entry.label} sub={entry.sub} onClick={() => nav.go({ name: entry.screen })} />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <Section title="Pour toi" note="Choisis par un adulte, d'après tes centres d'intérêt.">
          {approved.map((item) => (
            <ContentCard key={item.id} item={item} compact evaluation={evaluateContent(item, state.rules)}
              onClick={() => nav.go({ name: 'detail', itemId: item.id })} />
          ))}
        </Section>
      )}

      <Section title="Espace parent" note="Réservé aux adultes : code PIN ou biométrie.">
        <SmallButton onClick={nav.openParent}>🔒 Ouvrir l'espace parent</SmallButton>
      </Section>
    </>
  );
}
