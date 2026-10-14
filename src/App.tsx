import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NoteItem, Folder, GDriveConfig, BlockItem as BlockItemType, CanvasElement } from './types/note';
import { dbService } from './services/indexedDb';
import { INITIAL_NOTES, INITIAL_FOLDERS } from './services/sampleData';
import { gdriveService } from './services/gdrive';
import { notificationService } from './services/notificationService';
import { MCPServerEngine } from './services/mcpServer';
import { Sidebar } from './components/layout/Sidebar';
import { NotesList } from './components/layout/NotesList';
import { NoteHeader } from './components/layout/NoteHeader';
import { BlockEditor } from './components/editor/BlockEditor';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { SettingsModal } from './components/layout/SettingsModal';
import { ReminderModal } from './components/common/ReminderModal';
import { MCPModal } from './components/mcp/MCPModal';
import { Menu, X, ArrowLeft } from 'lucide-react';

export function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [gdriveConfig, setGdriveConfig] = useState<GDriveConfig>({
    clientId: '',
    apiKey: '',
    isAuthorized: false
  });

  const notesRef = useRef<NoteItem[]>([]);
  notesRef.current = notes;
  const foldersRef = useRef<Folder[]>([]);
  foldersRef.current = folders;

  // Initialize DB and Seed Data
  useEffect(() => {
    async function init() {
      try {
        const storedNotes = await dbService.getAllNotes();
        const storedFolders = await dbService.getAllFolders();
        const storedDark = await dbService.getSetting('darkMode', false);
        const storedGDrive = await dbService.getSetting<GDriveConfig>('gdriveConfig', {
          clientId: '',
          apiKey: '',
          isAuthorized: false
        });

        setIsDarkMode(storedDark);
        if (storedDark) document.documentElement.classList.add('dark');

        setGdriveConfig(storedGDrive);

        if (storedNotes.length === 0 && storedFolders.length === 0) {
          // First time user: seed showcase data
          await dbService.saveNotes(INITIAL_NOTES);
          await dbService.saveFolders(INITIAL_FOLDERS);
          setNotes(INITIAL_NOTES);
          setFolders(INITIAL_FOLDERS);
          setActiveNoteId(INITIAL_NOTES[0].id);
          setOpenTabs([INITIAL_NOTES[0].id, INITIAL_NOTES[1].id]);
        } else {
          setNotes(storedNotes);
          setFolders(storedFolders);
          const firstNonDeleted = storedNotes.find((n) => !n.isDeleted) || storedNotes[0];
          if (firstNonDeleted) {
            setActiveNoteId(firstNonDeleted.id);
            setOpenTabs([firstNonDeleted.id]);
          }
        }
      } catch (err) {
        console.error('Database initialization error:', err);
      }
    }
    init();
  }, []);

  // Notifications Reminder Polling
  useEffect(() => {
    const interval = setInterval(() => {
      notificationService.checkReminders(notesRef.current, (updatedNote) => {
        handleUpdateNote(updatedNote);
      });
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // MCP Engine Instance
  const mcpEngine = useMemo(() => {
    return new MCPServerEngine({
      getNotes: () => notesRef.current,
      getFolders: () => foldersRef.current,
      onNoteCreate: (newNote: NoteItem) => {
        setNotes((prev) => [newNote, ...prev]);
        dbService.saveNote(newNote);
        setActiveNoteId(newNote.id);
        setOpenTabs((prev) => [...prev, newNote.id]);
      },
      onNoteUpdate: (updatedNote: NoteItem) => {
        setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
        dbService.saveNote(updatedNote);
      }
    });
  }, []);

  // Active Note Lookup
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // Open Tab Notes
  const activeTabsNotes = useMemo(() => {
    return openTabs.map((id) => notes.find((n) => n.id === id)).filter(Boolean) as NoteItem[];
  }, [openTabs, notes]);

  // Handlers
  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    if (!openTabs.includes(id)) {
      setOpenTabs((prev) => [...prev, id]);
    }
    setIsSidebarOpenMobile(false);
  };

  const handleCloseTab = (idToClose: string) => {
    const remaining = openTabs.filter((id) => id !== idToClose);
    setOpenTabs(remaining);
    if (activeNoteId === idToClose) {
      setActiveNoteId(remaining[remaining.length - 1] || null);
    }
  };

  const handleCreateNote = () => {
    const targetFolder = selectedFilter.startsWith('folder:')
      ? selectedFilter.replace('folder:', '')
      : undefined;

    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: 'Untitled Note',
      folderId: targetFolder,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      tags: [],
      fontFamily: 'sans',
      fontSize: 16,
      viewMode: 'document',
      blocks: [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }],
      canvasElements: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    setOpenTabs((prev) => [...prev, newNote.id]);
    dbService.saveNote(newNote);
  };

  const handleUpdateNote = (updated: NoteItem) => {
    const withTimestamp = { ...updated, updatedAt: Date.now() };
    setNotes((prev) => prev.map((n) => (n.id === withTimestamp.id ? withTimestamp : n)));
    dbService.saveNote(withTimestamp);
  };

  const handleDeleteNote = () => {
    if (!activeNote) return;
    const isAlreadyInTrash = activeNote.isDeleted;

    if (isAlreadyInTrash) {
      // Permanent delete
      dbService.deleteNotePermanently(activeNote.id);
      setNotes((prev) => prev.filter((n) => n.id !== activeNote.id));
      handleCloseTab(activeNote.id);
    } else {
      // Move to Recently Deleted
      const trashed = { ...activeNote, isDeleted: true, deletedAt: Date.now() };
      handleUpdateNote(trashed);
      handleCloseTab(activeNote.id);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      createdAt: Date.now()
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    await dbService.saveFolder(newFolder);
  };

  const handleDeleteFolder = async (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    await dbService.deleteFolder(folderId);
  };

  const handleEmptyTrash = async () => {
    const trashed = notes.filter((n) => n.isDeleted);
    for (const t of trashed) {
      await dbService.deleteNotePermanently(t.id);
    }
    setNotes((prev) => prev.filter((n) => !n.isDeleted));
  };

  const handleResetSampleData = async () => {
    await dbService.saveNotes(INITIAL_NOTES);
    await dbService.saveFolders(INITIAL_FOLDERS);
    setNotes(INITIAL_NOTES);
    setFolders(INITIAL_FOLDERS);
    setActiveNoteId(INITIAL_NOTES[0].id);
    setOpenTabs([INITIAL_NOTES[0].id, INITIAL_NOTES[1].id]);
  };

  const handleRestoreVault = async (restoredNotes: NoteItem[], restoredFolders: Folder[]) => {
    await dbService.saveNotes(restoredNotes);
    await dbService.saveFolders(restoredFolders);
    setNotes(restoredNotes);
    setFolders(restoredFolders);
    if (restoredNotes[0]) {
      setActiveNoteId(restoredNotes[0].id);
      setOpenTabs([restoredNotes[0].id]);
    }
  };

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    dbService.saveSetting('darkMode', next);
  };

  // Google Drive Manual Sync trigger
  const handleSyncDrive = async () => {
    if (!gdriveConfig.accessToken) {
      alert('To enable Google Drive cloud sync, add a Google OAuth Client ID in settings or GIS token.');
      return;
    }
    try {
      const res = await gdriveService.uploadVault(gdriveConfig.accessToken, notes, folders);
      const updatedConfig = { ...gdriveConfig, lastSyncedAt: res.timestamp };
      setGdriveConfig(updatedConfig);
      await dbService.saveSetting('gdriveConfig', updatedConfig);
      alert('OmniNotes Vault successfully synced to Google Drive!');
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    }
  };

  // Subpage Creator helper for Notion-style child pages
  const handleCreateSubpage = (title: string): string => {
    const childNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      folderId: activeNote?.folderId,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      tags: activeNote?.tags || [],
      fontFamily: activeNote?.fontFamily || 'sans',
      fontSize: 16,
      viewMode: 'document',
      blocks: [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }],
      canvasElements: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes((prev) => [childNote, ...prev]);
    dbService.saveNote(childNote);
    return childNote.id;
  };

  // Font family CSS class helper
  const getFontFamilyClass = (style: string) => {
    switch (style) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'handwritten':
        return 'font-handwritten text-lg';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] text-slate-800 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpenMobile && (
        <div
          onClick={() => setIsSidebarOpenMobile(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Pane 1: Apple Notes Sidebar */}
      <div
        className={`fixed md:relative z-50 md:z-0 h-full transition-transform duration-200 ease-in-out ${
          isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          notes={notes}
          folders={folders}
          selectedFilter={selectedFilter}
          onSelectFilter={(f) => {
            setSelectedFilter(f);
            setIsSidebarOpenMobile(false);
          }}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMCPModal={() => setIsMCPOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isDriveConnected={gdriveConfig.isAuthorized}
        />
      </div>

      {/* Pane 2: Middle Notes List */}
      <NotesList
        notes={notes}
        folders={folders}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        selectedFilter={selectedFilter}
      />

      {/* Pane 3: Singular Active Note Space */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] min-w-0">
        {activeNote ? (
          <div
            className={`flex-1 flex flex-col h-full overflow-hidden ${getFontFamilyClass(activeNote.fontFamily)}`}
            style={{
              backgroundColor: activeNote.pageColor || undefined,
              fontSize: `${activeNote.fontSize || 16}px`
            }}
          >
            {/* Note Header & Action Controls */}
            <NoteHeader
              note={activeNote}
              folders={folders}
              openTabs={activeTabsNotes}
              activeNoteId={activeNote.id}
              onSelectTab={handleSelectNote}
              onCloseTab={handleCloseTab}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onOpenReminderModal={() => setIsReminderOpen(true)}
            />

            {/* Note Body: Notion Document Mode or OneNote Infinite Canvas Mode or Split */}
            <div className="flex-1 overflow-y-auto relative scrollbar-thin">
              {activeNote.viewMode === 'document' && (
                <BlockEditor
                  note={activeNote}
                  onChange={(blocks: BlockItemType[]) =>
                    handleUpdateNote({ ...activeNote, blocks })
                  }
                  onNavigateSubpage={handleSelectNote}
                  onCreateSubpage={handleCreateSubpage}
                />
              )}

              {activeNote.viewMode === 'canvas' && (
                <InfiniteCanvas
                  note={activeNote}
                  onChange={(canvasElements: CanvasElement[]) =>
                    handleUpdateNote({ ...activeNote, canvasElements })
                  }
                />
              )}

              {activeNote.viewMode === 'both' && (
                <div className="flex h-full w-full divide-x divide-black/10 dark:divide-white/10">
                  <div className="w-1/2 h-full overflow-y-auto scrollbar-thin">
                    <BlockEditor
                      note={activeNote}
                      onChange={(blocks: BlockItemType[]) =>
                        handleUpdateNote({ ...activeNote, blocks })
                      }
                      onNavigateSubpage={handleSelectNote}
                      onCreateSubpage={handleCreateSubpage}
                    />
                  </div>
                  <div className="w-1/2 h-full relative">
                    <InfiniteCanvas
                      note={activeNote}
                      onChange={(canvasElements: CanvasElement[]) =>
                        handleUpdateNote({ ...activeNote, canvasElements })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center select-none">
            <div className="text-4xl mb-3">📝</div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Note Selected</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Select a note from the middle list or click "+ New Note" to start writing.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Create New Note
            </button>
          </div>
        )}
      </div>

      {/* Floating Mobile Sidebar Trigger */}
      <button
        onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        className="fixed bottom-4 left-4 z-40 md:hidden p-3 rounded-full bg-amber-500 text-white shadow-apple-floating hover:bg-amber-600 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        notes={notes}
        folders={folders}
        gdriveConfig={gdriveConfig}
        onUpdateGDriveConfig={setGdriveConfig}
        onSyncDrive={handleSyncDrive}
        onRestoreVault={handleRestoreVault}
        onResetSampleData={handleResetSampleData}
        onEmptyTrash={handleEmptyTrash}
      />

      <MCPModal
        isOpen={isMCPOpen}
        onClose={() => setIsMCPOpen(false)}
        mcpEngine={mcpEngine}
      />

      <ReminderModal
        isOpen={isReminderOpen}
        currentReminder={activeNote?.reminder}
        onSave={(reminder) => {
          if (activeNote) {
            handleUpdateNote({ ...activeNote, reminder });
          }
        }}
        onClose={() => setIsReminderOpen(false)}
      />
    </div>
  );
}
export default App;
