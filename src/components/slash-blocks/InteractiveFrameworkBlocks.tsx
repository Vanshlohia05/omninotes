import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Flame,
  Calendar as CalendarIcon,
  Smile,
  DollarSign,
  TrendingUp,
  Brain,
  Award,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';
import { BlockItem } from '../../types/note';

interface SlashBlockProps {
  block: BlockItem;
  onUpdate: (updated: BlockItem) => void;
}

// 1. KANBAN BOARD SLASH BLOCK
export const KanbanBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  const kanban = block.kanbanData || {
    columns: [
      { id: 'todo', title: 'To Do', cards: [{ id: 'c1', title: 'Scope requirements' }] },
      { id: 'doing', title: 'In Progress', cards: [{ id: 'c2', title: 'Design architecture' }] },
      { id: 'done', title: 'Done', cards: [{ id: 'c3', title: 'Project setup' }] }
    ]
  };

  const handleAddCard = (colIndex: number) => {
    const title = prompt('Card Title:');
    if (!title?.trim()) return;

    const newCols = [...kanban.columns];
    newCols[colIndex].cards.push({ id: `card-${Date.now()}`, title: title.trim() });
    onUpdate({ ...block, kanbanData: { columns: newCols } });
  };

  const handleMoveCard = (fromCol: number, toCol: number, cardIndex: number) => {
    const newCols = [...kanban.columns];
    const [card] = newCols[fromCol].cards.splice(cardIndex, 1);
    newCols[toCol].cards.push(card);
    onUpdate({ ...block, kanbanData: { columns: newCols } });
  };

  return (
    <div className="my-3 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-900/60 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>📋</span>
          <span>Interactive Kanban Board</span>
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {kanban.columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{col.title}</span>
              <button
                onClick={() => handleAddCard(colIdx)}
                className="p-1 hover:text-amber-600 transition"
                title="Add card"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 min-h-[60px]">
              {col.cards.map((card, cardIdx) => (
                <div
                  key={card.id}
                  className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-xs flex items-center justify-between group"
                >
                  <span className="truncate">{card.title}</span>
                  {colIdx < kanban.columns.length - 1 && (
                    <button
                      onClick={() => handleMoveCard(colIdx, colIdx + 1, cardIdx)}
                      className="text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition"
                      title="Move forward"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. GTD 5-STEP WORKFLOW BLOCK
export const GTDBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  const steps = [
    { name: '1. Capture', desc: 'Collect what has your attention into an inbox.' },
    { name: '2. Clarify', desc: 'Process what it means (Actionable? <2 min? Delegate? Project?).' },
    { name: '3. Organize', desc: 'Put it where it belongs (Contexts, Calendars, Next Actions).' },
    { name: '4. Reflect', desc: 'Review frequently to stay clear and updated.' },
    { name: '5. Engage', desc: 'Execute with confidence knowing you picked the right task.' }
  ];

  return (
    <div className="my-3 p-4 rounded-2xl border border-sky-500/20 bg-sky-50/20 dark:bg-sky-950/10 shadow-sm space-y-2.5">
      <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
        <span>⚡</span>
        <span>Getting Things Done (GTD) 5-Step Workflow</span>
      </h4>
      <div className="space-y-1.5 text-xs">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 flex items-start gap-2.5"
          >
            <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
              {idx + 1}
            </span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{s.name}: </span>
              <span className="text-slate-500">{s.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. OKR TRACKER BLOCK
export const OKRBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  const data = block.interactiveData || {
    objective: 'Launch OmniNotes v2.0 Production Experience',
    keyResults: [
      { id: 'kr1', text: 'Achieve 100% test pass on Life OS Suite', progress: 100 },
      { id: 'kr2', text: 'Sub-50ms editor keystroke responsiveness', progress: 95 },
      { id: 'kr3', text: 'Zero data sync conflicts on Google Drive', progress: 90 }
    ]
  };

  return (
    <div className="my-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
        <span>🎯</span>
        <span>Objective & Key Results (OKR)</span>
      </h4>
      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
        Objective: {data.objective}
      </div>
      <div className="space-y-2">
        {data.keyResults.map((kr: any) => (
          <div key={kr.id} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>{kr.text}</span>
              <span className="font-mono font-semibold">{kr.progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${kr.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ZERO-BASED BUDGET & KAKEIBO LEDGER BLOCK
export const BudgetBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  return (
    <div className="my-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
        <span>💰</span>
        <span>Kakeibo & Zero-Based Budget Ledger</span>
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-slate-400 uppercase block">Needs (Survival)</span>
          <span className="text-sm font-bold text-emerald-600">50%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-slate-400 uppercase block">Wants (Comfort)</span>
          <span className="text-sm font-bold text-blue-600">30%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-slate-400 uppercase block">Savings / Invest</span>
          <span className="text-sm font-bold text-purple-600">20%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-slate-400 uppercase block">Reflection</span>
          <span className="text-xs text-slate-500">Mindful spending</span>
        </div>
      </div>
    </div>
  );
};

// 5. MOOD, SLEEP & RECOVERY TRACKER BLOCK
export const MoodTrackerBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  const [selectedMood, setSelectedMood] = useState('⚡ Energetic');

  const moods = ['⚡ Energetic', '🧘 Calm & Focused', '☕ Moderate', '😴 Fatigued', '🤯 Overwhelmed'];

  return (
    <div className="my-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
        <span>🌱</span>
        <span>Daily Mood, Sleep & Readiness Log</span>
      </h4>
      <div className="flex items-center gap-2 flex-wrap">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMood(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedMood === m
                ? 'bg-amber-500 text-white shadow-sm font-semibold'
                : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-black/5'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

// 6. SIX THINKING HATS BLOCK
export const SixHatsBlock: React.FC<SlashBlockProps> = ({ block, onUpdate }) => {
  const hats = [
    { color: 'White', role: 'Facts & Data', icon: '⚪' },
    { color: 'Red', role: 'Feelings & Intuition', icon: '🔴' },
    { color: 'Black', role: 'Caution & Risk', icon: '⚫' },
    { color: 'Yellow', role: 'Optimism & Benefits', icon: '🟡' },
    { color: 'Green', role: 'Creativity & Alternatives', icon: '🟢' },
    { color: 'Blue', role: 'Control & Next Steps', icon: '🔵' }
  ];

  return (
    <div className="my-3 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-900/60 shadow-sm space-y-2.5">
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <span>🎩</span>
        <span>Edward de Bono's Six Thinking Hats</span>
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {hats.map((h) => (
          <div
            key={h.color}
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 space-y-0.5"
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <span>{h.icon}</span>
              <span>{h.color} Hat</span>
            </div>
            <p className="text-[11px] text-slate-400">{h.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
