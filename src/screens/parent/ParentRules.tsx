import { useState } from 'react';
import { useApp } from '../../core/state';
import { CATEGORIES } from '../../core/catalog';
import type { FilterLevel, RuleSet } from '../../core/types';
import { Chip, Field, Note, ScreenTitle, Section, Segmented, SmallButton, TagList, Toggle } from '../../components/ui';

const SECTIONS = [
  { id: 'videos', label: '🎬 Vidéos' }, { id: 'search', label: '🔎 Recherche' },
  { id: 'learn', label: '📚 Apprendre' }, { id: 'music', label: '🎵 Musique' },
  { id: 'favorites', label: '⭐ Favoris' }, { id: 'routine', label: '🧩 Routine' },
  { id: 'help', label: '🆘 Aide' },
];

function ListEditor({ title, note, items, placeholder, onAdd, onRemove }: {
  title: string; note?: string; items: string[]; placeholder: string;
  onAdd: (value: string) => void; onRemove: (value: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <Section title={title} note={note}>
      <div className="inline-form">
        <Field label="Ajouter" value={value} onChange={setValue} placeholder={placeholder} />
        <SmallButton variant="primary" onClick={() => { onAdd(value); setValue(''); }}>Ajouter</SmallButton>
      </div>
      <TagList items={items} onRemove={onRemove} emptyText="Aucun élément pour le moment." />
    </Section>
  );
}

type ListKey = 'allowedSites' | 'blockedSites' | 'blockedKeywords' | 'blockedChannels' | 'trustedChannels';

function listPatch(key: ListKey, next: string[]): Partial<RuleSet> {
  switch (key) {
    case 'allowedSites': return { allowedSites: next };
    case 'blockedSites': return { blockedSites: next };
    case 'blockedKeywords': return { blockedKeywords: next };
    case 'blockedChannels': return { blockedChannels: next };
    case 'trustedChannels': return { trustedChannels: next };
  }
}

export default function ParentRules() {
  const { state, dispatch } = useApp();
  const rules = state.rules;

  function patch(value: Partial<RuleSet>) { dispatch({ type: 'rules', patch: value }); }
  function addToList(key: ListKey, raw: string) {
    const clean = raw.trim().toLowerCase();
    if (!clean || rules[key].includes(clean)) return;
    patch(listPatch(key, [...rules[key], clean]));
  }
  function removeFromList(key: ListKey, raw: string) {
    patch(listPatch(key, rules[key].filter((item) => item !== raw)));
  }

  return (
    <>
      <ScreenTitle emoji="⚙️" title="Règles de sécurité" subtitle="Vous gardez le contrôle. Rien n'est décidé par un algorithme seul." />

      <Section title="Niveau de filtrage" note="Le niveau change la prudence des évaluations, pas la liste blanche.">
        <Segmented<FilterLevel>
          value={rules.level}
          options={[
            { id: 'strict', label: 'Strict', hint: 'Très prudent' },
            { id: 'equilibre', label: 'Équilibré', hint: 'Recommandé' },
            { id: 'ouvert', label: 'Ouvert', hint: 'Moins d’alertes' },
          ]}
          onChange={(level) => patch({ level })}
        />
        <Toggle label="Liste blanche uniquement" description="Seuls les sites de la liste autorisée sont accessibles."
          checked={rules.whitelistOnly} onChange={(v) => patch({ whitelistOnly: v })} />
        <Toggle label="Demander un adulte si « à vérifier »" description="Un contenu incertain ne s'ouvre jamais tout seul."
          checked={rules.requireAdultForUncertain} onChange={(v) => patch({ requireAdultForUncertain: v })} />
      </Section>

      <Section title="Vidéos et YouTube" note="Mode contrôlé : pas de commentaires, chat, publicité, recommandations ni liens externes.">
        <Toggle label="Mode YouTube contrôlé" description="Lecteur simplifié et sources vérifiées."
          checked={rules.youtubeManaged} onChange={(v) => patch({ youtubeManaged: v })} />
        <label className="field">
          <span>Durée maximale d'une vidéo : {rules.maxVideoMinutes} min</span>
          <input type="range" min={3} max={30} value={rules.maxVideoMinutes}
            onChange={(e) => patch({ maxVideoMinutes: Number(e.target.value) })} />
        </label>
      </Section>

      <Section title="Recherches et capteurs" note="Aucune permission n'est demandée sans nécessité.">
        <Toggle label="Recherche vocale optionnelle" description="Micro uniquement après un clic explicite de l'enfant, si le navigateur le permet."
          checked={rules.voiceSearchEnabled} onChange={(v) => patch({ voiceSearchEnabled: v })} />
        <Toggle label="Modération externe (optionnelle)" description="Nécessite un relais serveur. Non actif dans ce prototype."
          checked={rules.externalModeration} onChange={(v) => patch({ externalModeration: v })} />
        {rules.externalModeration && (
          <Note tone="warn">Ce réglage prépare l'architecture, mais aucun service externe n'est contacté ici. La décision reste parentale.</Note>
        )}
        <Toggle label="Appliquer les horaires" description="En dehors des plages, l'espace enfant attend calmement."
          checked={rules.enforceSchedules} onChange={(v) => patch({ enforceSchedules: v })} />
      </Section>

      <Section title="Catégories autorisées" note="Une catégorie désactivée n'est plus proposée à l'enfant.">
        <div className="pill-grid">
          {CATEGORIES.map((category) => (
            <Chip key={category.id} active={rules.allowedCategories.includes(category.id)}
              onClick={() => patch({
                allowedCategories: rules.allowedCategories.includes(category.id)
                  ? rules.allowedCategories.filter((id) => id !== category.id)
                  : [...rules.allowedCategories, category.id],
              })}>
              {category.emoji} {category.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Activités accessibles" note="Équivalent du choix des applications : l'accueil enfant n'affiche que ces modules.">
        <div className="pill-grid">
          {SECTIONS.map((section) => (
            <Chip key={section.id} active={rules.enabledSections.includes(section.id)}
              onClick={() => patch({
                enabledSections: rules.enabledSections.includes(section.id)
                  ? rules.enabledSections.filter((id) => id !== section.id)
                  : [...rules.enabledSections, section.id],
              })}>
              {section.label}
            </Chip>
          ))}
        </div>
        <Note tone="info">Le bouton AIDE reste toujours disponible dans la barre du haut, même si le module est masqué.</Note>
      </Section>

      <ListEditor title="Sites autorisés" note="Liste blanche. Ajoutez uniquement des sites que vous avez vérifiés."
        items={rules.allowedSites} placeholder="exemple.fr"
        onAdd={(v) => addToList('allowedSites', v)} onRemove={(v) => removeFromList('allowedSites', v)} />
      <ListEditor title="Sites interdits" items={rules.blockedSites} placeholder="site-a-bloquer.fr"
        onAdd={(v) => addToList('blockedSites', v)} onRemove={(v) => removeFromList('blockedSites', v)} />
      <ListEditor title="Mots-clés interdits" note="Recherches, titres et résumés sont vérifiés."
        items={rules.blockedKeywords} placeholder="mot à bloquer"
        onAdd={(v) => addToList('blockedKeywords', v)} onRemove={(v) => removeFromList('blockedKeywords', v)} />
      <ListEditor title="Chaînes bloquées" items={rules.blockedChannels} placeholder="Nom de la chaîne"
        onAdd={(v) => addToList('blockedChannels', v)} onRemove={(v) => removeFromList('blockedChannels', v)} />
      <ListEditor title="Chaînes de confiance" note="Utilisées par le niveau strict pour éviter les « à vérifier »."
        items={rules.trustedChannels} placeholder="Nom de la chaîne"
        onAdd={(v) => addToList('trustedChannels', v)} onRemove={(v) => removeFromList('trustedChannels', v)} />

      <Note tone="calm">
        Chaque évaluation affichée à l'enfant reste une aide, jamais une garantie. Vous pouvez reprendre la main à tout moment.
      </Note>
    </>
  );
}
