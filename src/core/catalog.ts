import type { Category, ChildProfile, ContentItem, AppState, RuleSet, SensorySettings } from './types';

export const CATEGORIES: Category[] = [
  { id: 'animaux', label: 'Animaux', emoji: '🐱', color: '#E7F0D9' },
  { id: 'vehicules', label: 'Voitures', emoji: '🚗', color: '#DCE8F4' },
  { id: 'musique', label: 'Musique', emoji: '🎵', color: '#F1E3F2' },
  { id: 'maths', label: 'Mathématiques', emoji: '🔢', color: '#FBE9D8' },
  { id: 'sciences', label: 'Sciences', emoji: '🔬', color: '#DDEDEA' },
  { id: 'dessin', label: 'Dessin', emoji: '🎨', color: '#F7E4DE' },
  { id: 'nature', label: 'Nature', emoji: '🌍', color: '#E3EFD9' },
  { id: 'histoires', label: 'Histoires', emoji: '📖', color: '#EDE6F3' },
  { id: 'espace', label: 'Espace', emoji: '🚀', color: '#DEE5F2' },
  { id: 'lecture', label: 'Lecture', emoji: '📚', color: '#F3EBD9' },
];

export const INTERESTS = CATEGORIES.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji }));

export const DEFAULT_ALLOWED_SITES = [
  'youtube-nocookie.com',
  'kiddle.co',
  'wikijunior.org',
  'natgeokids.com',
  'nasa.gov',
  'khanacademy.org',
  'cbeebies.com',
  'storylineonline.net',
];

export const DEFAULT_TRUSTED_CHANNELS = [
  'Les Petits Curieux',
  'Nature Calme',
  'Comptes et Chansons',
  'Atelier Dessin',
  'Sciences Douces',
  'Histoires du Soir',
  'Voitures Douces',
  'Musique Lente',
];

