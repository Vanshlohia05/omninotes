import React, { useState } from 'react';
import {
  Layers,
  Target,
  Plus,
  ChevronLeft,
  Pin,
  Clock,
  Tag,
  Archive,
  Folder,
  BookOpen,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ParaItem, ParaType } from '../../types/lifeos';
import { NoteItem } from '../../types/note';

interface ParaVaultViewProps {
  items: ParaItem[];
  allNotes: NoteItem[];
  activeFilter?: 'all' | ParaType;
  onSelectItem: (item: ParaItem) => void;
  onSaveItem: (item: ParaItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenNote?: (noteId: string) => void;
  onBackToNotes?: () => void;
  onOpenSidebar?: () => void;
}

const PARA_CATEGORIES: { type: ParaType; label: string; icon: string; desc: string; color: string }[] = [
  {
    type: 'project',
    label: 'Projects',
    icon: '🎯',
    desc: 'Series of tasks linked to a goal, with a clear deadline.',
    color: '#3B82F6'
  },
  {
    type: 'area',
    label: 'Areas',
    icon: '🌿',
    desc: 'Sphere of activity with a standard to be maintained over time.',
    color: '#10B981'
  },
  {
    type: 'resource',
    label: 'Resources',
    icon: '📚',
    desc: 'Topic or theme of ongoing interest, reference material.',
    color: '#8B5CF6'
  },
  {
    type: 'archive',
    label: 'Archives',
    icon: '📦',
    desc: 'Inactive items from the other three categories.',
    color: '#64748B'
  }
];

export const ParaVaultView: React.FC<ParaVaultViewProps> = ({
  items,
  allNotes,
  activeFilter = 'all',
  onSelectItem,
  onSaveItem,
  onDeleteItem,
  onOpenNote,
  onBackToNotes,
  onOpenSidebar
}) => {
  const [currentFilter, setCurrentFilter] = useState<'all' | ParaType>(activeFilter);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<ParaType>('project');
  const [newDeadline, setNewDeadline] = useState('');

  const filteredItems = items.filter((item) => {
    if (currentFilter === 'all') return true;
    return item.type === currentFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ParaItem = {
      id: `para-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      deadline: newDeadline || undefined,
      status: 'active',
      tags: [],
      noteIds: [],
      color: PARA_CATEGORIES.find((c) => c.type === newType)?.color || '#3B82F6',
      icon: PARA_CATEGORIES.find((c) => c.type === newType)?.icon || '🎯',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveItem(newItem);
    setNewTitle('');
    setNewDesc('');
    setNewDeadline('');
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
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Second Brain (PARA Vault)
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                {items.length} Elements
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Organize all digital knowledge by actionability: Projects, Areas, Resources & Archives
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New PARA Item</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-neutral-900/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 text-xs shrink-0">
        <button
          onClick={() => setCurrentFilter('all')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition ${
            currentFilter === 'all'
              ? 'bg-purple-600 text-white shadow-sm font-semibold'
              : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          All Items ({items.length})
        </button>
        {PARA_CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.type === cat.type).length;
          const isActive = currentFilter === cat.type;
          return (
            <button
              key={cat.type}
              onClick={() => setCurrentFilter(cat.type)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm font-semibold'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {/* Creation Card */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 rounded-2xl border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Create PARA Element
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
                placeholder="Title (e.g. Q4 Product Launch)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ParaType)}
                className="px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="project">🎯 Project</option>
                <option value="area">🌿 Area</option>
                <option value="resource">📚 Resource</option>
                <option value="archive">📦 Archive</option>
              </select>
            </div>
            <textarea
              placeholder="Description & purpose..."
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              {newType === 'project' && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Deadline:</span>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-xs"
                  />
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Save Element
                </button>
              </div>
            </div>
          </form>
        )}

        {/* PARA Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const cat = PARA_CATEGORIES.find((c) => c.type === item.type);
            const attachedNotes = allNotes.filter((n) => item.noteIds?.includes(n.id));

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800/80 shadow-sm flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat?.icon || '📁'}</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${cat?.color || '#3B82F6'}15`,
                          color: cat?.color || '#3B82F6'
                        }}
                      >
                        {cat?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-slate-300 group-hover:text-red-500 transition p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.deadline && (
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>Due: {item.deadline}</span>
                    </div>
                  )}
                </div>

                {/* Attached Notes Link */}
                {attachedNotes.length > 0 && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Linked Notes ({attachedNotes.length})
                    </span>
                    {attachedNotes.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => onOpenNote?.(n.id)}
                        className="w-full flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-purple-600 truncate text-left"
                      >
                        <span>📝</span>
                        <span className="truncate">{n.title || 'Untitled Note'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
