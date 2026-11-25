export function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return 'Court';
  const min = Math.round(seconds / 60);
  return `${min} min`;
}

export function formatClock(at: number): string {
  return new Date(at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(at: number): string {
  return new Date(at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function sameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function haptic(enabled: boolean): void {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(18); } catch { /* appareil non compatible */ }
  }
}