// Catalogue de demonstration, local et sans traceur. En production, les sources
// sont branchees via src/core/sources.ts (YouTube Data API, moteur safe search...).
export const CATALOG: ContentItem[] = [
  // Videos
  { id: 'v-chats', kind: 'video', title: 'Les chats expliques doucement', simpleTitle: 'Les chats', category: 'animaux', emoji: '🐱', color: '#E7F0D9', site: 'youtube-nocookie.com', channel: 'Les Petits Curieux', durationSec: 312, summary: 'Une video lente sur les chats et leurs habitudes.', tags: ['chat', 'animaux', 'calme'], externalId: 'demo-chats' },
  { id: 'v-oiseaux', kind: 'video', title: 'Les oiseaux du jardin', simpleTitle: 'Les oiseaux', category: 'animaux', emoji: '🐦', color: '#E7F0D9', site: 'youtube-nocookie.com', channel: 'Nature Calme', durationSec: 420, summary: 'Observer les oiseaux sans bruit fort.', tags: ['oiseaux', 'animaux', 'nature'], externalId: 'demo-oiseaux' },
  { id: 'v-voitures', kind: 'video', title: 'Les petites voitures', simpleTitle: 'Les voitures', category: 'vehicules', emoji: '🚗', color: '#DCE8F4', site: 'youtube-nocookie.com', channel: 'Voitures Douces', durationSec: 288, summary: 'Des voitures qui roulent lentement.', tags: ['voiture', 'vehicules', 'calme'], externalId: 'demo-voitures' },
  { id: 'v-trains', kind: 'video', title: 'Le train de la montagne', simpleTitle: 'Le train', category: 'vehicules', emoji: '🚂', color: '#DCE8F4', site: 'youtube-nocookie.com', channel: 'Voitures Douces', durationSec: 505, summary: 'Un voyage en train, sans surprise.', tags: ['train', 'vehicules'], externalId: 'demo-train' },
  { id: 'v-comptines', kind: 'video', title: 'Comptines tres douces', simpleTitle: 'Comptines douces', category: 'musique', emoji: '🎵', color: '#F1E3F2', site: 'youtube-nocookie.com', channel: 'Comptes et Chansons', durationSec: 360, summary: 'Trois comptines calmes, volume stable.', tags: ['musique', 'comptine', 'calme'], externalId: 'demo-comptines' },
  { id: 'v-piano', kind: 'video', title: 'Piano lent pour se concentrer', simpleTitle: 'Piano lent', category: 'musique', emoji: '🎹', color: '#F1E3F2', site: 'youtube-nocookie.com', channel: 'Musique Lente', durationSec: 600, summary: 'Musique instrumentale sans paroles.', tags: ['musique', 'piano', 'calme'], externalId: 'demo-piano' },
  { id: 'v-compter', kind: 'video', title: 'Compter jusqu a dix', simpleTitle: 'Compter jusqu a 10', category: 'maths', emoji: '🔢', color: '#FBE9D8', site: 'youtube-nocookie.com', channel: 'Les Petits Curieux', durationSec: 264, summary: 'Les nombres de 1 a 10, un par un.', tags: ['maths', 'nombres', 'apprendre'], externalId: 'demo-compter' },
  { id: 'v-formes', kind: 'video', title: 'Reconnaitre les formes', simpleTitle: 'Les formes', category: 'maths', emoji: '🔺', color: '#FBE9D8', site: 'youtube-nocookie.com', channel: 'Les Petits Curieux', durationSec: 330, summary: 'Rond, carre, triangle : on regarde, on nomme.', tags: ['maths', 'formes', 'apprendre'], externalId: 'demo-formes' },
  { id: 'v-volcans', kind: 'video', title: 'Comment fonctionne un volcan', simpleTitle: 'Les volcans', category: 'sciences', emoji: '🌋', color: '#DDEDEA', site: 'youtube-nocookie.com', channel: 'Sciences Douces', durationSec: 448, summary: 'Une experience simple, images stables.', tags: ['sciences', 'volcan', 'apprendre'], externalId: 'demo-volcans' },
  { id: 'v-eau', kind: 'video', title: 'Le cycle de leau', simpleTitle: 'Le cycle de l eau', category: 'sciences', emoji: '💧', color: '#DDEDEA', site: 'youtube-nocookie.com', channel: 'Sciences Douces', durationSec: 395, summary: 'La pluie, la riviere et les nuages.', tags: ['sciences', 'eau', 'nature'], externalId: 'demo-eau' },
  { id: 'v-dessin', kind: 'video', title: 'Dessiner un arbre etape par etape', simpleTitle: 'Dessiner un arbre', category: 'dessin', emoji: '🎨', color: '#F7E4DE', site: 'youtube-nocookie.com', channel: 'Atelier Dessin', durationSec: 472, summary: 'Une etape apres l autre, sans chronometre.', tags: ['dessin', 'activite', 'calme'], externalId: 'demo-dessin' },
  { id: 'v-foret', kind: 'video', title: 'Promenade calme en foret', simpleTitle: 'La foret', category: 'nature', emoji: '🌳', color: '#E3EFD9', site: 'youtube-nocookie.com', channel: 'Nature Calme', durationSec: 540, summary: 'Une promenade lente en images.', tags: ['nature', 'foret', 'calme'], externalId: 'demo-foret' },
  { id: 'v-histoire', kind: 'video', title: 'Le petit nuage sendort', simpleTitle: 'Le petit nuage', category: 'histoires', emoji: '📖', color: '#EDE6F3', site: 'youtube-nocookie.com', channel: 'Histoires du Soir', durationSec: 385, summary: 'Une histoire courte et tranquille.', tags: ['histoire', 'lecture', 'calme'], externalId: 'demo-histoire' },
  { id: 'v-etoiles', kind: 'video', title: 'Les etoiles, tout doucement', simpleTitle: 'Les etoiles', category: 'espace', emoji: '🚀', color: '#DEE5F2', site: 'youtube-nocookie.com', channel: 'Sciences Douces', durationSec: 410, summary: 'Regarder le ciel et nommer les etoiles.', tags: ['espace', 'sciences', 'apprendre'], externalId: 'demo-etoiles' },
  // Contenus de demonstration pour les regles parentales
  { id: 'v-inconnu', kind: 'video', title: 'Video d une chaine non verifiee', simpleTitle: 'Video a verifier', category: 'animaux', emoji: '🟠', color: '#FBE9D8', site: 'youtube-nocookie.com', channel: 'Chaine Nouvelle', durationSec: 700, summary: 'Chaine pas encore connue des parents.', tags: ['animaux'], needsReview: true },
  { id: 'v-bloque', kind: 'video', title: 'Course rapide et bruyante', simpleTitle: 'Video non disponible', category: 'vehicules', emoji: '🔴', color: '#F7E4DE', site: 'site-non-autorise.example', channel: 'Chaine Rapide', durationSec: 240, summary: 'Exemple de contenu exclu par la liste blanche.', tags: ['voiture'] },

  // Pages / recherche
  { id: 'p-dinosaures', kind: 'page', title: 'Les dinosaures, simplement', simpleTitle: 'Les dinosaures', category: 'animaux', emoji: '🦕', color: '#E7F0D9', site: 'kiddle.co', summary: 'Qui etaient les dinosaures ? Quelques phrases courtes et des images calmes.', tags: ['dinosaures', 'animaux', 'apprendre'] },
  { id: 'p-chats', kind: 'page', title: 'Tout sur les chats', simpleTitle: 'Les chats', category: 'animaux', emoji: '🐱', color: '#E7F0D9', site: 'natgeokids.com', summary: 'Les chats, leur nourriture et leur sommeil.', tags: ['chat', 'animaux'] },
  { id: 'p-espace', kind: 'page', title: 'Le systeme solaire', simpleTitle: 'Les planetes', category: 'espace', emoji: '🪐', color: '#DEE5F2', site: 'nasa.gov', summary: 'Les planetes presentees une par une.', tags: ['espace', 'planetes', 'sciences'] },
  { id: 'p-oiseaux', kind: 'page', title: 'Les oiseaux de nos jardins', simpleTitle: 'Les oiseaux', category: 'nature', emoji: '🐦', color: '#E3EFD9', site: 'wikijunior.org', summary: 'Reconnaitre les oiseaux communs.', tags: ['oiseaux', 'nature', 'animaux'] },
  { id: 'p-nombres', kind: 'page', title: 'Apprendre les nombres', simpleTitle: 'Les nombres', category: 'maths', emoji: '🔢', color: '#FBE9D8', site: 'khanacademy.org', summary: 'Compter, comparer, additionner doucement.', tags: ['maths', 'nombres', 'apprendre'] },
  { id: 'p-couleurs', kind: 'page', title: 'Les couleurs', simpleTitle: 'Les couleurs', category: 'dessin', emoji: '🎨', color: '#F7E4DE', site: 'kiddle.co', summary: 'Nommer et reconnaitre les couleurs.', tags: ['couleurs', 'dessin', 'apprendre'] },
  { id: 'p-volcans', kind: 'page', title: 'Comment nait un volcan', simpleTitle: 'Les volcans', category: 'sciences', emoji: '🌋', color: '#DDEDEA', site: 'wikijunior.org', summary: 'Une explication simple des volcans.', tags: ['volcan', 'sciences'] },
  { id: 'p-histoire', kind: 'page', title: 'Une histoire courte', simpleTitle: 'Une histoire', category: 'histoires', emoji: '📖', color: '#EDE6F3', site: 'storylineonline.net', summary: 'Une histoire lue a voix douce.', tags: ['histoire', 'lecture'] },
  { id: 'p-foret', kind: 'page', title: 'La foret en quatre saisons', simpleTitle: 'La foret', category: 'nature', emoji: '🌳', color: '#E3EFD9', site: 'natgeokids.com', summary: 'Les arbres et les saisons.', tags: ['foret', 'nature'] },
  { id: 'p-trains', kind: 'page', title: 'Les trains du monde', simpleTitle: 'Les trains', category: 'vehicules', emoji: '🚂', color: '#DCE8F4', site: 'kiddle.co', summary: 'Differentes sortes de trains.', tags: ['train', 'vehicules'] },
  { id: 'p-musique', kind: 'page', title: 'Les instruments de musique', simpleTitle: 'Les instruments', category: 'musique', emoji: '🎵', color: '#F1E3F2', site: 'cbeebies.com', summary: 'Decouvrir les instruments sans bruit automatique.', tags: ['musique', 'instruments'] },
  { id: 'p-bloque', kind: 'page', title: 'Page d un site non autorise', simpleTitle: 'Page non disponible', category: 'sciences', emoji: '🔴', color: '#F7E4DE', site: 'site-non-autorise.example', summary: 'Exemple de resultat retire par les regles.', tags: ['sciences'] },

  // Musique et activites (pour les autres entrees de l accueil)
  { id: 'm-pluie', kind: 'music', title: 'Bruit doux de pluie', simpleTitle: 'Pluie douce', category: 'musique', emoji: '🌧️', color: '#DDEDEA', site: 'youtube-nocookie.com', channel: 'Musique Lente', durationSec: 480, summary: 'Un fond sonore stable, lance uniquement par l enfant.', tags: ['musique', 'calme'] },
  { id: 'm-respirer', kind: 'music', title: 'Respirer avec les bulles', simpleTitle: 'Respirer calmement', category: 'musique', emoji: '🫧', color: '#DCE8F4', site: 'youtube-nocookie.com', channel: 'Musique Lente', durationSec: 180, summary: 'Une pause calme, sans compte a rebours.', tags: ['pause', 'calme'] },
  { id: 'a-puzzle', kind: 'activity', title: 'Un puzzle simple', simpleTitle: 'Faire un puzzle', category: 'maths', emoji: '🧩', color: '#FBE9D8', site: 'khanacademy.org', durationSec: 300, summary: 'Une activite courte, sans score ni chronometre.', tags: ['activite', 'apprendre'] },
  { id: 'a-colorier', kind: 'activity', title: 'Colorier une feuille', simpleTitle: 'Colorier', category: 'dessin', emoji: '🖍️', color: '#F7E4DE', site: 'cbeebies.com', durationSec: 300, summary: 'Choisir une couleur, puis une autre.', tags: ['activite', 'dessin'] },
];

