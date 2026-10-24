import React, { useState, useMemo } from 'react';
import {
  Book,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  History,
  Grid,
  AlignJustify,
  FileText,
  Sparkles,
  Columns,
  List,
  Edit3,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  Palette
} from 'lucide-react';
import { JournalBook, JournalPage, PaperRuling, JournalViewMode } from '../../types/lifeos';
import { BlockEditor } from '../editor/BlockEditor';
import { InfiniteCanvas } from '../canvas/InfiniteCanvas';
import { NoteItem, BlockItem as BlockItemType } from '../../types/note';

interface JournalViewProps {
  journal: JournalBook;
  allJournals: JournalBook[];
  onSelectJournal: (id: string) => void;
  onUpdateJournal: (updated: JournalBook) => void;
  onBackToNotes?: () => void;
  onOpenSidebar?: () => void;
}

const TEMPLATES: { name: string; icon: string; title: string; blocks: BlockItemType[] }[] = [
  {
    name: 'Gratitude Log',
    icon: '🙏',
    title: 'Daily Gratitude Log',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Three Things I Am Grateful For' },
      { id: 'b-2', type: 'bullet', content: '1. ' },
      { id: 'b-3', type: 'bullet', content: '2. ' },
      { id: 'b-4', type: 'bullet', content: '3. ' },
      { id: 'b-5', type: 'h3', content: 'What Made Today Great?' },
      { id: 'b-6', type: 'paragraph', content: '' }
    ]
  },
  {
    name: 'Bullet Journal (BuJo)',
    icon: '🎯',
    title: 'Daily Rapid Log (BuJo)',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Daily Log & Priorities' },
      { id: 'b-2', type: 'task', content: 'Top urgent task', checked: false },
      { id: 'b-3', type: 'task', content: 'Secondary milestone', checked: false },
      { id: 'b-4', type: 'bullet', content: 'Event / Meeting note' },
      { id: 'b-5', type: 'paragraph', content: '- Rapid observation or insight' }
    ]
  },
  {
    name: 'Shadow Work',
    icon: '🌒',
    title: 'Shadow Work & Introspection',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Trigger & Emotional Inquest' },
      { id: 'b-2', type: 'quote', content: '"What is triggering me right now, and what old belief does this touch?"' },
      { id: 'b-3', type: 'paragraph', content: 'Describe the trigger neutrally...' },
      { id: 'b-4', type: 'h3', content: 'Underlying Need / Realization' },
      { id: 'b-5', type: 'paragraph', content: '' }
    ]
  },
  {
    name: 'Decision Journal',
    icon: '⚖️',
    title: 'Decision Record & Reasoning',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Decision Context & Options' },
      { id: 'b-2', type: 'paragraph', content: 'What choice is being made and why now?' },
      { id: 'b-3', type: 'h3', content: 'Expected Outcome in 6 Months' },
      { id: 'b-4', type: 'paragraph', content: '' },
      { id: 'b-5', type: 'h3', content: 'Worst Case & Mitigation' },
      { id: 'b-6', type: 'paragraph', content: '' }
    ]
  },
  {
    name: 'WOOP Method',
    icon: '🌟',
    title: 'WOOP: Wish, Outcome, Obstacle, Plan',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Wish (Goal)' },
      { id: 'b-2', type: 'paragraph', content: '' },
      { id: 'b-3', type: 'h2', content: 'Outcome (Best Result)' },
      { id: 'b-4', type: 'paragraph', content: '' },
      { id: 'b-5', type: 'h2', content: 'Obstacle (Internal Friction)' },
      { id: 'b-6', type: 'paragraph', content: '' },
      { id: 'b-7', type: 'h2', content: 'Plan (If Obstacle, Then Action)' },
      { id: 'b-8', type: 'paragraph', content: 'If [Obstacle], then I will [Action].' }
    ]
  },
  {
    name: 'Ikigai Mapping',
    icon: '🌸',
    title: 'Ikigai: Reason for Being',
    blocks: [
      { id: 'b-1', type: 'h2', content: '1. What You Love (Passion)' },
      { id: 'b-2', type: 'bullet', content: '' },
      { id: 'b-3', type: 'h2', content: '2. What You Are Good At (Profession)' },
      { id: 'b-4', type: 'bullet', content: '' },
      { id: 'b-5', type: 'h2', content: '3. What The World Needs (Mission)' },
      { id: 'b-6', type: 'bullet', content: '' },
      { id: 'b-7', type: 'h2', content: '4. What You Can Be Paid For (Vocation)' },
      { id: 'b-8', type: 'bullet', content: '' }
    ]
  },
  {
    name: '75 Hard / Sprint Challenge',
    icon: '💪',
    title: 'Sprint Challenge Daily Checklist',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Daily Non-Negotiables' },
      { id: 'b-2', type: 'task', content: '45-min workout', checked: false },
      { id: 'b-3', type: 'task', content: 'Drink 1 gallon of water', checked: false },
      { id: 'b-4', type: 'task', content: 'Read 10 pages of non-fiction', checked: false },
      { id: 'b-5', type: 'task', content: 'Strict nutrition / zero cheat meal', checked: false },
      { id: 'b-6', type: 'task', content: 'Progress photo / daily accountability', checked: false }
    ]
  },
  {
    name: 'Warren Buffett 5/25 Rule',
    icon: '🎯',
    title: 'Warren Buffett 5/25 Rule',
    blocks: [
      { id: 'b-1', type: 'h2', content: 'Top 5 Focus Goals (Pursue Aggressively)' },
      { id: 'b-2', type: 'number', content: '1. ' },
      { id: 'b-3', type: 'number', content: '2. ' },
      { id: 'b-4', type: 'number', content: '3. ' },
      { id: 'b-5', type: 'number', content: '4. ' },
      { id: 'b-6', type: 'number', content: '5. ' },
      { id: 'b-7', type: 'h2', content: 'The 20 "Avoid at All Costs" Distractions' },
      { id: 'b-8', type: 'bullet', content: 'List remaining 20 goals here to consciously avoid...' }
    ]
  }
];

