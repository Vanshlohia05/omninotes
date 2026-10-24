import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  FolderPlus,
  Pin,
  CheckSquare,
  Clock,
  Archive,
  Trash2,
  Tag as TagIcon,
  Settings,
  Bot,
  Cloud,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  X,
  BookOpen,
  Sparkles,
  Plus,
  Layers,
  FileText,
  CheckCircle2,
  Flame,
  Book,
  Users,
  Target
} from 'lucide-react';
import { NoteItem, Folder } from '../../types/note';
import { Notebook, ONENOTE_BINDER_COLORS, ONENOTE_TAB_COLORS } from '../../types/notebook';
import { JournalBook } from '../../types/lifeos';

export type AppViewMode = 'notes' | 'notebooks' | 'todo' | 'habits' | 'journal' | 'para' | 'crm';

interface SidebarProps {
  notes: NoteItem[];
  folders: Folder[];
  notebooks?: Notebook[];
  sidebarMode: 'notes' | 'notebooks';
  onSidebarModeChange: (mode: 'notes' | 'notebooks') => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  currentView?: AppViewMode;
  onSelectView?: (view: AppViewMode) => void;
  habitsCount?: number;
  tasksCount?: number;
  journals?: JournalBook[];
  activeJournalId?: string | null;
  onSelectJournal?: (id: string) => void;
  onCreateJournal?: (title: string, color: string) => void;
  paraCount?: number;
  crmCount?: number;
  activeNotebookId?: string | null;
  onSelectNotebook?: (id: string) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateNotebook?: (name: string, color: string) => void;
  onDeleteNotebook?: (id: string) => void;
  onCreateUnit?: (notebookId: string, name: string) => void;
  onCreateChapter?: (notebookId: string, unitId: string, name: string, color: string) => void;
  onSelectChapter?: (notebookId: string, chapterId: string) => void;
  onOpenSettings: () => void;
  onOpenMCPModal: () => void;
  onOpenAPIExplorer?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isDriveConnected: boolean;
  onCloseMobile?: () => void;
}