export const DEFAULT_ROUTINE = [
  { id: 'r1', label: 'Faire une activite', emoji: '📚', done: false },
  { id: 'r2', label: 'Regarder une video', emoji: '🎬', done: false },
  { id: 'r3', label: 'Faire une pause', emoji: '🧩', done: false },
  { id: 'r4', label: 'Activite suivante', emoji: '🎨', done: false },
];

const DEFAULT_RULES: RuleSet = {
  level: 'equilibre',
  whitelistOnly: true,
  allowedSites: [...DEFAULT_ALLOWED_SITES],
  blockedSites: [],
  blockedKeywords: ['guerre', 'peur', 'bagarre'],
  allowedCategories: CATEGORIES.map((c) => c.id),
  blockedChannels: [],
  trustedChannels: [...DEFAULT_TRUSTED_CHANNELS],
  maxVideoMinutes: 12,
  requireAdultForUncertain: true,
  youtubeManaged: true,
  voiceSearchEnabled: false,
  externalModeration: false,
  enforceSchedules: false,
  enabledSections: ['videos', 'search', 'learn', 'music', 'favorites', 'routine', 'help'],
};

const DEFAULT_SENSORY: SensorySettings = {
  animations: false,
  sounds: false,
  vibration: false,
  slowTransitions: true,
  minimalMode: false,
  largeText: true,
};

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function newProfile(name: string, emoji: string, id: string = crypto.randomUUID()): ChildProfile {
  return {
    id,
    name,
    emoji,
    theme: 'doux',
    interests: ['animaux', 'musique'],
    favorites: [],
    dailyMinutes: 30,
    bonusMinutes: 0,
    secondsUsed: 0,
    dayStamp: todayStamp(),
    routine: DEFAULT_ROUTINE.map((s) => ({ ...s })),
  };
}

export function createInitialState(): AppState {
  const first = newProfile('Enfant', '🦊', 'profile-1');
  return {
    version: 1,
    profiles: [first],
    activeProfileId: first.id,
    rules: DEFAULT_RULES,
    sensory: DEFAULT_SENSORY,
    schedules: [{ id: 's1', label: 'Apres l ecole', start: '16:00', end: '18:00' }],
    history: [],
    recommendations: [],
    contacts: [],
    parent: null,
  };
}
