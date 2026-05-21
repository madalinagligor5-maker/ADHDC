export type CoachRole = 'coach' | 'user';

export type QuickActionKind = 'overwhelmed' | 'motivation' | 'planDay' | 'brainDump';

/** Actions a coach message can offer, wired to real app behavior. */
export type CoachAction =
  | { type: 'focus' }
  | { type: 'tasks' }
  | { type: 'breakdown'; title: string; steps: string[] };

export interface CoachMessage {
  id: string;
  role: CoachRole;
  text: string;
  actions?: CoachAction[];
}

export interface CoachReply {
  text: string;
  actions?: CoachAction[];
}