export const JournalView: React.FC<JournalViewProps> = ({
  journal,
  allJournals,
  onSelectJournal,
  onUpdateJournal,
  onBackToNotes,
  onOpenSidebar
}) => {
  const [activePageIndex, setActivePageIndex] = useState(
    Math.max(0, (journal.activePageNumber || 1) - 1)
  );
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const pages = journal.pages || [];
  const currentPage = pages[activePageIndex] || pages[0];

  // Auto-generate Page 1 Table of Contents
  const tableOfContentsItems = useMemo(() => {
    return pages.slice(1).map((p, idx) => ({
      pageIndex: idx + 1,
      pageNumber: p.pageNumber || idx + 2,
      title: p.title || `Entry ${idx + 2}`,
      date: p.date,
      preview: p.blocks?.[0]?.content?.slice(0, 60) || 'No content yet...'
    }));
  }, [pages]);

  const handlePageSelect = (pageIndex: number) => {
    setActivePageIndex(pageIndex);
    onUpdateJournal({
      ...journal,
      activePageNumber: pageIndex + 1,
      updatedAt: Date.now()
    });
  };

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      handlePageSelect(activePageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      handlePageSelect(activePageIndex - 1);
    }
  };

  const handleAddNewPage = (templateBlocks?: BlockItemType[], templateTitle?: string) => {
    const nextNum = pages.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newPage: JournalPage = {
      id: `jpage-${Date.now()}`,
      journalId: journal.id,
      pageNumber: nextNum,
      title: templateTitle || `Journal Entry ${nextNum}`,
      date: today,
      paperRuling: journal.defaultRuling || 'ruled',
      blocks: templateBlocks || [
        { id: `b-${Date.now()}-1`, type: 'h2', content: templateTitle || `Entry ${nextNum}` },
        { id: `b-${Date.now()}-2`, type: 'paragraph', content: '' }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedPages = [...pages, newPage];
    onUpdateJournal({
      ...journal,
      pages: updatedPages,
      activePageNumber: nextNum,
      updatedAt: Date.now()
    });
    setActivePageIndex(updatedPages.length - 1);
    setIsTemplateMenuOpen(false);
  };

  const handleUpdateCurrentPage = (updatedBlocks: BlockItemType[]) => {
    if (!currentPage) return;
    const updatedPage: JournalPage = {
      ...currentPage,
      blocks: updatedBlocks,
      updatedAt: Date.now()
    };

    const updatedPages = [...pages];
    updatedPages[activePageIndex] = updatedPage;

    // Record history snapshot
    const historyItem = {
      timestamp: Date.now(),
      pageNumber: currentPage.pageNumber,
      title: currentPage.title,
      preview: updatedBlocks[0]?.content?.slice(0, 50) || ''
    };

    const updatedHistory = [historyItem, ...(journal.history || []).slice(0, 20)];

    onUpdateJournal({
      ...journal,
      pages: updatedPages,
      history: updatedHistory,
      updatedAt: Date.now()
    });
  };

  const handleToggleRuling = (ruling: PaperRuling) => {
    if (!currentPage) return;
    const updatedPage: JournalPage = {
      ...currentPage,
      paperRuling: ruling,
      updatedAt: Date.now()
    };
    const updatedPages = [...pages];
    updatedPages[activePageIndex] = updatedPage;
    onUpdateJournal({
      ...journal,
      pages: updatedPages,
      defaultRuling: ruling,
      updatedAt: Date.now()
    });
  };

  const handleSwitchViewMode = (mode: JournalViewMode) => {
    onUpdateJournal({
      ...journal,
      viewMode: mode,
      updatedAt: Date.now()
    });
  };

  // Turn currentPage into mock NoteItem for BlockEditor reuse
  const currentNoteAdapter: NoteItem = useMemo(() => {
    return {
      id: currentPage?.id || 'empty-page',
      title: currentPage?.title || 'Journal Page',
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      tags: [],
      fontFamily: 'serif',
      fontSize: 16,
      viewMode: 'document',
      blocks: currentPage?.blocks || [],
      canvasElements: currentPage?.canvasElements || [],
      createdAt: currentPage?.createdAt || Date.now(),
      updatedAt: currentPage?.updatedAt || Date.now()
    };
  }, [currentPage]);

  // Paper styling class
  const paperClass =
    currentPage?.paperRuling === 'ruled'
      ? 'bg-lined-paper'
      : currentPage?.paperRuling === 'grid'
      ? 'bg-grid-paper'
      : 'bg-white dark:bg-[#1E1E1E]';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F4F6] dark:bg-[#121212] min-w-0">
      {/* Top Action Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur shrink-0 z-20">
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

          {/* Book Color Badge & Title */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: journal.coverColor || '#D97706' }}
            >
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={journal.id}
                  onChange={(e) => onSelectJournal(e.target.value)}
                  className="text-xs sm:text-sm font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  {allJournals.map((j) => (
                    <option key={j.id} value={j.id} className="bg-white dark:bg-neutral-800">
                      {j.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Page {activePageIndex + 1} of {pages.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {journal.category} • Last edited{' '}
                {new Date(journal.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ruling Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => handleToggleRuling('plain')}
              className={`p-1.5 rounded transition ${
                currentPage?.paperRuling === 'plain'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Plain White Paper"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleRuling('ruled')}
              className={`p-1.5 rounded transition ${
                currentPage?.paperRuling === 'ruled'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="1-Line Ruled Paper"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleRuling('grid')}
              className={`p-1.5 rounded transition ${
                currentPage?.paperRuling === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Square Grid Paper"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Switcher: Book vs Continuous Scroll vs Canvas */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => handleSwitchViewMode('book')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                journal.viewMode === 'book'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Realistic Book View"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Book</span>
            </button>
            <button
              onClick={() => handleSwitchViewMode('scroll')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                journal.viewMode === 'scroll'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Continuous Vertical Scroll"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Scroll</span>
            </button>
            <button
              onClick={() => handleSwitchViewMode('canvas')}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                journal.viewMode === 'canvas'
                  ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Canvas Spread"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Canvas</span>
            </button>
          </div>

          {/* History Log Button */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 rounded-lg border transition ${
              isHistoryOpen
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-500'
            }`}
            title="Edit History & Timeline"
          >
            <History className="w-4 h-4" />
          </button>

          {/* New Page / Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Page</span>
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl border border-black/10 dark:border-white/10 p-2 z-50 text-xs space-y-1">
                <button
                  onClick={() => handleAddNewPage()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 text-left font-medium"
                >
                  <span>📄</span>
                  <span>Blank Page</span>
                </button>
                <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Framework Templates
                </div>
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleAddNewPage(tmpl.blocks, tmpl.title)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-left transition"
                  >
                    <span>{tmpl.icon}</span>
                    <span className="truncate">{tmpl.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Journal Workspace */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Side Slide-out TOC & History Drawer */}
        {isHistoryOpen && (
          <div className="w-72 bg-white dark:bg-neutral-900 border-r border-black/10 dark:border-white/10 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Edit History</span>
              </span>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs scrollbar-thin">
              {(journal.history || []).length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No edits recorded yet.</p>
              ) : (
                journal.history?.map((h, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Page {h.pageNumber}</span>
                      <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">
                      {h.title}
                    </div>
                    {h.preview && (
                      <p className="text-[11px] text-slate-400 truncate">{h.preview}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODE 1: REALISTIC BOOK SPREAD VIEW */}
        {journal.viewMode === 'book' && (
          <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
            {/* Page 1: Automated Table of Contents */}
            {activePageIndex === 0 ? (
              <div
                className={`w-full max-w-3xl min-h-[580px] rounded-2xl shadow-apple-card border border-black/10 dark:border-white/10 p-6 sm:p-10 flex flex-col justify-between ${paperClass}`}
              >
                <div>
                  <div className="border-b border-black/10 pb-4 mb-6">
                    <span className="text-xs uppercase font-mono text-amber-700 dark:text-amber-400 font-semibold tracking-wider">
                      Page 1 • Table of Contents
                    </span>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif mt-1">
                      {journal.title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      {journal.description || 'Index of all journal entries, dates, and reflections.'}
                    </p>
                  </div>

                  {/* Auto-indexed entries */}
                  <div className="space-y-2.5">
                    {tableOfContentsItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-8 text-center">
                        No pages added yet. Click "+ Add Page" in the header to create your first entry!
                      </p>
                    ) : (
                      tableOfContentsItems.map((item) => (
                        <div
                          key={item.pageIndex}
                          onClick={() => handlePageSelect(item.pageIndex)}
                          className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer group transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {item.pageNumber}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 transition truncate">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.preview}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.date}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 text-center text-[11px] text-slate-400 font-mono">
                  — Page 1 —
                </div>
              </div>
            ) : (
              /* Standard Entry Page */
              <div
                className={`w-full max-w-3xl min-h-[580px] rounded-2xl shadow-apple-card border border-black/10 dark:border-white/10 p-6 sm:p-10 flex flex-col justify-between ${paperClass}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-6">
                    <input
                      type="text"
                      value={currentPage?.title}
                      onChange={(e) => {
                        const updated = { ...currentPage, title: e.target.value };
                        const updatedPages = [...pages];
                        updatedPages[activePageIndex] = updated;
                        onUpdateJournal({ ...journal, pages: updatedPages });
                      }}
                      className="text-xl sm:text-2xl font-bold font-serif bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none flex-1"
                      placeholder="Page Title..."
                    />
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{currentPage?.date}</span>
                    </div>
                  </div>

                  <BlockEditor
                    note={currentNoteAdapter}
                    allNotes={[]}
                    onChange={handleUpdateCurrentPage}
                  />
                </div>

                <div className="pt-6 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <button
                    onClick={() => handlePageSelect(0)}
                    className="hover:text-amber-600 transition"
                  >
                    ← Table of Contents
                  </button>
                  <span>— Page {currentPage?.pageNumber} —</span>
                </div>
              </div>
            )}

            {/* Book Flip Navigation Bottom Bar */}
            <div className="mt-4 flex items-center gap-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur px-4 py-2 rounded-full shadow-apple-floating border border-black/10 dark:border-white/10">
              <button
                disabled={activePageIndex === 0}
                onClick={handlePrevPage}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:text-amber-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>
              <span className="text-xs font-mono text-slate-400">
                {activePageIndex + 1} / {pages.length}
              </span>
              <button
                disabled={activePageIndex === pages.length - 1}
                onClick={handleNextPage}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:text-amber-600 transition"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: CONTINUOUS VERTICAL SCROLL VIEW */}
        {journal.viewMode === 'scroll' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                className={`max-w-3xl mx-auto rounded-2xl shadow-apple-card border border-black/10 dark:border-white/10 p-6 sm:p-10 ${
                  p.paperRuling === 'ruled'
                    ? 'bg-lined-paper'
                    : p.paperRuling === 'grid'
                    ? 'bg-grid-paper'
                    : 'bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-6">
                  <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">
                    {p.title}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    Page {p.pageNumber} • {p.date}
                  </span>
                </div>
                <BlockEditor
                  note={{
                    id: p.id,
                    title: p.title,
                    isPinned: false,
                    isArchived: false,
                    isDeleted: false,
                    tags: [],
                    fontFamily: 'serif',
                    fontSize: 16,
                    viewMode: 'document',
                    blocks: p.blocks,
                    canvasElements: [],
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt
                  }}
                  allNotes={[]}
                  onChange={(blocks) => {
                    const updated = { ...p, blocks, updatedAt: Date.now() };
                    const updatedPages = [...pages];
                    updatedPages[idx] = updated;
                    onUpdateJournal({ ...journal, pages: updatedPages });
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* MODE 3: SPATIAL CANVAS SPREAD */}
        {journal.viewMode === 'canvas' && (
          <div className="flex-1 relative">
            <InfiniteCanvas
              note={currentNoteAdapter}
              onChange={(canvasElements) => {
                if (!currentPage) return;
                const updated = { ...currentPage, canvasElements, updatedAt: Date.now() };
                const updatedPages = [...pages];
                updatedPages[activePageIndex] = updated;
                onUpdateJournal({ ...journal, pages: updatedPages });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
