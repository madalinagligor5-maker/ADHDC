import i18n from '@/i18n';
import type { Task } from '@/features/tasks';
import type { CoachReply, QuickActionKind } from './types';

const PRIORITY_RANK: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

export interface CoachContext {
  todayTasks: Task[];
}

export function quickActionReply(kind: QuickActionKind, ctx: CoachContext): CoachReply {
  switch (kind) {
    case 'overwhelmed':
      // The screen flips into "break it down" mode after this prompt.
      return { text: i18n.t('coach:messages.breakdownPrompt') };

    case 'motivation': {
      const lines = i18n.t('coach:motivations', { returnObjects: true }) as string[];
      const line = lines[Math.floor(Math.random() * lines.length)] ?? lines[0] ?? '';
      return { text: line, actions: [{ type: 'focus' }] };
    }

    case 'planDay': {
      const open = ctx.todayTasks.filter((t) => !t.completed);
      if (open.length === 0) {
        return { text: i18n.t('coach:messages.planEmpty'), actions: [{ type: 'tasks' }] };
      }
      const ordered = [...open].sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
      const list = ordered.map((t) => `•  ${t.title}`).join('\n');
      return {
        text: `${i18n.t('coach:messages.planIntro')}\n${list}`,
        actions: [{ type: 'focus' }],
      };
    }

    case 'brainDump':
      return { text: i18n.t('coach:messages.brainDump'), actions: [{ type: 'tasks' }] };
  }
}

/** Turn a daunting task into small steps with an "add it" action. */
export function breakdownReply(title: string): CoachReply {
  const steps = i18n.t('coach:breakdownSteps', { returnObjects: true }) as string[];
  return {
    text: i18n.t('coach:breakdown.intro', { title }),
    actions: [{ type: 'breakdown', title, steps }],
  };
}
