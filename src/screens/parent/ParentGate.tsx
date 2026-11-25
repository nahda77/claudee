import { useState } from 'react';
import { useApp } from '../../core/state';
import { isBiometricAvailable } from '../../core/security';
import { BigButton, Modal, Note, ScreenTitle, Section, SmallButton } from '../../components/ui';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function PinPad({ onDigit, onDelete }: { onDigit: (digit: string) => void; onDelete: () => void }) {
  return (
    <div className="pin-pad">
      {DIGITS.map((digit, index) => digit === ''
        ? <span key={index} />
        : <button type="button" key={index} onClick={() => digit === '⌫' ? onDelete() : onDigit(digit)}>{digit}</button>)}
    </div>
  );
}

function dots(length: number): string { return '●'.repeat(length) + '○'.repeat(Math.max(0, 4 - length)); }

export default function ParentGate({ onUnlock, onCancel }: { onUnlock: () => void; onCancel: () => void }) {
  const { state, setupPin, checkPin, biometricUnlock, resetAll } = useApp();
  const creating = !state.parent;
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function addDigit(digit: string) {
    setMessage('');
    if (pin.length >= 6) return;
    setPin((value) => value + digit);
  }

  async function submit() {
    if (busy || pin.length < 4) { setMessage('Il faut au moins 4 chiffres.'); return; }
    setBusy(true);
    if (creating) {
      if (step === 'create') {
        setFirstPin(pin); setPin(''); setStep('confirm');
        setMessage('Écris le même code une deuxième fois.');
      } else if (pin !== firstPin) {
        setMessage('Les deux codes sont différents. On recommence.');
        setPin(''); setFirstPin(''); setStep('create');
      } else {
        await setupPin(pin);
        onUnlock();
      }
    } else {
      const ok = await checkPin(pin);
      if (ok) onUnlock();
      else { setMessage('Ce code n’est pas le bon. Tu peux réessayer.'); setPin(''); }
    }
    setBusy(false);
  }

  async function tryBiometric() {
    setBusy(true);
    const ok = await biometricUnlock();
    setBusy(false);
    if (ok) onUnlock();
    else setMessage('La biométrie n’a pas fonctionné. Tu peux utiliser le code PIN.');
  }

  return (
    <div className="screen-scroll parent">
      <ScreenTitle emoji="🔒" title={creating ? 'Créer l’espace parent' : 'Espace parent'}
        subtitle={creating ? 'Choisis un code PIN à 4 chiffres ou plus.' : 'Code PIN ou biométrie.'} />
      <Section title={creating ? (step === 'create' ? 'Nouveau code' : 'Confirme le code') : 'Code PIN'}>
        <div className="pin-display" aria-label={`${pin.length} chiffres saisis`}>{dots(pin.length)}</div>
        <PinPad onDigit={addDigit} onDelete={() => setPin((value) => value.slice(0, -1))} />
        {message && <Note tone={message.includes('pas le bon') || message.includes('différents') ? 'warn' : 'info'}>{message}</Note>}
        <BigButton emoji="✅" label={busy ? 'Un instant…' : creating ? 'Enregistrer' : 'Ouvrir'}
          sub="Le code n’est jamais stocké en clair" onClick={() => void submit()} disabled={busy} />
        {!creating && isBiometricAvailable() && state.parent?.biometricCredentialId && (
          <div className="button-row">
            <SmallButton onClick={() => void tryBiometric()} disabled={busy}>🔓 Ouvrir avec la biométrie</SmallButton>
          </div>
        )}
      </Section>
      <Note tone="calm">Les réglages, l’historique et les contacts sont chiffrés sur cet appareil. Aucun serveur, aucune publicité.</Note>
      <div className="button-row">
        <SmallButton onClick={onCancel}>↩️ Retour à l’espace enfant</SmallButton>
        <SmallButton variant="danger" onClick={() => setConfirmReset(true)}>Réinitialiser</SmallButton>
      </div>
      {confirmReset && (
        <Modal title="Effacer toutes les données ?" onClose={() => setConfirmReset(false)}>
          <p className="muted">Cette action supprime le code PIN, les profils, les règles et l’historique de cet appareil. Elle ne peut pas être annulée.</p>
          <div className="button-row">
            <SmallButton onClick={() => setConfirmReset(false)}>Annuler</SmallButton>
            <SmallButton variant="danger" onClick={() => { void resetAll(); setConfirmReset(false); setPin(''); setFirstPin(''); setStep('create'); }}>Effacer</SmallButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
