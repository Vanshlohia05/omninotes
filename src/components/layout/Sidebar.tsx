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
  CloudCheck,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { NoteItem, Folder } from '../../types/note';

interface SidebarProps {
  notes: NoteItem[];
  folders: Folder[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenSettings: () => void;
  onOpenMCPModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isDriveConnected: boolean;
}

const FOLDER_COLORS = ['#E5A93C', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#64748B'];

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  folders,
  selectedFilter,
  onSelectFilter,
  onCreateFolder,
  onDeleteFolder,
  onOpenSettings,
  onOpenMCPModal,
  isDarkMode,
  onToggleDarkMode,
  isDriveConnected
}) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderColor, setSelectedFolderColor] = useState(FOLDER_COLORS[0]);

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

  return (
    <div className="w-64 h-full flex flex-col bg-[#F6F6F6] dark:bg-[#1E1E1E] border-r border-black/10 dark:border-white/10 select-none text-slate-700 dark:text-slate-200">
      {/* App Header */}
      <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white shadow-sm text-sm">
            📝
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">OmniNotes</h1>
            <p className="text-[10px] text-slate-400 font-medium">Apple • Notion • OneNote</p>
          </div>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin text-xs">
        {/* Smart Filters (Apple Notes Quick Links) */}
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectFilter('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'all'
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
            onClick={() => onSelectFilter('pinned')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'pinned'
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

          <button
            onClick={() => onSelectFilter('checklists')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'checklists'
                ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Checklists</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{checklistCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('reminders')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'reminders'
                ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Reminders</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{reminderCount}</span>
          </button>

          <button
            onClick={() => onSelectFilter('archive')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'archive'
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
            onClick={() => onSelectFilter('trash')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'trash'
                ? 'bg-red-100/80 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-semibold'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Recently Deleted</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{trashCount}</span>
          </button>
        </div>

        {/* Folders Section */}
        <div>
          <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Folders</span>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 hover:text-amber-600 transition"
              title="Add New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New folder creation modal input */}
          {isCreatingFolder && (
            <div className="p-2 mb-2 rounded-lg bg-white dark:bg-[#252525] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setIsCreatingFolder(false);
                }}
                placeholder="Folder name..."
                className="w-full text-xs p-1.5 rounded bg-slate-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1">
                  {FOLDER_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedFolderColor(col)}
                      className={`w-3.5 h-3.5 rounded-full ${
                        selectedFolderColor === col ? 'ring-2 ring-black dark:ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsCreatingFolder(false)}
                    className="px-2 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-semibold hover:bg-amber-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isSelected = selectedFilter === `folder:${folder.id}`;
              const count = activeNotes.filter((n) => n.folderId === folder.id).length;

              return (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => onSelectFilter(`folder:${folder.id}`)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-mono">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete folder "${folder.name}"? Notes inside will be kept.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition"
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
      </div>

      {/* Bottom Bar: Google Drive Sync Status, MCP Tools & Settings */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-1.5 bg-black/[0.02] dark:bg-white/[0.02]">
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

        {/* MCP Playground & Settings Buttons */}
        <div className="flex items-center gap-1 pt-1">
          <button
            onClick={onOpenMCPModal}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            title="Open Model Context Protocol Inspector"
          >
            <Bot className="w-3.5 h-3.5" />
            MCP Tools
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
