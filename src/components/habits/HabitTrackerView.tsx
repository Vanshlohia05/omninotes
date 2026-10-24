import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Trash2,
  TrendingUp,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitItem, computeHabitStats } from '../../types/lifeos';

interface HabitTrackerViewProps {
  habits: HabitItem[];
  onSaveHabit: (habit: HabitItem) => void;
  onDeleteHabit: (id: string) => void;
  onBackToNotes?: () => void;
  onOpenSidebar?: () => void;
}

const HABIT_COLORS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Purple', value: '#8B5CF6' }
];

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  habits,
  onSaveHabit,
  onDeleteHabit,
  onBackToNotes,
  onOpenSidebar
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Daily Routine');
  const [newColor, setNewColor] = useState(HABIT_COLORS[0].value);
  const [newIcon, setNewIcon] = useState('✨');

  // Compute month dates for grid
  const currentMonthDate = new Date();
  currentMonthDate.setMonth(currentMonthDate.getMonth() + selectedMonthOffset);
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleDay = (habit: HabitItem, dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const nextCompletions = { ...habit.completions };
    const willBeCompleted = !nextCompletions[dayStr];

    if (willBeCompleted) {
      nextCompletions[dayStr] = true;
      if (dayStr === todayStr) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: [habit.color, '#FFD700', '#10B981']
        });
      }
    } else {
      delete nextCompletions[dayStr];
    }

    onSaveHabit({
      ...habit,
      completions: nextCompletions,
      updatedAt: Date.now()
    });
  };

  const handleCreateHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      name: newTitle.trim(),
      category: newCategory.trim() || 'General',
      color: newColor,
      icon: newIcon,
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completions: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveHabit(newHabit);
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] min-w-0">
      {/* Top Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-neutral-900/70 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          {onBackToNotes && (
            <button
              onClick={onBackToNotes}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
              title="Back to Notes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Flame className="w-4 h-4 fill-emerald-500/20" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Habit Tracker
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                {habits.length} Habits
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Build daily consistency, track streaks, and view monthly heatmaps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Switcher */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-200 select-none">
              {monthName}
            </span>
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {/* Habit Creation Inline Card */}
        {isCreating && (
          <form
            onSubmit={handleCreateHabitSubmit}
            className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Create New Habit
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                placeholder="Habit title (e.g. Read 20 pages)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Category (e.g. Morning, Fitness)..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Color:</span>
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setNewColor(c.value)}
                    className={`w-5 h-5 rounded-full border transition ${
                      newColor === c.value ? 'scale-110 ring-2 ring-emerald-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Save Habit
              </button>
            </div>
          </form>
        )}

        {/* Habits Monthly Grid View */}
        <div className="space-y-3">
          {habits.map((habit) => {
            const stats = computeHabitStats(habit);

            return (
              <div
                key={habit.id}
                className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm space-y-3"
              >
                {/* Habit Top Summary */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{habit.icon || '✨'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {habit.name}
                        </h2>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${habit.color}15`,
                            color: habit.color
                          }}
                        >
                          {habit.category}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Streak Metrics */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{stats.currentStreak} day streak</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <span>Best: {stats.longestStreak}d</span>
                      <span>•</span>
                      <span>Total: {stats.totalCompletions}</span>
                    </div>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 transition"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Days Completion Row */}
                <div className="overflow-x-auto pb-1 scrollbar-none">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {daysArray.map((dayNum) => {
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isCompleted = !!habit.completions?.[dayStr];
                      const isToday = dayStr === todayStr;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => handleToggleDay(habit, dayNum)}
                          className={`w-7 h-9 rounded-lg flex flex-col items-center justify-center transition touch-manipulation ${
                            isCompleted
                              ? 'text-white shadow-sm scale-100'
                              : isToday
                              ? 'border-2 border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/30 text-slate-700 dark:text-slate-300'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500'
                          }`}
                          style={{
                            backgroundColor: isCompleted ? habit.color : undefined
                          }}
                          title={`${dayStr}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                        >
                          <span className="text-[9px] font-mono opacity-80 leading-none">
                            {dayNum}
                          </span>
                          <span className="mt-0.5">
                            {isCompleted ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 block" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