const FOLDER_COLORS = ['#E5A93C', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#64748B'];

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  folders,
  notebooks = [],
  sidebarMode,
  onSidebarModeChange,
  selectedFilter,
  onSelectFilter,
  currentView = 'notes',
  onSelectView,
  habitsCount = 0,
  tasksCount = 0,
  journals = [],
  activeJournalId = null,
  onSelectJournal,
  onCreateJournal,
  paraCount = 0,
  crmCount = 0,
  activeNotebookId,
  onSelectNotebook,
  onCreateFolder,
  onDeleteFolder,
  onCreateNotebook,
  onDeleteNotebook,
  onCreateUnit,
  onCreateChapter,
  onSelectChapter,
  onOpenSettings,
  onOpenMCPModal,
  onOpenAPIExplorer,
  isDarkMode,
  onToggleDarkMode,
  isDriveConnected,
  onCloseMobile
}) => {
  const [isJournalsExpanded, setIsJournalsExpanded] = useState(true);
  const [isCreatingJournal, setIsCreatingJournal] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalColor, setNewJournalColor] = useState('#D97706');

  // Folder creation
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderColor, setSelectedFolderColor] = useState(FOLDER_COLORS[0]);

  // Notebook creation
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [selectedNotebookColor, setSelectedNotebookColor] = useState(ONENOTE_BINDER_COLORS[0].hex);

  // Unit creation modal in sidebar
  const [addingUnitForNotebookId, setAddingUnitForNotebookId] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState('');

  // Chapter creation modal in sidebar
  const [addingChapterForUnit, setAddingChapterForUnit] = useState<{ nbId: string; unitId: string } | null>(null);
  const [newChapterName, setNewChapterName] = useState('');

  // Expanded notebooks set
  const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string, boolean>>({
    'nb-cs': true
  });

  const toggleNotebookExpand = (id: string) => {
    setExpandedNotebooks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Counts
  const activeNotes = notes.filter((n) => !n.isDeleted);
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
  const checklistCount = activeNotes.filter((n) => n.blocks.some((b) => b.type === 'task')).length;
  const reminderCount = activeNotes.filter((n) => n.reminder).length;
  const archiveCount = activeNotes.filter((n) => n.isArchived).length;
  const trashCount = notes.filter((n) => n.isDeleted).length;

  // Gather unique tags
  const allTagsMap: { [tag: string]: number } = {};
  for (const n of activeNotes) {
    for (const t of n.tags) {
      allTagsMap[t] = (allTagsMap[t] || 0) + 1;
    }
  }
  const tagsList = Object.entries(allTagsMap);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), selectedFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreateNotebook = () => {
    if (!newNotebookName.trim() || !onCreateNotebook) return;
    onCreateNotebook(newNotebookName.trim(), selectedNotebookColor);
    setNewNotebookName('');
    setIsCreatingNotebook(false);
  };

  const handleCreateUnit = (nbId: string) => {
    if (!newUnitName.trim() || !onCreateUnit) return;
    onCreateUnit(nbId, newUnitName.trim());
    setNewUnitName('');
    setAddingUnitForNotebookId(null);
  };

  const handleCreateChapter = (nbId: string, unitId: string) => {
    if (!newChapterName.trim() || !onCreateChapter) return;
    const defaultColor = ONENOTE_TAB_COLORS[0].hex;
    onCreateChapter(nbId, unitId, newChapterName.trim(), defaultColor);
    setNewChapterName('');
    setAddingChapterForUnit(null);
  };

  return (
    <div className="w-full md:w-64 h-full flex flex-col bg-[#F6F6F6] dark:bg-[#1E1E1E] border-r border-black/10 dark:border-white/10 select-none text-slate-700 dark:text-slate-200">
      {/* App Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white shadow-sm text-sm">
            📝
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">OmniNotes</h1>
            <p className="text-[10px] text-slate-400 font-medium">Apple • Notion • OneNote</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Top Toggle: Notes (Apple Notes) vs Notebooks (Microsoft OneNote) */}
      <div className="px-3 pt-2.5 pb-1 shrink-0">
        <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => onSidebarModeChange('notes')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              sidebarMode === 'notes'
                ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-sm">📝</span>
            <span>Notes</span>
          </button>
          <button
            onClick={() => onSidebarModeChange('notebooks')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              sidebarMode === 'notebooks'
                ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-sm">📓</span>
            <span>Notebooks</span>
          </button>
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin text-xs">
        {sidebarMode === 'notes' ? (
          /* ================= APPLE NOTES MODE ================= */
          <>
            {/* Smart Filters (Apple Notes Quick Links) */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectFilter('all');
                  onSelectView?.('notes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedFilter === 'all' && currentView === 'notes'
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">📁</span>
                  <span>All Notes</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{activeNotes.length}</span>
              </button>

              <button
                onClick={() => {
                  onSelectFilter('pinned');
                  onSelectView?.('notes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedFilter === 'pinned' && currentView === 'notes'
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>Pinned</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{pinnedCount}</span>
              </button>

              {/* To-Do List Hub (Frameworks) */}
              <button
                onClick={() => {
                  onSelectView?.('todo');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentView === 'todo'
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>To-Do Hub</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                  {tasksCount}
                </span>
              </button>

              {/* Habit Tracker (directly below To-Do list as requested) */}
              <button
                onClick={() => {
                  onSelectView?.('habits');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentView === 'habits'
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
                  <span>Habit Tracker</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                  {habitsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectFilter('reminders');
                  onSelectView?.('notes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedFilter === 'reminders' && currentView === 'notes'
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span>Reminders</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{reminderCount}</span>
              </button>

              <button
                onClick={() => {
                  onSelectFilter('archive');
                  onSelectView?.('notes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedFilter === 'archive' && currentView === 'notes'
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Archive</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{archiveCount}</span>
              </button>

              <button
                onClick={() => {
                  onSelectFilter('trash');
                  onSelectView?.('notes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedFilter === 'trash' && currentView === 'notes'
                    ? 'bg-red-100/80 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Recently Deleted</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{trashCount}</span>
              </button>
            </div>

            {/* Journals Section */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <button
                  onClick={() => setIsJournalsExpanded(!isJournalsExpanded)}
                  className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition"
                >
                  {isJournalsExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <span>Journals</span>
                </button>
                <button
                  onClick={() => setIsCreatingJournal(true)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  title="New Journal"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isCreatingJournal && (
                <div className="p-2 mb-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-black/10 dark:border-white/10 space-y-2">
                  <input
                    type="text"
                    value={newJournalTitle}
                    onChange={(e) => setNewJournalTitle(e.target.value)}
                    placeholder="Journal title..."
                    autoFocus
                    className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-neutral-900 rounded border border-black/10 dark:border-white/10 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newJournalTitle.trim()) {
                        onCreateJournal?.(newJournalTitle.trim(), newJournalColor);
                        setNewJournalTitle('');
                        setIsCreatingJournal(false);
                      }
                      if (e.key === 'Escape') setIsCreatingJournal(false);
                    }}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setIsCreatingJournal(false)}
                      className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (newJournalTitle.trim()) {
                          onCreateJournal?.(newJournalTitle.trim(), newJournalColor);
                          setNewJournalTitle('');
                          setIsCreatingJournal(false);
                        }
                      }}
                      className="px-2 py-0.5 text-[10px] bg-amber-600 text-white rounded font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {isJournalsExpanded && (
                <div className="space-y-0.5">
                  {journals.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => {
                        onSelectJournal?.(j.id);
                        onSelectView?.('journal');
                        onCloseMobile?.();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                        currentView === 'journal' && activeJournalId === j.id
                          ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: j.coverColor || '#D97706' }}
                        />
                        <span className="truncate">{j.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {j.pages?.length || 0}p
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Second Brain (PARA Method) */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectView?.('para');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentView === 'para'
                    ? 'bg-purple-100/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>PARA Vault</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                  {paraCount}
                </span>
              </button>
            </div>

            {/* Personal CRM */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onSelectView?.('crm');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
                  currentView === 'crm'
                    ? 'bg-rose-100/80 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>Personal CRM</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono">
                  {crmCount}
                </span>
              </button>
            </div>

            {/* Folders Section */}
            <div>
              <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Folders</span>
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  title="New Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Folder Creation Form */}
              {isCreatingFolder && (
                <div className="p-2 mb-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-black/10 dark:border-white/10 space-y-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    autoFocus
                    className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-neutral-900 rounded border border-black/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') setIsCreatingFolder(false);
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {FOLDER_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedFolderColor(color)}
                          className={`w-3.5 h-3.5 rounded-full transition ${
                            selectedFolderColor === color ? 'ring-2 ring-offset-1 ring-amber-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsCreatingFolder(false)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCreateFolder}
                        className="px-2 py-0.5 rounded bg-amber-500 text-white font-medium text-[11px]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Folders List */}
              <div className="space-y-0.5">
                {folders.map((folder) => {
                  const isSelected = selectedFilter === `folder:${folder.id}`;
                  const count = notes.filter((n) => n.folderId === folder.id && !n.isDeleted).length;

                  return (
                    <div
                      key={folder.id}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                        isSelected
                          ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <button
                        onClick={() => onSelectFilter(`folder:${folder.id}`)}
                        className="flex-1 flex items-center gap-2 truncate text-left"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-mono group-hover:hidden">
                          {count}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete folder "${folder.name}"? Notes inside will stay in All Notes.`)) {
                              onDeleteFolder(folder.id);
                            }
                          }}
                          className="hidden group-hover:flex p-0.5 rounded hover:text-red-500 transition"
                          title="Delete folder"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags Section */}
            {tagsList.length > 0 && (
              <div>
                <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  {tagsList.map(([tag, count]) => {
                    const isSelected = selectedFilter === `tag:${tag}`;
                    return (
                      <button
                        key={tag}
                        onClick={() => onSelectFilter(isSelected ? 'all' : `tag:${tag}`)}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition ${
                          isSelected
                            ? 'bg-amber-500 text-white font-medium shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>#{tag}</span>
                        <span className="text-[9px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ================= MICROSOFT ONENOTE BINDER MODE ================= */
          <div className="space-y-3">
            {/* Header + Add Notebook */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Notebooks Binder
              </span>
              <button
                onClick={() => setIsCreatingNotebook(true)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 px-2 py-1 rounded-lg transition"
                title="Create New OneNote Notebook"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Inline Notebook Creation Form */}
            {isCreatingNotebook && (
              <div className="p-2.5 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-purple-300 dark:border-purple-800/50 space-y-2">
                <input
                  type="text"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="Notebook binder name..."
                  autoFocus
                  className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {ONENOTE_BINDER_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedNotebookColor(c.hex)}
                        className={`w-3.5 h-3.5 rounded-full transition ${
                          selectedNotebookColor === c.hex ? 'ring-2 ring-purple-600 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsCreatingNotebook(false)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCreateNotebook}
                      className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white font-medium text-[11px]"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notebooks Hierarchy List */}
            <div className="space-y-2">
              {notebooks.map((nb) => {
                const isSelected = nb.id === activeNotebookId;
                const isExpanded = expandedNotebooks[nb.id] !== false;

                return (
                  <div
                    key={nb.id}
                    className="rounded-xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-neutral-800/40 overflow-hidden"
                  >
                    {/* Notebook Header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (onSelectNotebook) onSelectNotebook(nb.id);
                        toggleNotebookExpand(nb.id);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-2 cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-100/70 dark:bg-purple-950/40 border-l-4'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={{ borderLeftColor: isSelected ? nb.color : undefined }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3.5 rounded-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: nb.color }}
                        />
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {nb.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {onDeleteNotebook && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete notebook "${nb.name}"?`)) {
                                onDeleteNotebook(nb.id);
                              }
                            }}
                            className="hidden group-hover:flex p-0.5 hover:text-red-500 text-slate-400"
                            title="Delete Notebook"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Units & Chapters Accordion */}
                    {isExpanded && (
                      <div className="px-2 py-1.5 space-y-2 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-neutral-900/30">
                        {nb.units.map((unit) => (
                          <div key={unit.id} className="space-y-1">
                            {/* Unit Label */}
                            <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <span className="truncate">{unit.name}</span>
                              <button
                                onClick={() => setAddingChapterForUnit({ nbId: nb.id, unitId: unit.id })}
                                className="text-[10px] text-purple-600 hover:underline"
                                title="Add Chapter to this unit"
                              >
                                + Chapter
                              </button>
                            </div>

                            {/* Inline Chapter Add */}
                            {addingChapterForUnit?.nbId === nb.id && addingChapterForUnit?.unitId === unit.id && (
                              <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-800 rounded border border-purple-300">
                                <input
                                  type="text"
                                  placeholder="Chapter name..."
                                  autoFocus
                                  value={newChapterName}
                                  onChange={(e) => setNewChapterName(e.target.value)}
                                  className="px-1 text-xs bg-transparent focus:outline-none flex-1"
                                />
                                <button
                                  onClick={() => handleCreateChapter(nb.id, unit.id)}
                                  className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-medium"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setAddingChapterForUnit(null)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Chapters inside Unit */}
                            <div className="space-y-0.5 pl-1.5">
                              {unit.chapters.map((chap) => (
                                <button
                                  key={chap.id}
                                  onClick={() => {
                                    if (onSelectNotebook) onSelectNotebook(nb.id);
                                    if (onSelectChapter) onSelectChapter(nb.id, chap.id);
                                  }}
                                  className="w-full flex items-center justify-between px-2 py-1 rounded-md text-xs hover:bg-black/5 dark:hover:bg-white/5 transition text-left"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: chap.color }}
                                    />
                                    <span className="truncate">{chap.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {chap.pageIds.length}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Add Unit Button */}
                        {addingUnitForNotebookId === nb.id ? (
                          <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-800 rounded border border-purple-300">
                            <input
                              type="text"
                              placeholder="New Unit name..."
                              autoFocus
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              className="px-1 text-xs bg-transparent focus:outline-none flex-1"
                            />
                            <button
                              onClick={() => handleCreateUnit(nb.id)}
                              className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-medium"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setAddingUnitForNotebookId(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingUnitForNotebookId(nb.id)}
                            className="w-full flex items-center justify-center gap-1 py-1 text-[11px] font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Unit</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Google Drive Sync Status, AI API, MCP & Settings */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-1.5 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
        {/* Google Drive Status */}
        <div
          onClick={onOpenSettings}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition text-xs"
        >
          <div className="flex items-center gap-2">
            <Cloud className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span className="text-[11px] font-medium">
              {isDriveConnected ? 'Google Drive Synced' : 'Drive: Local Only'}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* AI API Explorer, MCP & Settings */}
        <div className="flex items-center gap-1 pt-1">
          {onOpenAPIExplorer && (
            <button
              onClick={onOpenAPIExplorer}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition shadow-xs"
              title="Open OpenAPI & AI Custom Action Explorer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI API</span>
            </button>
          )}

          <button
            onClick={onOpenMCPModal}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            title="Open Model Context Protocol Inspector"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>MCP</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="Settings & Cloud Vault"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
