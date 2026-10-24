import { describe, it, expect } from 'vitest';
import {
  HabitItem,
  computeHabitStats,
  getDaysUntilBirthday,
  TaskItem,
  JournalBook
} from '../../types/lifeos';
import {
  INITIAL_HABITS,
  INITIAL_TASKS,
  INITIAL_JOURNALS,
  INITIAL_PARA_ITEMS,
  INITIAL_CRM_CONTACTS
} from '../sampleData';

describe('Life OS Suite', () => {
  describe('Habits & Streaks', () => {
    it('calculates 0 streak for empty habit completions', () => {
      const habit: HabitItem = {
        id: 'h1',
        name: 'Daily Meditation',
        category: 'Mindfulness',
        color: '#10B981',
        icon: '🧘',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        completions: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const stats = computeHabitStats(habit, new Date('2026-10-24'));
      expect(stats.currentStreak).toBe(0);
      expect(stats.totalCompletions).toBe(0);
      expect(stats.isCompletedToday).toBe(false);
    });

    it('calculates active streak when completed today', () => {
      const habit: HabitItem = {
        id: 'h2',
        name: 'Hydration',
        category: 'Health',
        color: '#0EA5E9',
        icon: '💧',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        completions: {
          '2026-10-22': true,
          '2026-10-23': true,
          '2026-10-24': true
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const stats = computeHabitStats(habit, new Date('2026-10-24'));
      expect(stats.currentStreak).toBe(3);
      expect(stats.longestStreak).toBe(3);
      expect(stats.isCompletedToday).toBe(true);
      expect(stats.totalCompletions).toBe(3);
    });

    it('preserves streak if completed yesterday even if not yet done today', () => {
      const habit: HabitItem = {
        id: 'h3',
        name: 'Running',
        category: 'Health',
        color: '#F43F5E',
        icon: '🏃',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        completions: {
          '2026-10-22': true,
          '2026-10-23': true
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const stats = computeHabitStats(habit, new Date('2026-10-24'));
      expect(stats.currentStreak).toBe(2);
      expect(stats.isCompletedToday).toBe(false);
    });
  });

  describe('Personal CRM Birthday Countdown', () => {
    it('returns null for undefined birthday', () => {
      expect(getDaysUntilBirthday(undefined)).toBeNull();
    });

    it('returns valid days count for valid MM-DD', () => {
      const days = getDaysUntilBirthday('12-25');
      expect(typeof days).toBe('number');
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Task Prioritization Frameworks', () => {
    it('has properly categorized initial tasks for all 8 frameworks', () => {
      expect(INITIAL_TASKS.length).toBeGreaterThan(0);
      const frogs = INITIAL_TASKS.filter((t) => t.isFrog);
      expect(frogs.length).toBe(1);

      const q1Tasks = INITIAL_TASKS.filter((t) => t.eisenhower === 'q1_do');
      expect(q1Tasks.length).toBeGreaterThan(0);

      const twoMinTasks = INITIAL_TASKS.filter((t) => (t.timeEstimateMinutes || 10) <= 2);
      expect(twoMinTasks.length).toBeGreaterThan(0);

      const doneTasks = INITIAL_TASKS.filter((t) => t.completed);
      expect(doneTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Journal Suite', () => {
    it('seeds journals with Page 1 Table of Contents and template pages', () => {
      expect(INITIAL_JOURNALS.length).toBeGreaterThan(0);
      const personal = INITIAL_JOURNALS.find((j) => j.id === 'journal-personal');
      expect(personal).toBeDefined();
      expect(personal?.pages[0].title).toBe('Table of Contents');
      expect(personal?.pages.length).toBeGreaterThan(1);
    });
  });

  describe('PARA Second Brain', () => {
    it('seeds all 4 categories: projects, areas, resources, archives', () => {
      const types = new Set(INITIAL_PARA_ITEMS.map((p) => p.type));
      expect(types.has('project')).toBe(true);
      expect(types.has('area')).toBe(true);
      expect(types.has('resource')).toBe(true);
      expect(types.has('archive')).toBe(true);
    });
  });
});
