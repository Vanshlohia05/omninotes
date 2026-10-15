import React, { useState, useMemo } from 'react';
import {
  Pin,
  Clock,
  Layout,
  Share2,
  Trash2,
  Type,
  Maximize2,
  X,
  FileDown,
  Palette,
  Columns,
  Folder as FolderIcon,
  Undo2,
  Redo2,
  Network,
  RotateCcw,
  ExternalLink,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { NoteItem, Folder, FontStyle } from '../../types/note';
import { exportService } from '../../services/exportService';

interface NoteHeaderProps {
  note: NoteItem;
  allNotes?: NoteItem[];
  folders: Folder[];
  openTabs: NoteItem[];
  activeNoteId: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onUpdateNote: (updated: NoteItem) => void;
  onDeleteNote: () => void;
  onRestoreNote?: () => void;
  onOpenReminderModal: () => void;
  onBackToNotes?: () => void;
}

const PASTEL_PAGE_COLORS = [
  { name: 'Default', hex: '#FFFFFF' },
  { name: 'Warm Cream', hex: '#FEF9C3' },
  { name: 'Soft Mint', hex: '#DCFCE7' },
  { name: 'Sky Breeze', hex: '#E0F2FE' },
  { name: 'Lavender', hex: '#EDE9FE' },
  { name: 'Blush Rose', hex: '#FCE7F3' },
  { name: 'Peach', hex: '#FFEDD5' }
];

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  note,
  allNotes = [],
  folders,
  openTabs,
  activeNoteId,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSelectTab,
  onCloseTab,
  onUpdateNote,
  onDeleteNote,
  onRestoreNote,
  onOpenReminderModal,
  onBackToNotes
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isLinkViewOpen, setIsLinkViewOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Calculate Recently Deleted days remaining (30-day purge countdown)
  const daysRemaining = useMemo(() => {
    if (!note.isDeleted) return 30;
    const elapsedMs = Date.now() - (note.deletedAt || note.updatedAt);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - elapsedDays);
  }, [note.isDeleted, note.deletedAt, note.updatedAt]);

  // Compute Outgoing and Backlinks for "Link View"
  const { outgoingLinks, backlinks } = useMemo(() => {
    const outgoingIds = new Set<string>();
    for (const b of note.blocks) {
      if (b.linkedNoteId) outgoingIds.add(b.linkedNoteId);
      if (b.subpageId) outgoingIds.add(b.subpageId);
    }
    const outgoing = allNotes.filter((n) => outgoingIds.has(n.id));

    const incoming = allNotes.filter((n) => {
      if (n.id === note.id || n.isDeleted) return false;
      const linksToThis = n.blocks.some(
        (b) =>
          b.linkedNoteId === note.id ||
          b.subpageId === note.id ||
          (note.title && b.content.toLowerCase().includes(note.title.toLowerCase()))
      );
      return linksToThis;
    });

    return { outgoingLinks: outgoing, backlinks: incoming };
  }, [note, allNotes]);

  // Case transform helpers
  const transformTitleCase = (mode: 'upper' | 'lower' | 'title' | 'sentence') => {
    let t = note.title;
    if (mode === 'upper') t = t.toUpperCase();
    if (mode === 'lower') t = t.toLowerCase();
    if (mode === 'title') {
      t = t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    if (mode === 'sentence') {
      t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }
    onUpdateNote({ ...note, title: t });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!note.tags.includes(cleanTag)) {
      onUpdateNote({ ...note, tags: [...note.tags, cleanTag] });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({ ...note, tags: note.tags.filter((t) => t !== tagToRemove) });
  };

  return (
    <div className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Recently Deleted 30-day Countdown & Restore Banner */}
      {note.isDeleted && (
        <div className="bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-900/60 px-4 py-2 flex items-center justify-between text-xs text-red-800 dark:text-red-200 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              This note is in <strong>Recently Deleted</strong>. Permanent removal in{' '}
              <strong className="font-bold underline">{daysRemaining} days</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onRestoreNote && (
              <button
                onClick={onRestoreNote}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition shadow-sm"
              >
                Restore Note
              </button>
            )}
            <button
              onClick={onDeleteNote}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-sm"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Top Document Tabs (OneNote / Browser style) */}
      <div className="flex items-center overflow-x-auto px-4 pt-2 gap-1 border-b border-black/5 dark:border-white/5 scrollbar-none">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeNoteId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition border-t border-l border-r ${
                isActive
                  ? 'bg-[#FBFBFB] dark:bg-[#181818] text-slate-800 dark:text-slate-100 border-black/10 dark:border-white/10 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="truncate max-w-[120px]">{tab.title || 'Untitled'}</span>
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 gap-2">
        {/* Left: Folder Picker & Tags */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onBackToNotes && (
            <button
              onClick={onBackToNotes}
              className="md:hidden flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold text-xs px-2 py-1 -ml-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition"
              title="Back to Notes List"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Notes</span>
            </button>
          )}

          {/* Folder Select */}
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
            <FolderIcon className="w-3.5 h-3.5 text-amber-600" />
            <select
              value={note.folderId || ''}
              onChange={(e) => onUpdateNote({ ...note, folderId: e.target.value || undefined })}
              className="bg-transparent focus:outline-none cursor-pointer font-medium max-w-[100px] sm:max-w-none truncate"
            >
              <option value="">No Folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1 flex-wrap">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="group flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <input
                type="text"
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setIsAddingTag(false);
                }}
                onBlur={handleAddTag}
                placeholder="tag name..."
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 w-20 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-[11px] text-slate-400 hover:text-amber-600 px-1.5 py-0.5 rounded transition"
              >
                + tag
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Undo/Redo, View Mode, Link View, Style, Pin, Export, Delete */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Undo / Redo controls */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md transition ${
                canUndo
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#252525]'
                  : 'text-slate-300 dark:text-neutral-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md transition ${
                canRedo
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#252525]'
                  : 'text-slate-300 dark:text-neutral-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

          {/* View Mode Toggle (Document / Canvas / Timeline / Split) */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onUpdateNote({ ...note, viewMode: 'document' })}
              className={`px-2 py-1 rounded-md transition font-medium ${
                note.viewMode === 'document'
                  ? 'bg-white dark:bg-[#252525] text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Document
            </button>
            <button
              onClick={() => onUpdateNote({ ...note, viewMode: 'canvas' })}
              className={`px-2 py-1 rounded-md transition font-medium ${
                note.viewMode === 'canvas'
                  ? 'bg-white dark:bg-[#252525] text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => onUpdateNote({ ...note, viewMode: 'timeline' })}
              className={`px-2 py-1 rounded-md transition font-medium ${
                note.viewMode === 'timeline'
                  ? 'bg-white dark:bg-[#252525] text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => onUpdateNote({ ...note, viewMode: 'both' })}
              className={`px-2 py-1 rounded-md transition font-medium ${
                note.viewMode === 'both'
                  ? 'bg-white dark:bg-[#252525] text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Split
            </button>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

          {/* Link View / Connections button */}
          <div className="relative">
            <button
              onClick={() => setIsLinkViewOpen(!isLinkViewOpen)}
              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
                isLinkViewOpen || backlinks.length > 0 || outgoingLinks.length > 0
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Link View (Backlinks & Outgoing Connections)"
            >
              <Network className="w-4 h-4" />
              {(backlinks.length > 0 || outgoingLinks.length > 0) && (
                <span className="text-[10px] font-mono px-1 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                  {backlinks.length + outgoingLinks.length}
                </span>
              )}
            </button>

            {isLinkViewOpen && (
              <div className="absolute right-0 top-10 w-72 p-3 rounded-2xl bg-white dark:bg-[#252525] shadow-apple-floating border border-black/10 dark:border-white/10 z-50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-blue-500" />
                    <span>Link View & Graph</span>
                  </div>
                  <button
                    onClick={() => setIsLinkViewOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Backlinks */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Backlinks (Notes linking to this) ({backlinks.length})
                  </div>
                  {backlinks.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">No incoming links to this note</div>
                  ) : (
                    <div className="space-y-1">
                      {backlinks.map((bl) => (
                        <div
                          key={bl.id}
                          onClick={() => {
                            onSelectTab(bl.id);
                            setIsLinkViewOpen(false);
                          }}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {bl.title || 'Untitled Note'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing Links */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Outgoing Links ({outgoingLinks.length})
                  </div>
                  {outgoingLinks.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">No links in this note</div>
                  ) : (
                    <div className="space-y-1">
                      {outgoingLinks.map((ol) => (
                        <div
                          key={ol.id}
                          onClick={() => {
                            onSelectTab(ol.id);
                            setIsLinkViewOpen(false);
                          }}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {ol.title || 'Untitled Note'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Style & Font Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStyleOpen(!isStyleOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1 text-xs"
              title="Typography & Page Styling"
            >
              <Type className="w-4 h-4" />
            </button>

            {isStyleOpen && (
              <div className="absolute right-0 top-10 w-64 p-3 rounded-xl bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md shadow-apple-floating border border-black/10 dark:border-white/10 z-50 space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Font Family
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(['sans', 'serif', 'mono', 'handwritten'] as FontStyle[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => onUpdateNote({ ...note, fontFamily: f })}
                        className={`p-1.5 rounded text-center capitalize transition ${
                          note.fontFamily === f
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Font Size ({note.fontSize || 16}px)
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={note.fontSize || 16}
                    onChange={(e) => onUpdateNote({ ...note, fontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Case Transform
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      onClick={() => transformTitleCase('upper')}
                      className="p-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200"
                    >
                      UPPERCASE
                    </button>
                    <button
                      onClick={() => transformTitleCase('lower')}
                      className="p-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200"
                    >
                      lowercase
                    </button>
                    <button
                      onClick={() => transformTitleCase('title')}
                      className="p-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200"
                    >
                      Title Case
                    </button>
                    <button
                      onClick={() => transformTitleCase('sentence')}
                      className="p-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200"
                    >
                      Sentence case
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Page Background Tint
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PASTEL_PAGE_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => onUpdateNote({ ...note, pageColor: color.hex })}
                        title={color.name}
                        className={`w-6 h-6 rounded-full border border-black/10 transition ${
                          note.pageColor === color.hex ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pin Toggle */}
          <button
            onClick={() => onUpdateNote({ ...note, isPinned: !note.isPinned })}
            className={`p-1.5 rounded-lg transition ${
              note.isPinned
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note to Top'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Reminder / Notification */}
          <button
            onClick={onOpenReminderModal}
            className={`p-1.5 rounded-lg transition ${
              note.reminder
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Set Date & Time Reminder"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Share / Export Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1 text-xs"
              title="Share & Export"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-10 w-48 p-1.5 rounded-xl bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md shadow-apple-floating border border-black/10 dark:border-white/10 z-50 space-y-0.5">
                <button
                  onClick={() => {
                    exportService.exportToPdf(note);
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-red-500" />
                  Export as PDF
                </button>
                <button
                  onClick={async () => {
                    await exportService.exportToDocx(note);
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-500" />
                  Export as Word (DOCX)
                </button>
                <button
                  onClick={() => {
                    exportService.exportToJson(note);
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-500" />
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportService.exportToMarkdown(note);
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                  Export as Markdown
                </button>
              </div>
            )}
          </div>

          {/* Delete / Move to Trash */}
          <button
            onClick={onDeleteNote}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            title={note.isDeleted ? 'Delete Permanently' : 'Move to Recently Deleted'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Title Input */}
      <div className="px-6 py-2">
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
          placeholder="Untitled Note"
          className="w-full text-2xl lg:text-3xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 tracking-tight"
        />
      </div>
    </div>
  );
};
