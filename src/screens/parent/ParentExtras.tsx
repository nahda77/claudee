import { useState } from 'react';
import type { HistoryType, ThemeId } from '../../core/types';
import type { SetTab } from './types';
import { CATALOG, CATEGORIES } from '../../core/catalog';
import { suggestRecommendations, evaluateContent } from '../../core/rules';
import { isWithinSchedules } from '../../core/time';
import { isBiometricAvailable } from '../../core/security';
import { formatClock, formatDate, uid } from '../../core/utils';
import { useApp } from '../../core/state';
import { Chip, Field, Modal, Note, ScreenTitle, Section, SmallButton, StatusBadge, Toggle } from '../../components/ui';

const TYPE_LABELS: Record<HistoryType | 'all', string> = {
  all: 'Tout', video: '🎬 Vidéos', page: '📄 Pages', search: '🔎 Recherches',
  blocked: '🔴 Bloqués', help: '🆘 Aide', routine: '🧩 Routine', music: '🎵 Musique',
};

/* ---------------------------- Temps ---------------------------- */
export function TimeTab() {
  const { state, activeProfile, addMinutes, dispatch } = useApp();
  const [label, setLabel] = useState('');
  const [start, setStart] = useState('16:00');
  const [end, setEnd] = useState('18:00');
  const within = isWithinSchedules(state.schedules);

  return (
    <>
      <ScreenTitle emoji="⏳" title="Temps d'écran" subtitle="Des messages doux, une progression visible, aucune alerte brusque." />
      <Section title="Aujourd'hui" note={`Profil ${activeProfile.name} · ${Math.round(activeProfile.secondsUsed / 60)} min utilisées.`}>
        <div className="form-row">
          <Field label="Durée quotidienne (min)" type="number" min="5" max="180" value={String(activeProfile.dailyMinutes)}
            onChange={(v) => dispatch({ type: 'updateProfile', id: activeProfile.id,
              patch: { dailyMinutes: Math.max(5, Math.min(180, Number(v) || 5)) } })} />
          <Field label="Temps ajouté (min)" type="number" value={String(activeProfile.bonusMinutes)}
            onChange={(v) => dispatch({ type: 'updateProfile', id: activeProfile.id,
              patch: { bonusMinutes: Math.max(0, Number(v) || 0) } })} />
        </div>
        <div className="button-row">
          <SmallButton onClick={() => addMinutes(5)}>+ 5 min</SmallButton>
          <SmallButton onClick={() => addMinutes(10)}>+ 10 min</SmallButton>
          <SmallButton onClick={() => addMinutes(20)}>+ 20 min</SmallButton>
        </div>
        <Note tone="calm">Messages de l'enfant : « Encore 5 minutes. Tu peux finir tranquillement. » puis « C'est terminé pour aujourd'hui. À demain. »</Note>
      </Section>

      <Section title="Horaires" note={state.rules.enforceSchedules
        ? `Appliqués · ${within ? 'nous sommes dans une plage autorisée' : 'hors plage : espace enfant en attente'}`
        : 'Informatifs pour le moment : activez l’application des horaires ci-dessous.'}>
        <Toggle label="Appliquer les horaires" description="En dehors des plages, l'enfant voit un écran calme et prévisible."
          checked={state.rules.enforceSchedules} onChange={(v) => dispatch({ type: 'rules', patch: { enforceSchedules: v } })} />
        {state.schedules.map((slot) => (
          <div className="list-row" key={slot.id}>
            <div className="row-main"><strong>{slot.label}</strong><small>{slot.start} → {slot.end}</small></div>
            <SmallButton variant="danger" onClick={() => dispatch({ type: 'schedules',
              schedules: state.schedules.filter((s) => s.id !== slot.id) })}>Retirer</SmallButton>
          </div>
        ))}
        <div className="form-row">
          <Field label="Nom" value={label} onChange={setLabel} placeholder="Après l'école" />
          <Field label="Début" type="time" value={start} onChange={setStart} />
          <Field label="Fin" type="time" value={end} onChange={setEnd} />
        </div>
        <SmallButton variant="primary" onClick={() => {
          if (!label.trim()) return;
          dispatch({ type: 'schedules', schedules: [...state.schedules, { id: uid(), label: label.trim(), start, end }] });
          setLabel('');
        }}>➕ Ajouter une plage</SmallButton>
      </Section>
    </>
  );
}

