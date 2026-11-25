import type { ContentItem, ContentStatus, FilterResult, RuleSet } from './types';
import { normalize } from './utils';

const STATUS_LABEL: Record<ContentStatus, string> = {
  adapte: '🟢 Probablement adapté',
  'a-verifier': '🟠 À vérifier avec un adulte',
  bloque: '🔴 Contenu bloqué',
};

function matches(value: string, needles: string[]): string | undefined {
  const haystack = normalize(value);
  return needles.find((n) => haystack.includes(normalize(n)));
}

/**
 * Moteur de regles deterministe et explicable. Il ne produit JAMAIS une
 * garantie de securite : uniquement une aide a la decision, controlee par
 * les parents. Chaque source et chaque filtre peut etre ajoute sans modifier
 * l interface (voir docs/ARCHITECTURE.md).
 */
export function evaluateContent(item: ContentItem, rules: RuleSet): FilterResult {
  const reasons: string[] = [];
  const fullText = `${item.title} ${item.summary} ${item.tags.join(' ')} ${item.site} ${item.channel ?? ''}`;

  const badKeyword = matches(fullText, rules.blockedKeywords);
  if (badKeyword) reasons.push(`Mot-clé non autorisé : ${badKeyword}`);

  const badSite = rules.blockedSites.find((site) => normalize(item.site).includes(normalize(site)));
  if (badSite) reasons.push(`Site bloqué : ${badSite}`);

  const badChannel = item.channel && rules.blockedChannels.find((c) => normalize(c) === normalize(item.channel!));
  if (badChannel) reasons.push(`Chaîne bloquée : ${badChannel}`);

  const inWhitelist = rules.allowedSites.some((site) => normalize(item.site).includes(normalize(site)));
  if (rules.whitelistOnly && !inWhitelist) reasons.push('Site absent de la liste autorisée');

  const blocking = badKeyword || badSite || badChannel || (rules.whitelistOnly && !inWhitelist);
  if (blocking) {
    return { status: 'bloque', label: STATUS_LABEL.bloque, reasons, needsAdult: false };
  }

  const uncertain: string[] = [];
  if (!rules.allowedCategories.includes(item.category)) {
    if (rules.level === 'strict') reasons.push('Catégorie non autorisée');
    else uncertain.push('Catégorie à confirmer');
  }
  if (item.needsReview) uncertain.push('Chaîne ou contenu pas encore vérifié par un adulte');
  if (item.durationSec && item.durationSec > rules.maxVideoMinutes * 60) {
    uncertain.push(`Vidéo plus longue que ${rules.maxVideoMinutes} minutes`);
  }
  if (rules.level === 'strict' && item.channel && !rules.trustedChannels.includes(item.channel)) {
    uncertain.push('Chaîne absente de la liste de confiance');
  }
  if (rules.level === 'strict' && !inWhitelist) {
    uncertain.push('Site à confirmer en mode strict');
  }

  if (reasons.length) return { status: 'bloque', label: STATUS_LABEL.bloque, reasons, needsAdult: false };
  if (uncertain.length) {
    return {
      status: 'a-verifier',
      label: STATUS_LABEL['a-verifier'],
      reasons: uncertain,
      needsAdult: rules.requireAdultForUncertain,
    };
  }
  return {
    status: 'adapte',
    label: STATUS_LABEL.adapte,
    reasons: ['Règles des parents : site, catégorie, chaîne et durée autorisés'],
    needsAdult: false,
  };
}

export interface EvaluatedItem {
  item: ContentItem;
  evaluation: FilterResult;
}

export function evaluateAll(items: ContentItem[], rules: RuleSet): EvaluatedItem[] {
  return items.map((item) => ({ item, evaluation: evaluateContent(item, rules) }));
}

/** Un contenu bloqué n'est jamais proposé comme cliquable à l'enfant. */
export function visibleForChild(items: ContentItem[], rules: RuleSet): EvaluatedItem[] {
  return evaluateAll(items, rules).filter(({ evaluation }) => evaluation.status === 'adapte');
}

export function searchCatalog(items: ContentItem[], query: string): ContentItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return items.filter((item) => {
    const text = normalize(`${item.title} ${item.simpleTitle} ${item.summary} ${item.tags.join(' ')} ${item.category}`);
    return words.some((word) => text.includes(word));
  });
}

export function suggestRecommendations(
  items: ContentItem[],
  interests: string[],
  seenIds: string[],
  limit = 4,
): { item: ContentItem; reason: string }[] {
  return items
    .filter((i) => i.kind === 'video' && interests.includes(i.category) && !seenIds.includes(i.id))
    .slice(0, limit)
    .map((item) => ({ item, reason: `Centre d'intérêt : ${item.category}` }));
}
