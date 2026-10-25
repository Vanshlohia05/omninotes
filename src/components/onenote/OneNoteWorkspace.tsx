import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  Layers,
  FileText,
  Palette,
  Columns,
  Grid,
  AlignJustify,
  Maximize2,
  Minimize2,
  ChevronRight,
  BookOpen,
  FolderOpen,
  Menu
} from 'lucide-react';
import { Notebook, NotebookUnit, NotebookChapter, ONENOTE_TAB_COLORS } from '../../types/notebook';
import { NoteItem, BlockItem as BlockItemType, CanvasElement } from '../../types/note';
import { BlockEditor } from '../editor/BlockEditor';
import { InfiniteCanvas } from '../canvas/InfiniteCanvas';

interface OneNoteWorkspaceProps {
  notebook: Notebook;
  allNotebooks: Notebook[];
  notes: NoteItem[];
  activeNoteId: string | null;
  activeChapterId?: string | null;
  onSelectChapter?: (notebookId: string, chapterId: string) => void;
  onSelectNote: (noteId: string) => void;
  onCreatePage: (notebookId: string, chapterId: string, title?: string) => void;
  onDeletePage: (noteId: string) => void;
  onUpdateNote: (updatedNote: NoteItem) => void;
  onSelectNotebook: (notebookId: string) => void;
  onCreateChapter: (notebookId: string, unitId: string, name: string, color: string) => void;
  onDeleteChapter: (notebookId: string, unitId: string, chapterId: string) => void;
  onCreateUnit: (notebookId: string, name: string) => void;
  onBackToNotesList?: () => void;
  onOpenSidebar?: () => void;
  onCreateSubpage?: (title: string) => string;
  onInlineTagsFound?: (tags: string[]) => void;
}

