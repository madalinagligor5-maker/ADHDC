/** Compact, collision-resistant id for local records (single-device store). */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
