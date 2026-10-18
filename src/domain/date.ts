/** Local calendar day in the form YYYY-MM-DD. */
export type DateKey = string;

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: DateKey, amount: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** The last `count` days ending with `end`, oldest first. */
export function lastNDays(count: number, end: DateKey = todayKey()): DateKey[] {
  return Array.from({ length: count }, (_, index) => addDays(end, index - (count - 1)));
}

/** Start/end of a local day in epoch milliseconds. */
export function dayBounds(key: DateKey): { start: number; end: number } {
  const start = fromDateKey(key);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

export function formatMinutes(total: number, units: { h: string; min: string }): string {
  const minutes = Math.round(total);
  if (minutes < 60) return `${minutes} ${units.min}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ${units.h}` : `${hours} ${units.h} ${rest} ${units.min}`;
}

/** Simple, stable string hash used to pick deterministic daily content. */
export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}