export const OneNoteWorkspace: React.FC<OneNoteWorkspaceProps> = ({
  notebook,
  allNotebooks,
  notes,
  activeNoteId,
  activeChapterId,
  onSelectChapter,
  onSelectNote,
  onCreatePage,
  onDeletePage,
  onUpdateNote,
  onSelectNotebook,
  onCreateChapter,
  onDeleteChapter,
  onCreateUnit,
  onBackToNotesList,
  onOpenSidebar,
  onCreateSubpage,
  onInlineTagsFound
}) => {
  // Active Unit selection
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    notebook.units[0]?.id || ''
  );

  // Active Chapter selection
  const activeUnit = useMemo(() => {
    return notebook.units.find((u) => u.id === selectedUnitId) || notebook.units[0] || null;
  }, [notebook, selectedUnitId]);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    activeUnit?.chapters[0]?.id || ''
  );

  // Sync selectedUnitId and selectedChapterId when notebook or activeChapterId changes
  useEffect(() => {
    if (activeChapterId) {
      for (const unit of notebook.units) {
        const found = unit.chapters.find((c) => c.id === activeChapterId);
        if (found) {
          setSelectedUnitId(unit.id);
          setSelectedChapterId(activeChapterId);
          return;
        }
      }
    }
    const unitExists = notebook.units.some((u) => u.id === selectedUnitId);
    if (!unitExists && notebook.units[0]) {
      setSelectedUnitId(notebook.units[0].id);
      setSelectedChapterId(notebook.units[0].chapters[0]?.id || '');
    }
  }, [notebook.id, notebook.units, activeChapterId]);

  // Keep selectedChapterId updated when activeUnit changes
  const activeChapter = useMemo(() => {
    if (!activeUnit) return null;
    const found = activeUnit.chapters.find((c) => c.id === selectedChapterId);
    return found || activeUnit.chapters[0] || null;
  }, [activeUnit, selectedChapterId]);

  // Mobile View state: 'list' (shows full-width pages) vs 'editor' (shows full-width page editor)
  const [mobileTab, setMobileTab] = useState<'list' | 'editor'>('list');

  // Section Modal / Inline Creation state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedTabColor, setSelectedTabColor] = useState(ONENOTE_TAB_COLORS[0].hex);

  // Unit creation state
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  // Paper Style state (OneNote rule lines / grid)
  const [paperStyle, setPaperStyle] = useState<'plain' | 'ruled' | 'grid'>('plain');
  const [paperTint, setPaperTint] = useState<'default' | 'yellow' | 'mint' | 'sky' | 'rose'>('default');

  // Page List collapsed state for full-width canvas
  const [isPageListOpen, setIsPageListOpen] = useState(true);

  // Expansive Full-Width Notebook Canvas mode (OneNote boundless typing space)
  const [isWideCanvas, setIsWideCanvas] = useState<boolean>(true);

  // Get pages belonging to active chapter
  const chapterPages = useMemo(() => {
    if (!activeChapter) return [];
    return notes.filter((n) => !n.isDeleted && (activeChapter.pageIds.includes(n.id) || n.chapterId === activeChapter.id));
  }, [notes, activeChapter]);

  // Active Note lookup - strictly scoped to pages within this chapter to avoid showing notes from other sections/modes
  const activeNote = useMemo(() => {
    if (chapterPages.length === 0) return null;
    const foundInChapter = chapterPages.find((n) => n.id === activeNoteId);
    return foundInChapter || chapterPages[0] || null;
  }, [chapterPages, activeNoteId]);

  // Ensure activeNoteId is aligned with activeNote
  useEffect(() => {
    if (activeNote && activeNote.id !== activeNoteId) {
      onSelectNote(activeNote.id);
    }
  }, [activeNote?.id, activeNoteId, onSelectNote]);

  // Handle section creation
  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !activeUnit) return;
    onCreateChapter(notebook.id, activeUnit.id, newSectionName.trim(), selectedTabColor);
    setNewSectionName('');
    setIsAddingSection(false);
  };

  // Handle unit creation
  const handleCreateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    onCreateUnit(notebook.id, newUnitName.trim());
    setNewUnitName('');
    setIsAddingUnit(false);
  };

  // Paper styling class
  const getPaperBackgroundStyle = () => {
    let bgTint = '#FFFFFF';
    if (paperTint === 'yellow') bgTint = '#FEFCE8';
    if (paperTint === 'mint') bgTint = '#F0FDF4';
    if (paperTint === 'sky') bgTint = '#F0F9FF';
    if (paperTint === 'rose') bgTint = '#FFF1F2';

    let bgImage = 'none';
    if (paperStyle === 'ruled') {
      bgImage = 'repeating-linear-gradient(transparent, transparent 27px, rgba(148, 163, 184, 0.25) 28px)';
    } else if (paperStyle === 'grid') {
      bgImage = `
        linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)
      `;
    }

    return {
      backgroundColor: bgTint,
      backgroundImage: bgImage,
      backgroundSize: paperStyle === 'grid' ? '24px 24px' : undefined
    };
  };

  const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + '  ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF9F8] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP BINDER & UNIT BAR */}
      <div className="bg-[#EDEBE9] dark:bg-[#252526] px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* Menu button for mobile to open sidebar */}
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="md:hidden p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-700 dark:text-slate-200 transition touch-manipulation"
              title="Open Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Back button for mobile to return to Apple Notes */}
          {onBackToNotesList && (
            <button
              onClick={onBackToNotesList}
              className="md:hidden p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold touch-manipulation"
            >
              ← Notes
            </button>
          )}

          {/* Mobile Pages list toggle when in editor view */}
          {mobileTab === 'editor' && (
            <button
              onClick={() => setMobileTab('list')}
              className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-xs transition touch-manipulation"
              title="Back to Pages List"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Pages</span>
            </button>
          )}

          {/* Notebook Title Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/5">
            <span
              className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-xs"
              style={{ backgroundColor: notebook.color }}
            />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-xs">
              {notebook.name}
            </span>
          </div>

          <span className="text-slate-400 font-bold">/</span>

          {/* Units Horizontal Carousel */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {notebook.units.map((unit) => {
              const isSelected = unit.id === activeUnit?.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnitId(unit.id);
                    if (unit.chapters[0]) {
                      setSelectedChapterId(unit.chapters[0].id);
                      const pages = notes.filter((n) => !n.isDeleted && (unit.chapters[0].pageIds.includes(n.id) || n.chapterId === unit.chapters[0].id));
                      if (pages[0]) onSelectNote(pages[0].id);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap touch-manipulation ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {unit.name}
                </button>
              );
            })}

            {/* + Add Unit button */}
            {!isAddingUnit ? (
              <button
                onClick={() => setIsAddingUnit(true)}
                className="px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 rounded-lg transition flex items-center gap-1 touch-manipulation"
                title="Create Unit / Section Group"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Unit</span>
              </button>
            ) : (
              <form onSubmit={handleCreateUnitSubmit} className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-0.5 rounded-lg border border-purple-400">
                <input
                  type="text"
                  autoFocus
                  placeholder="Unit name..."
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="px-2 py-0.5 text-xs bg-transparent focus:outline-none w-28"
                />
                <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsAddingUnit(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Paper styling and page list toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsPageListOpen(!isPageListOpen)}
            className={`p-1.5 rounded-lg text-xs font-medium transition touch-manipulation ${
              isPageListOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5'
            }`}
            title="Toggle Page Navigation Panel"
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SIGNATURE ONENOTE HORIZONTAL COLORED SECTION TABS */}
      <div className="bg-[#E1DFDD] dark:bg-[#1B1B1C] px-3 pt-2 border-b border-black/10 dark:border-white/10 flex items-end gap-1 overflow-x-auto scrollbar-none shrink-0">
        {activeUnit && activeUnit.chapters.length > 0 ? (
          activeUnit.chapters.map((chapter) => {
            const isSelected = chapter.id === activeChapter?.id;
            const tabColor = chapter.color || '#873999';

            return (
              <div
                key={chapter.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedChapterId(chapter.id);
                  if (onSelectChapter) onSelectChapter(notebook.id, chapter.id);
                  const pages = notes.filter((n) => !n.isDeleted && (chapter.pageIds.includes(n.id) || n.chapterId === chapter.id));
                  if (pages[0]) {
                    onSelectNote(pages[0].id);
                  }
                }}
                style={{
                  borderTopColor: tabColor,
                  borderTopWidth: isSelected ? '4px' : '3px'
                }}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold text-xs transition cursor-pointer select-none whitespace-nowrap touch-manipulation ${
                  isSelected
                    ? 'bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white shadow-sm -mb-px z-10'
                    : 'bg-[#F3F2F1] dark:bg-[#252526] text-slate-600 dark:text-slate-400 hover:bg-[#EBEAE8] dark:hover:bg-[#2A2A2B]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tabColor }}
                />
                <span>{chapter.name}</span>
                <span className="text-[10px] opacity-60 font-mono">({chapter.pageIds.length})</span>

                {/* Delete chapter button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete section "${chapter.name}"?`)) {
                      onDeleteChapter(notebook.id, activeUnit.id, chapter.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-0.5 rounded transition"
                  title="Delete Section"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-2 px-3 text-xs text-slate-500 italic">No sections in this unit</div>
        )}

        {/* "+ Section" button */}
        {!isAddingSection ? (
          <button
            onClick={() => setIsAddingSection(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-white/60 dark:hover:bg-white/10 rounded-t-lg transition whitespace-nowrap"
            title="Add Section (Chapter)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Section</span>
          </button>
        ) : (
          <div className="bg-white dark:bg-neutral-800 p-2 rounded-t-lg shadow-lg border border-purple-400 z-20 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Section Name..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="px-2 py-1 text-xs border rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {/* Color swatches */}
            <div className="flex items-center gap-1">
              {ONENOTE_TAB_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedTabColor(c.hex)}
                  className={`w-4 h-4 rounded-full transition ${
                    selectedTabColor === c.hex ? 'ring-2 ring-purple-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <button
              onClick={handleCreateSectionSubmit}
              className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingSection(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. ONENOTE RIBBON & TOOLBAR */}
      <div className="bg-[#FAF9F8] dark:bg-[#1E1E1E] px-4 py-1.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between text-xs shrink-0">
        {/* Left: View Mode Toggle (Type vs Draw vs Both) & Navigation toggles */}
        <div className="flex items-center gap-2">
          {activeNote && (
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
              <button
                onClick={() => onUpdateNote({ ...activeNote, viewMode: 'document' })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeNote.viewMode === 'document'
                    ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Type</span>
              </button>
              <button
                onClick={() => onUpdateNote({ ...activeNote, viewMode: 'canvas' })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeNote.viewMode === 'canvas'
                    ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Draw / Canvas</span>
              </button>
              <button
                onClick={() => onUpdateNote({ ...activeNote, viewMode: 'both' })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeNote.viewMode === 'both'
                    ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
            </div>
          )}

          {/* Page List toggle button for maximum typing space */}
          <button
            onClick={() => setIsPageListOpen(!isPageListOpen)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              !isPageListOpen
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isPageListOpen ? 'Collapse Page List for Full Screen Canvas' : 'Show Page List'}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isPageListOpen ? 'Hide Pages' : 'Show Pages'}</span>
          </button>
        </div>

        {/* Right: Canvas Width, Paper Rulings & Page Tint */}
        <div className="flex items-center gap-2">
          {/* Canvas Width: Full Width (Expansive OneNote) vs Centered (Standard) */}
          <button
            onClick={() => setIsWideCanvas(!isWideCanvas)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              isWideCanvas
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isWideCanvas ? 'Switch to Centered Column (Standard)' : 'Switch to Expansive Full Width (OneNote boundless)'}
          >
            {isWideCanvas ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isWideCanvas ? 'Full Width' : 'Standard'}</span>
          </button>

          {/* Paper style picker */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
            <button
              onClick={() => setPaperStyle('plain')}
              className={`p-1 rounded ${paperStyle === 'plain' ? 'bg-white dark:bg-neutral-800 shadow-xs text-purple-600' : 'text-slate-400'}`}
              title="Plain Paper"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPaperStyle('ruled')}
              className={`p-1 rounded ${paperStyle === 'ruled' ? 'bg-white dark:bg-neutral-800 shadow-xs text-purple-600' : 'text-slate-400'}`}
              title="Rule Lines (Notebook Lined Paper)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPaperStyle('grid')}
              className={`p-1 rounded ${paperStyle === 'grid' ? 'bg-white dark:bg-neutral-800 shadow-xs text-purple-600' : 'text-slate-400'}`}
              title="Grid Lines (Graph Paper)"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paper tint */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaperTint('default')}
              className={`w-3.5 h-3.5 rounded-full border border-slate-300 bg-white ${paperTint === 'default' ? 'ring-2 ring-purple-600' : ''}`}
              title="White"
            />
            <button
              onClick={() => setPaperTint('yellow')}
              className={`w-3.5 h-3.5 rounded-full border border-yellow-200 bg-[#FEFCE8] ${paperTint === 'yellow' ? 'ring-2 ring-purple-600' : ''}`}
              title="Pale Yellow"
            />
            <button
              onClick={() => setPaperTint('mint')}
              className={`w-3.5 h-3.5 rounded-full border border-green-200 bg-[#F0FDF4] ${paperTint === 'mint' ? 'ring-2 ring-purple-600' : ''}`}
              title="Mint Green"
            />
            <button
              onClick={() => setPaperTint('sky')}
              className={`w-3.5 h-3.5 rounded-full border border-blue-200 bg-[#F0F9FF] ${paperTint === 'sky' ? 'ring-2 ring-purple-600' : ''}`}
              title="Sky Blue"
            />
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: VERTICAL PAGE LIST + FREEFORM CANVAS */}
      <div className="flex-1 flex overflow-hidden">
        {/* VERTICAL PAGES COLUMN */}
        {isPageListOpen && (
          <div
            className={`border-r border-black/10 dark:border-white/10 bg-[#F3F2F1] dark:bg-[#252526] flex flex-col shrink-0 ${
              mobileTab === 'list'
                ? 'w-full flex-1 flex'
                : 'hidden md:flex md:w-64 sm:w-72'
            }`}
          >
            {/* Add Page Button */}
            <div className="p-2 border-b border-black/5 dark:border-white/5">
              <button
                onClick={() => {
                  if (activeChapter) {
                    onCreatePage(notebook.id, activeChapter.id, 'Untitled Page');
                    setMobileTab('editor');
                  }
                }}
                disabled={!activeChapter}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white dark:bg-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-black/5 dark:border-white/5 text-purple-700 dark:text-purple-300 font-semibold text-xs shadow-xs transition active:scale-[0.98] disabled:opacity-50 touch-manipulation"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>+ Add Page</span>
              </button>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
              {chapterPages.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  <p>No pages in this section.</p>
                  <p className="mt-1 text-[11px]">Click "+ Add Page" above to begin writing.</p>
                </div>
              ) : (
                chapterPages.map((page) => {
                  const isSelected = page.id === activeNote?.id;
                  const firstLine = page.blocks.find((b) => b.content.trim())?.content || '';

                  return (
                    <div
                      key={page.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onSelectNote(page.id);
                        setMobileTab('editor');
                      }}
                      className={`group p-2.5 rounded-lg cursor-pointer transition flex flex-col border touch-manipulation active:scale-[0.99] ${
                        isSelected
                          ? 'bg-white dark:bg-[#1E1E1E] border-purple-400 shadow-sm'
                          : 'border-transparent hover:bg-white/60 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate flex-1">
                          {page.title || 'Untitled Page'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete page "${page.title}"?`)) {
                              onDeletePage(page.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span className="truncate max-w-[120px]">{firstLine || 'No content'}</span>
                        <span>{new Date(page.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MAIN ONENOTE CANVAS & EDITOR SPACE */}
        <div
          style={getPaperBackgroundStyle()}
          className={`flex-1 flex flex-col h-full overflow-y-auto scrollbar-thin transition-colors ${
            mobileTab === 'editor' ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          {activeNote ? (
            <div
              className={`w-full py-6 sm:py-8 flex flex-col flex-1 transition-all duration-200 ${
                isWideCanvas
                  ? 'max-w-none px-6 sm:px-12 lg:px-16'
                  : 'max-w-4xl mx-auto px-4 sm:px-8'
              }`}
            >
              {/* Signature Microsoft OneNote Page Header */}
              <div className="mb-6 pb-2 border-b border-slate-300 dark:border-neutral-700 w-full">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => onUpdateNote({ ...activeNote, title: e.target.value })}
                  placeholder="Page Title"
                  className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-slate-100 touch-manipulation"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium select-none">
                  {formatDateHeader(activeNote.createdAt)}
                </div>
              </div>

              {/* View Modes */}
              <div className="flex-1 flex flex-col w-full">
                {activeNote.viewMode === 'document' && (
                  <BlockEditor
                    note={activeNote}
                    allNotes={notes}
                    fullWidth={isWideCanvas}
                    onChange={(blocks: BlockItemType[]) =>
                      onUpdateNote({ ...activeNote, blocks })
                    }
                    onNavigateSubpage={(subpageId) => {
                      onSelectNote(subpageId);
                      setMobileTab('editor');
                    }}
                    onCreateSubpage={onCreateSubpage}
                    onInlineTagsFound={onInlineTagsFound}
                  />
                )}

                {activeNote.viewMode === 'canvas' && (
                  <div className="w-full h-[750px] relative rounded-xl border border-black/10 dark:border-white/10 overflow-hidden shadow-xs">
                    <InfiniteCanvas
                      note={activeNote}
                      onChange={(canvasElements: CanvasElement[]) =>
                        onUpdateNote({ ...activeNote, canvasElements })
                      }
                    />
                  </div>
                )}

                {activeNote.viewMode === 'both' && (
                  <div className="flex flex-col lg:flex-row h-full min-h-[650px] w-full divide-y lg:divide-y-0 lg:divide-x divide-black/10 dark:divide-white/10">
                    <div className="w-full lg:w-1/2 overflow-y-auto">
                      <BlockEditor
                        note={activeNote}
                        allNotes={notes}
                        fullWidth={true}
                        onChange={(blocks: BlockItemType[]) =>
                          onUpdateNote({ ...activeNote, blocks })
                        }
                        onNavigateSubpage={(subpageId) => {
                          onSelectNote(subpageId);
                          setMobileTab('editor');
                        }}
                        onCreateSubpage={onCreateSubpage}
                        onInlineTagsFound={onInlineTagsFound}
                      />
                    </div>
                    <div className="w-full lg:w-1/2 relative min-h-[450px]">
                      <InfiniteCanvas
                        note={activeNote}
                        onChange={(canvasElements: CanvasElement[]) =>
                          onUpdateNote({ ...activeNote, canvasElements })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="text-5xl mb-3">📓</div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                {activeChapter ? `Section: ${activeChapter.name}` : 'No Section Selected'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Create a page to start typing anywhere, taking lecture notes, and drawing diagrams.
              </p>
              {activeChapter && (
                <button
                  onClick={() => onCreatePage(notebook.id, activeChapter.id, 'New Page')}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  + Create Page
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
