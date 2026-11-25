/* Test de parcours (sans navigateur) : accueil -> vidéos -> évaluation ->
   lecteur -> recherche -> espace parent PIN -> règles -> historique.
   Lance avec : npm run test:smoke */
import { JSDOM } from 'jsdom';
import { webcrypto } from 'node:crypto';
import { build } from 'esbuild';

const bundle = await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  write: false,
  format: 'iife',
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'silent',
});
const code = bundle.outputFiles[0].text;

const dom = new JSDOM('<!doctype html><html lang="fr"><body><div id="root"></div></body></html>', {
  url: 'https://preview.example.com/', pretendToBeVisual: true, runScripts: 'outside-only',
});
const { window } = dom;
Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true });
Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder;
const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
const originalError = window.console.error;
window.console.error = (...args) => { errors.push(args.map(String).join(' ')); originalError(...args); };
window.eval(code);

const wait = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const text = () => window.document.body.textContent || '';
function click(match) {
  const buttons = [...window.document.querySelectorAll('button')];
  const button = buttons.find((b) => (b.textContent || '').includes(match));
  if (!button) throw new Error(`Bouton introuvable: ${match}\nBoutons: ${buttons.map((b) => b.textContent?.trim()).join(' | ').slice(0, 900)}`);
  button.click();
  return button;
}
function expect(fragment, label) {
  if (!text().includes(fragment)) throw new Error(`[${label}] texte absent: « ${fragment} »\n${text().slice(0, 700)}`);
  console.log(`✓ ${label} : « ${fragment} »`);
}

try {
  await wait(900);
  expect('Bonjour', 'accueil enfant');
  click('Regarder une vidéo'); await wait();
  expect("Qu'aimerais-tu regarder", 'section vidéos');
  click('Animaux'); await wait();
  expect('Les chats', 'résultats vidéos');
  click('Est-ce que cette vidéo me convient'); await wait();
  expect('Probablement adapté', 'évaluation contenu');
  click('Regarder la vidéo'); await wait();
  expect('Tu regardes une vidéo', 'lecteur simplifié');
  click('Terminer'); await wait();
  expect('Vidéo terminée', 'fin de vidéo');

  click('Accueil'); await wait();
  click('Chercher quelque chose'); await wait();
  expect('Écris un mot', 'recherche sécurisée');
  click('dinosaures'); await wait();
  expect('Recherche terminée', 'résultats de recherche');
  expect('Les dinosaures', 'page autorisée');

  click('Accueil'); await wait();
  click("Ouvrir l'espace parent"); await wait();
  expect('Créer l', 'porte parent');
  for (const digit of ['1', '2', '3', '4']) { click(digit); await wait(40); }
  click('Enregistrer'); await wait();
  expect('Confirme le code', 'confirmation du PIN');
  for (const digit of ['1', '2', '3', '4']) { click(digit); await wait(40); }
  click('Enregistrer'); await wait(900);
  expect('Tableau de bord', 'tableau de bord parent');
  click('⚙️ Règles'); await wait();
  expect('Règles de sécurité', 'règles parent');
  click('📜 Historique'); await wait();
  expect('Historique', 'historique parent');
  click('🫧 Sensoriel'); await wait();
  expect('Confort sensoriel', 'réglages sensoriels');

  const stored = window.localStorage.getItem('oasis.data.v1');
  if (!stored || !stored.includes('cipher')) throw new Error('Stockage chiffré absent');
  console.log('✓ stockage local chiffré (AES-GCM)');
  if (errors.length) throw new Error(`Erreurs JS:\n${errors.slice(0, 5).join('\n')}`);
  console.log('\nTous les parcours de test sont passés.');
  dom.window.close();
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  dom.window.close();
  process.exit(1);
}
