import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pin,
  Calendar,
  Tag as TagIcon,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { NoteItem, Folder } from '../../types/note';

interface NotesListProps {
  notes: NoteItem[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  selectedFilter: string; // 'all' | 'pinned' | 'checklists' | 'reminders' | 'archive' | 'trash' | folderId | tag
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  selectedFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [groupBy, setGroupBy] = useState<'date' | 'folder' | 'none'>('date');

  // Filter notes based on active sidebar selection and search
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Trash filtering
      if (selectedFilter === 'trash') {
        if (!n.isDeleted) return false;
      } else {
        if (n.isDeleted) return false;
      }

      // Sidebar smart filters
      if (selectedFilter === 'pinned' && !n.isPinned) return false;
      if (selectedFilter === 'archive' && !n.isArchived) return false;
      if (selectedFilter === 'checklists') {
        const hasTasks = n.blocks.some((b) => b.type === 'task');
        if (!hasTasks) return false;
      }
      if (selectedFilter === 'reminders' && !n.reminder) return false;

      // Folder filter
      if (selectedFilter.startsWith('folder:')) {
        const fId = selectedFilter.replace('folder:', '');
        if (n.folderId !== fId) return false;
      }

      // Tag filter
      if (selectedFilter.startsWith('tag:')) {
        const targetTag = selectedFilter.replace('tag:', '').toLowerCase();
        if (!n.tags.some((t) => t.toLowerCase() === targetTag)) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
        const matchContent = n.blocks.some((b) => b.content.toLowerCase().includes(q));
        if (!matchTitle && !matchTag && !matchContent) return false;
      }

      return true;
    });
  }, [notes, selectedFilter, searchQuery]);

  // Sort notes
  const sortedNotes = useMemo(() => {
    const list = [...filteredNotes];
    list.sort((a, b) => {
      // Pinned notes stay on top unless in trash
      if (selectedFilter !== 'trash') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      } else {
        return b.updatedAt - a.updatedAt;
      }
    });
    return list;
  }, [filteredNotes, sortBy, selectedFilter]);

  // Format date helper (Apple Notes style: Today 4:15 PM, Yesterday, or MM/DD/YY)
  const formatDateSnippet = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const isThisYear = d.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#1C1C1E] select-none">
      {/* Top Search & Actions */}
      <div className="p-3 border-b border-black/5 dark:border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Notes</h2>
          <button
            onClick={onCreateNote}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition active:scale-95"
            title="Create New Note (N)"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all notes, tags, blocks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-200/60 dark:bg-neutral-800/80 rounded-lg border border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition placeholder:text-slate-400"
          />
        </div>

        {/* Sort & Group dropdowns */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="updated">Date Modified</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>
          <span>{sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}</span>
        </div>
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 p-4">
            <FileText className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
            <div className="text-xs font-medium">No notes found</div>
            <div className="text-[11px] mt-1 text-slate-400">Click "+ New Note" to write something</div>
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isSelected = note.id === activeNoteId;
            const snippet =
              note.blocks.find((b) => b.content.trim().length > 0)?.content || 'No additional text';

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                style={{
                  backgroundColor: isSelected ? undefined : note.color || undefined
                }}
                className={`p-3 rounded-xl cursor-pointer transition relative group border ${
                  isSelected
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 shadow-sm'
                    : 'border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                {/* Note Title & Pin Indicator */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate flex-1">
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.isPinned && (
                    <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Date & Excerpt */}
                <div className="flex items-baseline gap-2 text-xs mb-1.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0 text-[11px]">
                    {formatDateSnippet(note.updatedAt)}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 truncate text-[11px] flex-1">
                    {snippet}
                  </p>
                </div>

                {/* Tags and Folder pill */}
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  {note.folderId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
                      {folders.find((f) => f.id === note.folderId)?.name || 'Folder'}
                    </span>
                  )}
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/50"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{note.tags.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
