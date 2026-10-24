import React from 'react';
import { Flame, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BlockItem } from '../../types/note';

interface HabitBlockProps {
  block: BlockItem;
  onUpdate: (updated: BlockItem) => void;
}

export const HabitBlock: React.FC<HabitBlockProps> = ({ block, onUpdate }) => {
  const habitData = block.habitData || {
    title: block.content || 'Daily Habit Goal',
    category: 'Routine',
    color: '#10B981',
    icon: '✨',
    streak: 0,
    todayCompleted: false,
    completions: {}
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isDoneToday = !!habitData.completions?.[todayStr];

  const handleToggle = () => {
    const nextDone = !isDoneToday;
    const nextCompletions = { ...(habitData.completions || {}) };

    if (nextDone) {
      nextCompletions[todayStr] = true;
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: [habitData.color || '#10B981', '#FFD700', '#3B82F6']
      });
    } else {
      delete nextCompletions[todayStr];
    }

    const nextStreak = nextDone ? (habitData.streak || 0) + 1 : Math.max(0, (habitData.streak || 1) - 1);

    onUpdate({
      ...block,
      habitData: {
        ...habitData,
        streak: nextStreak,
        todayCompleted: nextDone,
        completions: nextCompletions
      }
    });
  };

  // Recent 7 days preview
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('default', { weekday: 'narrow' });
    return {
      date: key,
      dayLabel,
      completed: !!habitData.completions?.[key],
      isToday: key === todayStr
    };
  });

  return (
    <div className="my-2 p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#202020] shadow-sm space-y-2.5 max-w-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition shadow-sm ${
              isDoneToday
                ? 'bg-emerald-500 text-white'
                : 'border border-black/15 dark:border-white/20 bg-slate-50 dark:bg-neutral-800 text-slate-400 hover:border-emerald-500'
            }`}
          >
            {isDoneToday && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
          <div>
            <input
              type="text"
              value={habitData.title}
              onChange={(e) =>
                onUpdate({
                  ...block,
                  habitData: { ...habitData, title: e.target.value }
                })
              }
              className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              placeholder="Habit title..."
            />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span
                className="px-1.5 py-0.2 rounded font-medium"
                style={{
                  backgroundColor: `${habitData.color || '#10B981'}20`,
                  color: habitData.color || '#10B981'
                }}
              >
                {habitData.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                <Flame className="w-3 h-3 fill-amber-500" />
                {habitData.streak}d streak
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {recentDays.map((d) => (
            <div
              key={d.date}
              className={`w-5 h-7 rounded flex flex-col items-center justify-center text-[8px] font-mono ${
                d.completed
                  ? 'bg-emerald-500 text-white'
                  : d.isToday
                  ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 text-slate-400'
              }`}
              title={d.date}
            >
              <span>{d.dayLabel}</span>
              <span className="mt-0.5">
                {d.completed ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-neutral-600 block" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
