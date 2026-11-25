/* Recherche vocale optionnelle : aucun microphone n est ouvert avant un clic
   explicite de l enfant ET l activation par le parent dans les regles. */
type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionLike;

function getConstructor(): RecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getConstructor() !== null;
}

export function listenOnce(
  onResult: (transcript: string) => void,
  onError: () => void,
): (() => void) | null {
  const Ctor = getConstructor();
  if (!Ctor) { onError(); return null; }
  const recognition = new Ctor();
  recognition.lang = 'fr-FR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => onResult(event.results[0][0].transcript);
  recognition.onerror = onError;
  recognition.onend = () => { /* rien d automatique */ };
  try { recognition.start(); } catch { onError(); return null; }
  return () => { try { recognition.stop(); } catch { /* deja arrete */ } };
}
