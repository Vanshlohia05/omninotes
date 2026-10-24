import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Flame,
  Clock,
  Calendar,
  Trash2,
  ChevronLeft,
  Star,
  Target,
  Check,
  Zap,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TaskItem,
  EisenhowerQuadrant,
  OneThreeFiveTier,
  MoscowTier
} from '../../types/lifeos';

interface TodoHubViewProps {
  tasks: TaskItem[];
  onSaveTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onBackToNotes?: () => void;
  onOpenSidebar?: () => void;
}

type FrameworkTab =
  | 'list'
  | 'eisenhower'
  | 'ivylee'
  | 'frog'
  | 'onethreefive'
  | 'twominute'
  | 'moscow'
  | 'done';

const TABS: { id: FrameworkTab; label: string; icon: string }[] = [
  { id: 'list', label: 'All Tasks', icon: '📝' },
  { id: 'eisenhower', label: 'Eisenhower 2x2', icon: '⚡' },
  { id: 'ivylee', label: 'Ivy Lee (Top 6)', icon: '🎯' },
  { id: 'frog', label: 'Eat the Frog', icon: '🐸' },
  { id: 'onethreefive', label: '1-3-5 Rule', icon: '📊' },
  { id: 'twominute', label: '2-Minute Rule', icon: '⏱️' },
  { id: 'moscow', label: 'MoSCoW', icon: '🏛️' },
  { id: 'done', label: 'Anti-To-Do ("Done")', icon: '🏆' }
];

