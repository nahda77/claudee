import type { ContentItem } from './types';

export interface ModerationVerdict {
  provider: string;
  available: boolean;
  flag: 'unknown' | 'likely-safe' | 'needs-review' | 'unsafe';
  note: string;
}

export interface ModerationProvider {
  id: string;
  label: string;
  assess(item: ContentItem): Promise<ModerationVerdict>;
}

/**
 * Le prototype ne contacte aucun service externe : la moderation est
 * exclusivement reglee par les parents. Un fournisseur serveur peut etre
 * ajoute plus tard sans changer l interface enfant.
 */
export class LocalModerationProvider implements ModerationProvider {
  id = 'local-rules';
  label = 'Règles des parents (local)';
  async assess(): Promise<ModerationVerdict> {
    return {
      provider: this.label,
      available: true,
      flag: 'unknown',
      note: 'Aucune classification automatique. La décision appartient aux règles des parents.',
    };
  }
}

/** Exemple d adaptateur serveur : non active dans le MVP, sans cle ni collecte. */
export class ServerModerationProvider implements ModerationProvider {
  id = 'server-moderation';
  label = 'Modération serveur (optionnelle)';
  constructor(private readonly endpoint = '') {}
  async assess(item: ContentItem): Promise<ModerationVerdict> {
    if (!this.endpoint) {
      return { provider: this.label, available: false, flag: 'unknown', note: 'Service non configuré.' };
    }
    try {
      const response = await fetch(`${this.endpoint}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Uniquement l identifiant de la video : aucune donnee sur l enfant.
        body: JSON.stringify({ videoId: item.externalId ?? item.id }),
      });
      if (!response.ok) throw new Error('indisponible');
      return (await response.json()) as ModerationVerdict;
    } catch {
      return { provider: this.label, available: false, flag: 'unknown', note: 'Service indisponible : prudence.' };
    }
  }
}

export const moderationProviders: ModerationProvider[] = [new LocalModerationProvider()];
