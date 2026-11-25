import type { ContentItem } from './types';
import { CATALOG } from './catalog';
import { normalize } from './utils';

export interface ContentSource {
  id: string;
  label: string;
  kinds: ContentItem['kind'][];
  /** Renvoie des contenus BRUTS. Le filtrage est toujours applique apres, par rules.ts. */
  search(query: string): Promise<ContentItem[]>;
  byId?(id: string): Promise<ContentItem | undefined>;
}

/** Source locale du prototype : aucun reseau, aucun traceur, donnees stables. */
export class DemoCatalogSource implements ContentSource {
  id = 'demo-catalog';
  label = 'Catalogue de démonstration';
  kinds: ContentItem['kind'][] = ['video', 'page', 'music', 'activity'];

  async search(query: string): Promise<ContentItem[]> {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return CATALOG;
    return CATALOG.filter((item) =>
      words.some((w) =>
        normalize(`${item.title} ${item.simpleTitle} ${item.summary} ${item.tags.join(' ')} ${item.category}`).includes(w),
      ),
    );
  }

  async byId(id: string): Promise<ContentItem | undefined> {
    return CATALOG.find((item) => item.id === id);
  }
}

/**
 * Adaptateur de production. Il ne doit PAS etre appele depuis le telephone
 * avec une cle API : le relais serveur applique les regles, la quota et la
 * journalisation minimale. Voir docs/ARCHITECTURE.md.
 */
export class YouTubeSource implements ContentSource {
  id = 'youtube-managed';
  label = 'YouTube (mode contrôlé)';
  kinds: ContentItem['kind'][] = ['video'];

  constructor(private readonly proxyUrl = '') {}

  async search(query: string): Promise<ContentItem[]> {
    if (!this.proxyUrl) return [];
    const response = await fetch(`${this.proxyUrl}/youtube/search?q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { items: ContentItem[] };
    return payload.items.map((item) => ({ ...item, site: 'youtube-nocookie.com' }));
  }
}

/** Adaptateur moteur de recherche sur liste blanche (Kiddle / Google CSE / Brave via relais). */
export class SafeSearchSource implements ContentSource {
  id = 'safe-search';
  label = 'Recherche sécurisée (relais)';
  kinds: ContentItem['kind'][] = ['page'];

  constructor(private readonly proxyUrl = '') {}

  async search(query: string): Promise<ContentItem[]> {
    if (!this.proxyUrl) return [];
    const response = await fetch(`${this.proxyUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { items: ContentItem[] };
    return payload.items;
  }
}

const registry: ContentSource[] = [new DemoCatalogSource()];

export function registerSource(source: ContentSource): void {
  if (!registry.some((s) => s.id === source.id)) registry.push(source);
}

export function listSources(): ContentSource[] {
  return [...registry];
}

export async function searchAllSources(query: string, kinds?: ContentItem['kind'][]): Promise<ContentItem[]> {
  const sources = registry.filter((s) => !kinds || s.kinds.some((k) => kinds.includes(k)));
  const results = await Promise.all(
    sources.map(async (source) => {
      try { return await source.search(query); } catch { return []; }
    }),
  );
  const unique = new Map<string, ContentItem>();
  results.flat().forEach((item) => unique.set(item.id, item));
  return [...unique.values()];
}

export const DISCLAIMER =
  'Cette évaluation aide à choisir. Elle ne garantit jamais qu’un contenu est sûr. Un adulte peut toujours vérifier et reprendre le contrôle.';