/* ---------------------------- Sensoriel ---------------------------- */
export function SensoryTab() {
  const { state, activeProfile, dispatch } = useApp();
  const sensory = state.sensory;
  const themes: { id: ThemeId; label: string; desc: string }[] = [
    { id: 'doux', label: '🌿 Couleurs douces', desc: 'Pastels chaleureux, contraste modéré' },
    { id: 'contraste', label: '◼️ Contraste élevé', desc: 'Noir, blanc, bleu très lisible' },
    { id: 'sombre', label: '🌙 Mode sombre', desc: 'Lumière réduite, pas d’éblouissement' },
    { id: 'minimal', label: '⬜ Minimaliste', desc: 'Moins de décoration, moins de choix' },
  ];

  return (
    <>
      <ScreenTitle emoji="🫧" title="Confort sensoriel" subtitle="Faible stimulation : rien ne clignote, rien ne démarre tout seul." />
      <Section title="Thème visuel" note={`Thème actuel de ${activeProfile.name} : ${themes.find((t) => t.id === activeProfile.theme)?.label}.`}>
        <div className="stack">
          {themes.map((theme) => (
            <Chip key={theme.id} active={activeProfile.theme === theme.id}
              onClick={() => dispatch({ type: 'updateProfile', id: activeProfile.id, patch: { theme: theme.id } })}>
              {theme.label} — {theme.desc}
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="Mouvements et sons">
        <Toggle label="Animations" description="Désactivées par défaut. Si activées, transitions lentes uniquement."
          checked={sensory.animations} onChange={(v) => dispatch({ type: 'sensory', patch: { animations: v } })} />
        <Toggle label="Transitions lentes" description="Changements d'écran progressifs et prévisibles."
          checked={sensory.slowTransitions} onChange={(v) => dispatch({ type: 'sensory', patch: { slowTransitions: v } })} />
        <Toggle label="Sons" description="Aucun son automatique, jamais de musique au démarrage."
          checked={sensory.sounds} onChange={(v) => dispatch({ type: 'sensory', patch: { sounds: v } })} />
        <Toggle label="Vibrations" description="Retour tactile court, uniquement sur une action de l'enfant."
          checked={sensory.vibration} onChange={(v) => dispatch({ type: 'sensory', patch: { vibration: v } })} />
        <Toggle label="Grands textes" description="Typographie très lisible, espacement généreux."
          checked={sensory.largeText} onChange={(v) => dispatch({ type: 'sensory', patch: { largeText: v } })} />
        <Toggle label="Interface très minimaliste" description="Moins de couleurs, moins d'ombres, moins de détails."
          checked={sensory.minimalMode} onChange={(v) => dispatch({ type: 'sensory', patch: { minimalMode: v } })} />
      </Section>
      <Note tone="calm">Pas de pop-up inutile, pas de notification agressive, pas d'élément clignotant, pas de publicité. L'interface reste stable.</Note>
    </>
  );
}

/* ---------------------------- Historique ---------------------------- */
export function HistoryTab({ setTab }: { setTab: SetTab }) {
  const { state, dispatch, blockSite, allowSite, blockKeyword } = useApp();
  const [filter, setFilter] = useState<HistoryType | 'all'>('all');
  const [confirm, setConfirm] = useState(false);
  const entries = state.history.filter((entry) => filter === 'all' || entry.type === filter);

  return (
    <>
      <ScreenTitle emoji="📜" title="Historique" subtitle="Minimal, local, chiffré et effaçable." />
      <Section title="Filtrer">
        <div className="pill-grid">
          {(Object.keys(TYPE_LABELS) as (HistoryType | 'all')[]).map((key) => (
            <Chip key={key} active={filter === key} onClick={() => setFilter(key)}>{TYPE_LABELS[key]}</Chip>
          ))}
        </div>
      </Section>
      <Section title={`${entries.length} événement(s)`} note="Aucune localisation, aucune donnée publicitaire, aucun identifiant d'enfant transmis.">
        {entries.length === 0 && <p className="muted">Rien à afficher.</p>}
        {entries.map((entry) => (
          <div className="list-row" key={entry.id}>
            <div className="row-main">
              <strong>{TYPE_LABELS[entry.type]} · {entry.label}</strong>
              <small>{formatDate(entry.at)} à {formatClock(entry.at)}{entry.detail ? ` · ${entry.detail}` : ''}{entry.site ? ` · ${entry.site}` : ''}</small>
            </div>
            <div className="row-actions">
              <SmallButton variant="danger" onClick={() => entry.site ? blockSite(entry.site) : blockKeyword(entry.label)}>Bloquer</SmallButton>
              {entry.site && <SmallButton onClick={() => allowSite(entry.site!)}>Autoriser</SmallButton>}
            </div>
          </div>
        ))}
        <div className="button-row">
          <SmallButton variant="danger" onClick={() => setConfirm(true)}>🧹 Effacer l'historique</SmallButton>
          <SmallButton onClick={() => setTab('dashboard')}>📊 Tableau de bord</SmallButton>
        </div>
      </Section>
      {confirm && (
        <Modal title="Effacer l'historique ?" onClose={() => setConfirm(false)}>
          <p className="muted">Les règles, profils et contacts sont conservés. Seuls les événements sont supprimés.</p>
          <div className="button-row">
            <SmallButton onClick={() => setConfirm(false)}>Annuler</SmallButton>
            <SmallButton variant="danger" onClick={() => { dispatch({ type: 'clearHistory' }); setConfirm(false); }}>Effacer</SmallButton>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------------------------- Recommandations ---------------------------- */
export function RecommendationsTab({ setTab }: { setTab: SetTab }) {
  const { state, activeProfile, dispatch, blockSite, blockChannel, blockKeyword } = useApp();
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');

  const pending = state.recommendations.filter((r) => r.status === 'pending' && r.profileId === activeProfile.id);
  const decided = state.recommendations.filter((r) => r.status !== 'pending');

  function generate() {
    const seen = state.recommendations.map((r) => r.itemId);
    const ideas = suggestRecommendations(CATALOG, activeProfile.interests, seen, 4);
    if (!ideas.length) { setMessage('Aucune nouvelle idée pour ces centres d’intérêt.'); return; }
    dispatch({ type: 'recommendations', items: ideas.map(({ item, reason }) => ({
      id: uid(), itemId: item.id, profileId: activeProfile.id, reason, status: 'pending' as const,
    })) });
    setMessage('Idées créées. Rien n’est visible par l’enfant avant votre accord.');
  }

  return (
    <>
      <ScreenTitle emoji="💡" title="Recommandations" subtitle="Jamais autonomes : chaque idée attend votre décision." />
      <Note tone="warn">Une suggestion n'est jamais proposée à l'enfant sans accord d'un adulte. L'algorithme ne décide pas seul.</Note>
      <Section title="Créer des idées" note={`D'après les centres d'intérêt de ${activeProfile.name}.`}>
        <SmallButton variant="primary" onClick={generate}>✨ Proposer des idées</SmallButton>
        {message && <Note tone="info">{message}</Note>}
        <div className="inline-form">
          <Field label="Bloquer un mot-clé" value={keyword} onChange={setKeyword} placeholder="mot à exclure" />
          <SmallButton variant="danger" onClick={() => { blockKeyword(keyword); setKeyword(''); }}>Bloquer</SmallButton>
        </div>
      </Section>

      <Section title={`En attente (${pending.length})`} note="Accepter, supprimer, bloquer une chaîne, un site ou un mot-clé.">
        {pending.length === 0 && <p className="muted">Aucune suggestion en attente.</p>}
        {pending.map((rec) => {
          const item = CATALOG.find((candidate) => candidate.id === rec.itemId);
          if (!item) return null;
          const evaluation = evaluateContent(item, state.rules);
          return (
            <div className="list-row" key={rec.id}>
              <div className="row-main">
                <strong>{item.emoji} {item.simpleTitle}</strong>
                <small>{rec.reason} · {item.site}{item.channel ? ` · ${item.channel}` : ''}</small>
                <div style={{ marginTop: 6 }}><StatusBadge status={evaluation.status} /></div>
              </div>
              <div className="row-actions">
                <SmallButton variant="primary" onClick={() => dispatch({ type: 'decideRecommendation', id: rec.id, status: 'approved' })}>✅ Accepter</SmallButton>
                <SmallButton onClick={() => dispatch({ type: 'decideRecommendation', id: rec.id, status: 'rejected' })}>🗑️ Supprimer</SmallButton>
                {item.channel && <SmallButton variant="danger" onClick={() => { blockChannel(item.channel!); dispatch({ type: 'decideRecommendation', id: rec.id, status: 'rejected' }); }}>🚫 Bloquer la chaîne</SmallButton>}
                <SmallButton variant="danger" onClick={() => { blockSite(item.site); dispatch({ type: 'decideRecommendation', id: rec.id, status: 'rejected' }); }}>🚫 Bloquer le site</SmallButton>
                <SmallButton variant="danger" onClick={() => { blockKeyword(item.tags[0] ?? item.simpleTitle); dispatch({ type: 'decideRecommendation', id: rec.id, status: 'rejected' }); }}>🚫 Bloquer « {item.tags[0] ?? item.simpleTitle} »</SmallButton>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Décisions" note="Historique des validations et des refus.">
        {decided.length === 0 && <p className="muted">Aucune décision pour le moment.</p>}
        {decided.slice(0, 12).map((rec) => {
          const item = CATALOG.find((candidate) => candidate.id === rec.itemId);
          return (
            <div className="list-row" key={rec.id}>
              <div className="row-main"><strong>{rec.status === 'approved' ? '✅ Accepté' : '🗑️ Refusé'} · {item?.simpleTitle ?? rec.itemId}</strong>
                <small>{rec.decidedAt ? `${formatDate(rec.decidedAt)} à ${formatClock(rec.decidedAt)}` : ''}</small></div>
            </div>
          );
        })}
        <SmallButton onClick={() => setTab('history')}>📜 Voir l'historique complet</SmallButton>
      </Section>
    </>
  );
}

/* ---------------------------- Routine ---------------------------- */
export function RoutineTab() {
  const { activeProfile, dispatch } = useApp();
  const steps = activeProfile.routine;

  return (
    <>
      <ScreenTitle emoji="🧩" title="Ma routine" subtitle="L'enfant voit ce qu'il fait maintenant, ensuite, et quand c'est terminé." />
      <Section title="Étapes" note="Modifiez l'ordre et les mots. L'enfant coche « C'est fait » lui-même.">
        {steps.map((step, index) => (
          <div className="list-row" key={step.id}>
            <div className="row-main">
              <div className="form-row">
                <Field label={`Étape ${index + 1}`} value={step.label} onChange={(v) => dispatch({ type: 'routine',
                  routine: steps.map((s) => s.id === step.id ? { ...s, label: v } : s) })} />
                <Field label="Pictogramme" value={step.emoji} onChange={(v) => dispatch({ type: 'routine',
                  routine: steps.map((s) => s.id === step.id ? { ...s, emoji: v } : s) })} />
              </div>
            </div>
            <div className="row-actions">
              <SmallButton disabled={index === 0} onClick={() => {
                const next = [...steps]; [next[index - 1], next[index]] = [next[index], next[index - 1]];
                dispatch({ type: 'routine', routine: next });
              }}>↑</SmallButton>
              <SmallButton disabled={index === steps.length - 1} onClick={() => {
                const next = [...steps]; [next[index + 1], next[index]] = [next[index], next[index + 1]];
                dispatch({ type: 'routine', routine: next });
              }}>↓</SmallButton>
              <SmallButton variant="danger" onClick={() => dispatch({ type: 'routine', routine: steps.filter((s) => s.id !== step.id) })}>×</SmallButton>
            </div>
          </div>
        ))}
        <div className="button-row">
          <SmallButton variant="primary" onClick={() => dispatch({ type: 'routine', routine: [...steps,
            { id: uid(), label: 'Nouvelle activité', emoji: '🎨', done: false }] })}>➕ Ajouter une étape</SmallButton>
          <SmallButton onClick={() => dispatch({ type: 'routine', routine: steps.map((s) => ({ ...s, done: false })) })}>↺ Réinitialiser</SmallButton>
        </div>
      </Section>
    </>
  );
}

/* ---------------------------- Confidentialité ---------------------------- */
export function PrivacyTab({ onClose }: { onClose: () => void }) {
  const { enableBiometrics, resetAll } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [bioMessage, setBioMessage] = useState('');

  return (
    <>
      <ScreenTitle emoji="🔐" title="Confidentialité" subtitle="La protection de l'enfant est la priorité." />
      <Section title="Notre règle" note="Version courte et compréhensible de la politique de confidentialité.">
        <ul className="privacy-list">
          <li>Aucune publicité, aucune publicité ciblée, aucun traceur tiers.</li>
          <li>Aucune vente et aucun partage des données de l'enfant.</li>
          <li>Réglages, historique et contacts stockés sur l'appareil, chiffrés (AES-GCM).</li>
          <li>Historique limité à 200 événements, consultable et effaçable ici.</li>
          <li>Aucune localisation, aucune caméra, aucun accès au carnet de contacts.</li>
          <li>Microphone : uniquement si le parent active la recherche vocale ET après un clic explicite.</li>
          <li>Code PIN haché (PBKDF2), jamais stocké en clair. Biométrie via passkey, sans stockage de données biométriques.</li>
          <li>Aucune donnée n'est envoyée à un serveur dans ce prototype.</li>
        </ul>
      </Section>
      <Section title="Permissions" note="Demande uniquement quand c'est réellement nécessaire.">
        <div className="list-row"><div className="row-main"><strong>📍 Localisation</strong><small>Jamais demandée</small></div></div>
        <div className="list-row"><div className="row-main"><strong>🎤 Micro</strong><small>Optionnel, sur clic explicite uniquement</small></div></div>
        <div className="list-row"><div className="row-main"><strong>📷 Caméra</strong><small>Jamais demandée</small></div></div>
        <div className="list-row"><div className="row-main"><strong>👥 Contacts</strong><small>Saisie manuelle par le parent, stockée localement</small></div></div>
        <div className="list-row"><div className="row-main"><strong>🔔 Notifications</strong><small>Aucune notification agressive</small></div></div>
      </Section>
      <Section title="Sécurité" note="Limite connue du navigateur et trajectoire native.">
        <p className="muted">Dans le navigateur, la clé de chiffrement reste sur l'appareil. Les builds Android/iOS doivent la placer dans Android Keystore / iOS Keychain, derrière la biométrie, et chiffrer la synchronisation serveur de bout en bout.</p>
        {isBiometricAvailable() && (
          <SmallButton onClick={() => { void enableBiometrics().then((ok) =>
            setBioMessage(ok ? 'Biométrie activée pour ouvrir l’espace parent.' : 'Biométrie non disponible sur cet appareil.')); }}>
            🔓 Activer la biométrie
          </SmallButton>
        )}
        {bioMessage && <Note tone="info">{bioMessage}</Note>}
      </Section>
      <Section title="Conformité" note="À valider juridiquement avant une publication publique.">
        <p className="muted">Conception « meilleur intérêt de l'enfant », minimisation des données, consentement parental, droit à l'effacement : RGPD, COPPA et codes de design adapté à l'âge. Aucune classification automatique n'est présentée comme une garantie.</p>
      </Section>
      <div className="button-row">
        <SmallButton variant="danger" onClick={() => setConfirm(true)}>🧹 Effacer toutes les données</SmallButton>
      </div>
      {confirm && (
        <Modal title="Tout effacer ?" onClose={() => setConfirm(false)}>
          <p className="muted">Profils, règles, PIN, contacts et historique seront supprimés de cet appareil. L'application repart comme au premier lancement.</p>
          <div className="button-row">
            <SmallButton onClick={() => setConfirm(false)}>Annuler</SmallButton>
            <SmallButton variant="danger" onClick={() => { void resetAll().then(onClose); }}>Effacer</SmallButton>
          </div>
        </Modal>
      )}
      <Note tone="calm">{CATEGORIES.length} catégories de contenus, aucune donnée personnelle inutile. L'adulte reste toujours aux commandes.</Note>
    </>
  );
}
