import type { Schedule } from './types';

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function isWithinSchedules(schedules: Schedule[], date = new Date()): boolean {
  if (!schedules.length) return true;
  const now = date.getHours() * 60 + date.getMinutes();
  return schedules.some((slot) => {
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    if (end >= start) return now >= start && now <= end;
    // Plage qui traverse minuit (ex. 20:00 -> 06:00).
    return now >= start || now <= end;
  });
}

export function nextScheduleLabel(schedules: Schedule[]): string {
  if (!schedules.length) return 'bientôt';
  return `${schedules[0].start} (${schedules[0].label})`;
}
