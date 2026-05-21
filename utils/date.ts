/** Lightweight, dependency-free date helpers (local time). */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** `weekStartsOn`: 0 = Sunday, 1 = Monday. */
export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function weekDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** 6×7 grid of dates covering `date`'s month, padded to whole weeks. */
export function monthMatrix(date: Date, weekStartsOn: 0 | 1 = 1): Date[][] {
  const gridStart = startOfWeek(startOfMonth(date), weekStartsOn);
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day)),
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Stable `YYYY-MM-DD` key in local time, for maps/sets of marked days. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Locale-aware narrow weekday initial (e.g. "M", "L"). */
export function weekdayNarrow(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date);
}

/** Whether the locale conventionally starts the week on Monday. */
export function weekStartsOnForLocale(locale: string): 0 | 1 {
  // English (esp. en-US) starts Sunday; ro/fr and most others start Monday.
  return locale.toLowerCase().startsWith('en') ? 0 : 1;
}

/** Locale-aware time formatting (12h vs 24h follows the locale) from `HH:mm`. */
export function formatTime(hhmm: string, locale: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(d);
}

/** Long, locale-aware date label, e.g. "Tuesday, 20 May". */
export function formatLongDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Short, locale-aware date + time, e.g. "20 May, 14:30". */
export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/** Locale-aware "month year", e.g. "May 2026". */
export function formatMonthYear(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}