export const TodoHubView: React.FC<TodoHubViewProps> = ({
  tasks,
  onSaveTask,
  onDeleteTask,
  onBackToNotes,
  onOpenSidebar
}) => {
  const [activeTab, setActiveTab] = useState<FrameworkTab>('list');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isNewFrog, setIsNewFrog] = useState(false);
  const [newEstimate, setNewEstimate] = useState<number>(5);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleToggleTask = (task: TaskItem) => {
    const nextCompleted = !task.completed;
    if (nextCompleted) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#F59E0B', '#3B82F6']
      });
    }

    onSaveTask({
      ...task,
      completed: nextCompleted,
      completedAt: nextCompleted ? Date.now() : undefined,
      updatedAt: Date.now()
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      isFrog: isNewFrog,
      timeEstimateMinutes: newEstimate,
      eisenhower: newPriority === 'urgent' ? 'q1_do' : 'q2_schedule',
      oneThreeFive: isNewFrog ? 'big' : 'medium',
      moscow: newPriority === 'urgent' ? 'must' : 'should',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveTask(newTask);
    setNewTitle('');
    setIsCreating(false);
    setIsNewFrog(false);
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
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              To-Do Hub
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                {activeTasks.length} Active
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Apple Notes checklist upgraded with 8 task prioritization frameworks
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Clean Segmented Framework Pills */}
      <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-neutral-900/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Framework Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {/* Inline Create Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Add New Prioritized Task
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="What needs to get done?..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewFrog}
                    onChange={(e) => setIsNewFrog(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>🐸 Eat the Frog (Hero Task)</span>
                </label>
                <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                  <span>Est:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newEstimate}
                    onChange={(e) => setNewEstimate(parseInt(e.target.value, 10) || 5)}
                    className="w-12 px-1 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-center font-mono"
                  />
                  <span>min</span>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* 1. STANDARD ALL TASKS LIST */}
        {activeTab === 'list' && (
          <div className="space-y-2">
            {activeTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">
                All tasks completed! Great work.
              </p>
            ) : (
              activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="w-5 h-5 rounded-lg border border-black/20 dark:border-white/20 flex items-center justify-center hover:border-emerald-500 transition"
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                      {task.title}
                    </span>
                    {task.isFrog && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold shrink-0">
                        🐸 Frog
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-300 group-hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. EISENHOWER 2X2 MATRIX */}
        {activeTab === 'eisenhower' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'q1_do' as EisenhowerQuadrant,
                title: 'Q1: Urgent & Important (Do First)',
                color: 'border-red-500/30 bg-red-50/20 dark:bg-red-950/10 text-red-700 dark:text-red-300'
              },
              {
                id: 'q2_schedule' as EisenhowerQuadrant,
                title: 'Q2: Important, Not Urgent (Schedule)',
                color: 'border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10 text-blue-700 dark:text-blue-300'
              },
              {
                id: 'q3_delegate' as EisenhowerQuadrant,
                title: 'Q3: Urgent, Not Important (Delegate)',
                color: 'border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 text-amber-700 dark:text-amber-300'
              },
              {
                id: 'q4_eliminate' as EisenhowerQuadrant,
                title: 'Q4: Neither (Eliminate)',
                color: 'border-slate-500/30 bg-slate-50/20 dark:bg-slate-900/10 text-slate-700 dark:text-slate-300'
              }
            ].map((quad) => {
              const quadTasks = activeTasks.filter((t) => t.eisenhower === quad.id);

              return (
                <div
                  key={quad.id}
                  className={`p-4 rounded-2xl border shadow-sm space-y-2.5 min-h-[200px] ${quad.color}`}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider">{quad.title}</h3>
                  <div className="space-y-1.5">
                    {quadTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No tasks in this quadrant</p>
                    ) : (
                      quadTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleTask(t)}
                              className="w-4 h-4 rounded border border-black/20 dark:border-white/20 flex items-center justify-center"
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {t.title}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. IVY LEE METHOD (TOP 6) */}
        {activeTab === 'ivylee' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">The Ivy Lee Rule:</span> Prioritize exactly 6 tasks for the day in strict numerical order. Work on Task 1 until done before touching Task 2.
            </div>
            {activeTasks.slice(0, 6).map((task, idx) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleTask(task)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 4. EAT THE FROG */}
        {activeTab === 'frog' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-apple-card text-center space-y-3">
              <span className="text-4xl">🐸</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Today's Frog (Hardest, Most Important Task)
              </h2>
              {activeTasks.find((t) => t.isFrog) ? (
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/5 space-y-3">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    {activeTasks.find((t) => t.isFrog)?.title}
                  </p>
                  <button
                    onClick={() => {
                      const frog = activeTasks.find((t) => t.isFrog);
                      if (frog) handleToggleTask(frog);
                    }}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
                  >
                    Mark Frog Completed 🐸✨
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No frog selected today. Mark a task as "Eat the Frog" during task creation.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. 1-3-5 RULE */}
        {activeTab === 'onethreefive' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { tier: 'big' as OneThreeFiveTier, label: '1 Big Task', limit: 1, color: 'text-rose-600 dark:text-rose-400' },
              { tier: 'medium' as OneThreeFiveTier, label: '3 Medium Tasks', limit: 3, color: 'text-amber-600 dark:text-amber-400' },
              { tier: 'small' as OneThreeFiveTier, label: '5 Small Tasks', limit: 5, color: 'text-emerald-600 dark:text-emerald-400' }
            ].map((section) => {
              const tierTasks = activeTasks.filter((t) => t.oneThreeFive === section.tier).slice(0, section.limit);

              return (
                <div
                  key={section.tier}
                  className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm space-y-2"
                >
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${section.color}`}>
                    {section.label}
                  </h3>
                  <div className="space-y-1.5">
                    {tierTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No tasks assigned here.</p>
                    ) : (
                      tierTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {t.title}
                          </span>
                          <button
                            onClick={() => handleToggleTask(t)}
                            className="text-xs text-emerald-600 font-semibold"
                          >
                            Done
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. 2-MINUTE RULE */}
        {activeTab === 'twominute' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300">
              <span className="font-bold">2-Minute Rule:</span> If an action takes 2 minutes or less, do it right now instead of postponing or scheduling it!
            </div>
            {activeTasks
              .filter((t) => (t.timeEstimateMinutes || 5) <= 2)
              .map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-sky-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {task.timeEstimateMinutes} min quick action
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
                  >
                    Done Now
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* 7. MOSCOW METHOD */}
        {activeTab === 'moscow' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { tier: 'must' as MoscowTier, title: 'Must Have (Non-negotiable)', color: 'text-red-600' },
              { tier: 'should' as MoscowTier, title: 'Should Have (Important)', color: 'text-amber-600' },
              { tier: 'could' as MoscowTier, title: 'Could Have (Nice to have)', color: 'text-emerald-600' },
              { tier: 'wont' as MoscowTier, title: "Won't Have (Deferred)", color: 'text-slate-500' }
            ].map((m) => {
              const mTasks = activeTasks.filter((t) => t.moscow === m.tier);
              return (
                <div
                  key={m.tier}
                  className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm space-y-2"
                >
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${m.color}`}>
                    {m.title}
                  </h3>
                  <div className="space-y-1.5">
                    {mTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No tasks</p>
                    ) : (
                      mTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] text-xs"
                        >
                          <span>{t.title}</span>
                          <button
                            onClick={() => handleToggleTask(t)}
                            className="text-slate-400 hover:text-emerald-500"
                          >
                            ✓
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. ANTI-TO-DO LIST ("DONE LIST") */}
        {activeTab === 'done' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Anti-To-Do ("Done List"):</strong> Celebrate everything you accomplished today and build unstoppable momentum!
              </span>
            </div>
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No tasks completed yet today. Mark a task done to see it here!
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs line-through text-slate-400 font-medium">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
