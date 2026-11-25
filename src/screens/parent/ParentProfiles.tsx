import { useState } from 'react';
import type { ChildProfile, ThemeId } from '../../core/types';
import { CATEGORIES, INTERESTS } from '../../core/catalog';
import { useApp } from '../../core/state';
import { Chip, Field, Note, ScreenTitle, Section, SmallButton } from '../../components/ui';
import { uid } from '../../core/utils';

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'doux', label: '🌿 Couleurs douces' }, { id: 'contraste', label: '◼️ Contraste élevé' },
  { id: 'sombre', label: '🌙 Mode sombre' }, { id: 'minimal', label: '⬜ Minimaliste' },
];
const EMOJIS = ['🦊', '🐻', '🐢', '⭐', '🌈', '🚀', '🐼', '🦋'];

export default function ParentProfiles() {
  const { state, dispatch, activeProfile, addProfile } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🐻');
  const [contactLabel, setContactLabel] = useState('');
  const [contactEmoji, setContactEmoji] = useState('👨');
  const [contactPhone, setContactPhone] = useState('');

  function patch(profile: ChildProfile, value: Partial<ChildProfile>) {
    dispatch({ type: 'updateProfile', id: profile.id, patch: value });
  }

  return (
    <>
      <ScreenTitle emoji="👨‍👩‍👧" title="Profils enfants" subtitle="Un profil = ses intérêts, son thème, son temps et sa routine." />

      {state.profiles.map((profile) => (
        <Section key={profile.id} title={`${profile.emoji} ${profile.name}`}
          note={profile.id === activeProfile.id ? 'Profil actif dans l’espace enfant.' : 'Profil disponible.'}
          right={profile.id === activeProfile.id ? <Chip active>Actif</Chip> : undefined}>
          <div className="form-row">
            <Field label="Prénom" value={profile.name} onChange={(v) => patch(profile, { name: v })} />
            <Field label="Temps quotidien (min)" type="number" value={String(profile.dailyMinutes)} min="5" max="180"
              onChange={(v) => patch(profile, { dailyMinutes: Math.max(5, Math.min(180, Number(v) || 5)) })} />
          </div>
          <p className="muted">Avatar</p>
          <div className="pill-grid">
            {EMOJIS.map((option) => <Chip key={option} active={profile.emoji === option}
              onClick={() => patch(profile, { emoji: option })}>{option}</Chip>)}
          </div>
          <p className="muted">Thème visuel</p>
          <div className="pill-grid">
            {THEMES.map((theme) => <Chip key={theme.id} active={profile.theme === theme.id}
              onClick={() => patch(profile, { theme: theme.id })}>{theme.label}</Chip>)}
          </div>
          <p className="muted">Centres d'intérêt (utilisés pour les recommandations, jamais automatiques)</p>
          <div className="pill-grid">
            {INTERESTS.map((interest) => <Chip key={interest.id} active={profile.interests.includes(interest.id)}
              onClick={() => patch(profile, {
                interests: profile.interests.includes(interest.id)
                  ? profile.interests.filter((id) => id !== interest.id)
                  : [...profile.interests, interest.id],
              })}>{interest.emoji} {interest.label}</Chip>)}
          </div>
          <div className="button-row">
            {profile.id !== activeProfile.id && (
              <SmallButton variant="primary" onClick={() => dispatch({ type: 'activeProfile', id: profile.id })}>
                Utiliser ce profil
              </SmallButton>
            )}
            {state.profiles.length > 1 && (
              <SmallButton variant="danger" onClick={() => dispatch({ type: 'removeProfile', id: profile.id })}>
                Supprimer ce profil
              </SmallButton>
            )}
          </div>
        </Section>
      ))}

      <Section title="Ajouter un profil" note="Plusieurs enfants, des réglages séparés.">
        <div className="form-row">
          <Field label="Prénom" value={name} onChange={setName} placeholder="Prénom" />
          <Field label="Avatar" value={emoji} onChange={setEmoji} placeholder="🐻" />
        </div>
        <SmallButton variant="primary" onClick={() => {
          if (!name.trim()) return;
          addProfile(name.trim(), emoji || '🐻');
          setName('');
        }}>➕ Ajouter le profil</SmallButton>
      </Section>

      <Section title="Contacts d'urgence" note="Configurés uniquement ici. Aucun accès au carnet de contacts de l'appareil.">
        {state.contacts.length === 0 && <Note tone="info">Aucun contact. L'enfant peut quand même utiliser le bouton AIDE.</Note>}
        {state.contacts.map((contact) => (
          <div className="list-row" key={contact.id}>
            <div className="row-main">
              <strong>{contact.emoji} {contact.label}</strong><small>{contact.phone}</small>
            </div>
            <SmallButton variant="danger" onClick={() => dispatch({ type: 'contacts',
              contacts: state.contacts.filter((c) => c.id !== contact.id) })}>Retirer</SmallButton>
          </div>
        ))}
        <div className="form-row">
          <Field label="Nom" value={contactLabel} onChange={setContactLabel} placeholder="Papa" />
          <Field label="Pictogramme" value={contactEmoji} onChange={setContactEmoji} placeholder="👨" />
        </div>
        <Field label="Numéro de téléphone" value={contactPhone} onChange={setContactPhone} placeholder="0612345678" type="tel" />
        <SmallButton variant="primary" onClick={() => {
          if (!contactLabel.trim() || !contactPhone.trim()) return;
          dispatch({ type: 'contacts', contacts: [...state.contacts, {
            id: uid(), label: contactLabel.trim(), emoji: contactEmoji || '👨', phone: contactPhone.trim(),
          }] });
          setContactLabel(''); setContactPhone('');
        }}>Ajouter le contact</SmallButton>
      </Section>

      <Note tone="calm">{CATEGORIES.length} catégories disponibles. Les réglages sensoriels et les règles de sécurité sont communs, le reste est propre à chaque enfant.</Note>
    </>
  );
}
