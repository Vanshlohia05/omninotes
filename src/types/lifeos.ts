// Life OS Domain Types (Habits, Journals, Tasks & Prioritization Frameworks, PARA, CRM)

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface HabitItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  completions: Record<string, boolean>; // 'YYYY-MM-DD' -> true
  createdAt: number;
  updatedAt: number;
}

export type EisenhowerQuadrant = 'q1_do' | 'q2_schedule' | 'q3_delegate' | 'q4_eliminate';
export type OneThreeFiveTier = 'big' | 'medium' | 'small';
export type MoscowTier = 'must' | 'should' | 'could' | 'wont';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  timeEstimateMinutes?: number; // For 2-Minute Rule (<= 2 min)
  isFrog?: boolean;             // Eat the Frog daily hero task
  eisenhower?: EisenhowerQuadrant;
  ivyLeeOrder?: number;         // 1 to 6
  oneThreeFive?: OneThreeFiveTier;
  moscow?: MoscowTier;
  createdAt: number;
  updatedAt: number;
}

export type PaperRuling = 'plain' | 'ruled' | 'grid';
export type JournalViewMode = 'book' | 'scroll' | 'canvas';

export interface JournalPage {
  id: string;
  journalId: string;
  pageNumber: number;
  title: string;
  date: string;
  paperRuling: PaperRuling;
  blocks: any[]; // BlockItem[]
  canvasElements?: any[];
  createdAt: number;
  updatedAt: number;
}

export interface JournalHistoryEntry {
  timestamp: number;
  pageNumber: number;
  title: string;
  preview: string;
}

export interface JournalBook {
  id: string;
  title: string;
  description?: string;
  coverColor: string;
  coverTexture?: 'leather' | 'cloth' | 'hardcover' | 'linen';
  defaultRuling: PaperRuling;
  category: string;
  activePageNumber: number;
  viewMode: JournalViewMode;
  pages: JournalPage[];
  history?: JournalHistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export type ParaType = 'project' | 'area' | 'resource' | 'archive';

export interface ParaItem {
  id: string;
  type: ParaType;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'on_hold' | 'archived';
  deadline?: string;
  tags: string[];
  noteIds: string[];
  color: string;
  icon: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type RelationshipTier = 'family' | 'close_friend' | 'friend' | 'mentor' | 'professional' | 'acquaintance';
export type CatchUpCadence = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CrmInteraction {
  id: string;
  date: string;
  type: 'call' | 'in_person' | 'coffee' | 'dinner' | 'message' | 'email';
  notes: string;
}

export interface CrmContact {
  id: string;
  name: string;
  avatar?: string;
  relationship?: string;
  tier: RelationshipTier;
  companyOrRole?: string;
  email?: string;
  phone?: string;
  birthday?: string; // 'MM-DD' or 'YYYY-MM-DD'
  cadence: CatchUpCadence;
  cadenceDays: number;
  lastCatchUpDate?: string; // 'YYYY-MM-DD'
  notes?: string;
  giftIdeas: string[];
  topicsToDiscuss: string[];
  interactions: CrmInteraction[];
  createdAt: number;
  updatedAt: number;
}

// Habit streak calculation helper
export function computeHabitStats(habit: HabitItem, today = new Date()) {
  const completions = habit.completions || {};
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const dates = Object.keys(completions)
    .filter((d) => completions[d])
    .sort();

  const totalCompletions = dates.length;

  // Calculate current streak backwards from today or yesterday
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasDoneToday = !!completions[todayStr];
  const hasDoneYesterday = !!completions[yesterdayStr];

  if (hasDoneToday || hasDoneYesterday) {
    let checkDate = new Date(hasDoneToday ? today : yesterday);
    while (true) {
      const key = checkDate.toISOString().split('T')[0];
      if (completions[key]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  let prevDate: Date | null = null;
  for (const dateStr of dates) {
    const d = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = d;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    isCompletedToday: hasDoneToday
  };
}

// Birthday countdown helper
export function getDaysUntilBirthday(birthday?: string): number | null {
  if (!birthday) return null;
  try {
    const parts = birthday.split('-');
    const month = parseInt(parts[parts.length - 2], 10) - 1;
    const day = parseInt(parts[parts.length - 1], 10);
    const now = new Date();
    const nextBday = new Date(now.getFullYear(), month, day);
    if (nextBday.getTime() < now.getTime() - 86400000) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const diff = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  } catch {
    return null;
  }
}
