import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NoteItem, Folder, GDriveConfig, BlockItem as BlockItemType, CanvasElement } from './types/note';
import { Notebook, NotebookUnit, NotebookChapter } from './types/notebook';
import {
  HabitItem,
  TaskItem,
  JournalBook,
  ParaItem,
  CrmContact
} from './types/lifeos';
import { dbService } from './services/indexedDb';
import {
  INITIAL_NOTES,
  INITIAL_FOLDERS,
  INITIAL_NOTEBOOKS,
  INITIAL_HABITS,
  INITIAL_TASKS,
  INITIAL_JOURNALS,
  INITIAL_PARA_ITEMS,
  INITIAL_CRM_CONTACTS
} from './services/sampleData';
import { gdriveService } from './services/gdrive';
import { notificationService } from './services/notificationService';
import { MCPServerEngine } from './services/mcpServer';
import { ApiServer } from './services/apiServer';
import { Sidebar, AppViewMode } from './components/layout/Sidebar';
import { NotesList } from './components/layout/NotesList';
import { NoteHeader } from './components/layout/NoteHeader';
import { BlockEditor } from './components/editor/BlockEditor';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { TimelineView } from './components/timeline/TimelineView';
import { OneNoteWorkspace } from './components/onenote/OneNoteWorkspace';
import { HabitTrackerView } from './components/habits/HabitTrackerView';
import { JournalView } from './components/journal/JournalView';
import { TodoHubView } from './components/todo/TodoHubView';
import { ParaVaultView } from './components/para/ParaVaultView';
import { PersonalCRMView } from './components/crm/PersonalCRMView';
import { SettingsModal } from './components/layout/SettingsModal';
import { ReminderModal } from './components/common/ReminderModal';
import { MCPModal } from './components/mcp/MCPModal';
import { APIExplorerModal } from './components/api/APIExplorerModal';
import { Menu, Sparkles } from 'lucide-react';

export function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [appView, setAppView] = useState<AppViewMode>('notes');
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [journals, setJournals] = useState<JournalBook[]>(INITIAL_JOURNALS);
  const [paraItems, setParaItems] = useState<ParaItem[]>(INITIAL_PARA_ITEMS);
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>(INITIAL_CRM_CONTACTS);
  const [activeJournalId, setActiveJournalId] = useState<string | null>('journal-personal');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'note'>('list');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isAPIExplorerOpen, setIsAPIExplorerOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'notes' | 'notebooks'>('notes');
  const [notebooks, setNotebooks] = useState<Notebook[]>(INITIAL_NOTEBOOKS);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>('nb-cs');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [gdriveConfig, setGdriveConfig] = useState<GDriveConfig>({
    clientId: '',
    apiKey: '',
    isAuthorized: false
  });

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<NoteItem[]>([]);
  const [redoStack, setRedoStack] = useState<NoteItem[]>([]);

  const notesRef = useRef<NoteItem[]>([]);
  notesRef.current = notes;
  const foldersRef = useRef<Folder[]>([]);
  foldersRef.current = folders;
  const notebooksRef = useRef<Notebook[]>([]);
  notebooksRef.current = notebooks;

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

        const storedNotebooks = await dbService.getSetting<Notebook[]>('notebooks', INITIAL_NOTEBOOKS);
        setNotebooks(storedNotebooks);
        if (storedNotebooks.length > 0) {
          setActiveNotebookId(storedNotebooks[0].id);
        }

        // Initialize Life OS Stores
        const storedHabits = await dbService.getAllHabits();
        if (storedHabits.length === 0) {
          await dbService.saveHabits(INITIAL_HABITS);
          setHabits(INITIAL_HABITS);
        } else {
          setHabits(storedHabits);
        }

        const storedTasks = await dbService.getAllTasks();
        if (storedTasks.length === 0) {
          await dbService.saveTasks(INITIAL_TASKS);
          setTasks(INITIAL_TASKS);
        } else {
          setTasks(storedTasks);
        }

        const storedJournals = await dbService.getAllJournals();
        if (storedJournals.length === 0) {
          await dbService.saveJournals(INITIAL_JOURNALS);
          setJournals(INITIAL_JOURNALS);
          setActiveJournalId(INITIAL_JOURNALS[0]?.id || null);
        } else {
          setJournals(storedJournals);
          setActiveJournalId(storedJournals[0]?.id || null);
        }

        const storedPara = await dbService.getAllParaItems();
        if (storedPara.length === 0) {
          await dbService.saveParaItems(INITIAL_PARA_ITEMS);
          setParaItems(INITIAL_PARA_ITEMS);
        } else {
          setParaItems(storedPara);
        }

        const storedCrm = await dbService.getAllCrmContacts();
        if (storedCrm.length === 0) {
          await dbService.saveCrmContacts(INITIAL_CRM_CONTACTS);
          setCrmContacts(INITIAL_CRM_CONTACTS);
        } else {
          setCrmContacts(storedCrm);
        }

        if (storedNotes.length === 0 && storedFolders.length === 0) {
          // First time user: seed showcase data
          await dbService.saveNotes(INITIAL_NOTES);
          await dbService.saveFolders(INITIAL_FOLDERS);
          await dbService.saveSetting('notebooks', INITIAL_NOTEBOOKS);
          setNotes(INITIAL_NOTES);
          setFolders(INITIAL_FOLDERS);
          setNotebooks(INITIAL_NOTEBOOKS);
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
        handleUpdateNote(updatedNote, true);
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

  // REST API Server Instance for AI Agents & Custom Actions
  const apiServer = useMemo(() => {
    return new ApiServer({
      getNotes: () => notesRef.current,
      getFolders: () => foldersRef.current,
      getNotebooks: () => notebooksRef.current,
      onNoteCreate: (newNote: NoteItem) => {
        setNotes((prev) => [newNote, ...prev]);
        dbService.saveNote(newNote);
        setActiveNoteId(newNote.id);
        setOpenTabs((prev) => [...prev, newNote.id]);
      },
      onNoteUpdate: (updatedNote: NoteItem) => {
        setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
        dbService.saveNote(updatedNote);
      },
      onNoteDelete: (id: string, permanent?: boolean) => {
        if (permanent) {
          setNotes((prev) => prev.filter((n) => n.id !== id));
          dbService.deleteNotePermanently(id);
        } else {
          setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isDeleted: true, deletedAt: Date.now() } : n))
          );
        }
      },
      onNotebooksChange: (updatedNotebooks: Notebook[]) => {
        setNotebooks(updatedNotebooks);
        dbService.saveSetting('notebooks', updatedNotebooks);
      }
    });
  }, []);

  // Active Notebook Lookup
  const activeNotebook = useMemo(() => {
    return notebooks.find((nb) => nb.id === activeNotebookId) || notebooks[0] || null;
  }, [notebooks, activeNotebookId]);

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
    setUndoStack([]);
    setRedoStack([]);
    setIsSidebarOpenMobile(false);
    setMobileView('note');
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
    setUndoStack([]);
    setRedoStack([]);
    dbService.saveNote(newNote);
    setMobileView('note');
  };

  const handleUpdateNote = useCallback(
    (updated: NoteItem, isHistoryOp = false) => {
      if (!isHistoryOp && activeNote && activeNote.id === updated.id) {
        setUndoStack((prev) => [JSON.parse(JSON.stringify(activeNote)), ...prev.slice(0, 49)]);
        setRedoStack([]);
      }

      const withTimestamp = { ...updated, updatedAt: Date.now() };
      setNotes((prev) => prev.map((n) => (n.id === withTimestamp.id ? withTimestamp : n)));
      dbService.saveNote(withTimestamp);
    },
    [activeNote]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !activeNote) return;
    const [previousState, ...restUndo] = undoStack;
    setUndoStack(restUndo);
    setRedoStack((prev) => [JSON.parse(JSON.stringify(activeNote)), ...prev]);
    handleUpdateNote(previousState, true);
  }, [undoStack, activeNote, handleUpdateNote]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !activeNote) return;
    const [nextState, ...restRedo] = redoStack;
    setRedoStack(restRedo);
    setUndoStack((prev) => [JSON.parse(JSON.stringify(activeNote)), ...prev]);
    handleUpdateNote(nextState, true);
  }, [redoStack, activeNote, handleUpdateNote]);

  // Global Undo / Redo Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).tagName === 'INPUT';

      if ((e.ctrlKey || e.metaKey) && !isInput) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (
          (e.key.toLowerCase() === 'z' && e.shiftKey) ||
          e.key.toLowerCase() === 'y'
        ) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleUndo, handleRedo]);

  // Inline Hashtags Detection Callback
  const handleInlineTagsFound = (tags: string[]) => {
    if (!activeNote) return;
    const existing = new Set(activeNote.tags);
    let changed = false;
    for (const t of tags) {
      if (!existing.has(t)) {
        existing.add(t);
        changed = true;
      }
    }
    if (changed) {
      handleUpdateNote({ ...activeNote, tags: Array.from(existing) });
    }
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
    }
  };

  const handleDeleteNoteById = (id: string) => {
    dbService.deleteNotePermanently(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    handleCloseTab(id);
  };

  const handleRestoreNote = (idToRestore?: string) => {
    const targetId = idToRestore || activeNoteId;
    if (!targetId) return;
    const target = notes.find((n) => n.id === targetId);
    if (!target) return;
    const restored: NoteItem = {
      ...target,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now()
    };
    handleUpdateNote(restored, true);
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
    setUndoStack([]);
    setRedoStack([]);
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
    setUndoStack([]);
    setRedoStack([]);
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

  // Life OS Handlers
  const handleSaveHabit = async (habit: HabitItem) => {
    setHabits((prev) => {
      const exists = prev.some((h) => h.id === habit.id);
      return exists ? prev.map((h) => (h.id === habit.id ? habit : h)) : [habit, ...prev];
    });
    await dbService.saveHabit(habit);
  };

  const handleDeleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await dbService.deleteHabit(id);
  };

  const handleSaveTask = async (task: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists ? prev.map((t) => (t.id === task.id ? task : t)) : [task, ...prev];
    });
    await dbService.saveTask(task);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await dbService.deleteTask(id);
  };

  const handleSaveJournal = async (journal: JournalBook) => {
    setJournals((prev) => prev.map((j) => (j.id === journal.id ? journal : j)));
    await dbService.saveJournal(journal);
  };

  const handleCreateJournal = async (title: string, coverColor: string) => {
    const newJournal: JournalBook = {
      id: `journal-${Date.now()}`,
      title,
      coverColor,
      defaultRuling: 'ruled',
      category: 'Personal',
      activePageNumber: 1,
      viewMode: 'book',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [
        {
          id: `page-${Date.now()}-1`,
          journalId: `journal-${Date.now()}`,
          pageNumber: 1,
          title: 'Table of Contents',
          date: new Date().toISOString().split('T')[0],
          paperRuling: 'ruled',
          blocks: [
            { id: `b-${Date.now()}-1`, type: 'h1', content: `${title} — Table of Contents` },
            { id: `b-${Date.now()}-2`, type: 'paragraph', content: 'Index of all entries in this journal.' }
          ],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    };
    setJournals((prev) => [newJournal, ...prev]);
    setActiveJournalId(newJournal.id);
    setAppView('journal');
    await dbService.saveJournal(newJournal);
  };

  const handleSaveParaItem = async (item: ParaItem) => {
    setParaItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [item, ...prev];
    });
    await dbService.saveParaItem(item);
  };

  const handleDeleteParaItem = async (id: string) => {
    setParaItems((prev) => prev.filter((p) => p.id !== id));
    await dbService.deleteParaItem(id);
  };

  const handleSaveCrmContact = async (contact: CrmContact) => {
    setCrmContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      return exists ? prev.map((c) => (c.id === contact.id ? contact : c)) : [contact, ...prev];
    });
    await dbService.saveCrmContact(contact);
  };

  const handleDeleteCrmContact = async (id: string) => {
    setCrmContacts((prev) => prev.filter((c) => c.id !== id));
    await dbService.deleteCrmContact(id);
  };

  // Microsoft OneNote Notebooks Handlers
  const handleCreateNotebook = (name: string, color: string) => {
    const newNb: Notebook = {
      id: `nb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      color,
      icon: '📓',
      units: [
        {
          id: `unit-${Date.now()}-1`,
          notebookId: `nb-${Date.now()}`,
          name: 'Unit 1: Section Group',
          chapters: [
            {
              id: `chap-${Date.now()}-1`,
              notebookId: `nb-${Date.now()}`,
              unitId: `unit-${Date.now()}-1`,
              name: 'Section 1',
              color: '#873999',
              pageIds: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newNb, ...notebooks];
    setNotebooks(updated);
    setActiveNotebookId(newNb.id);
    setSidebarMode('notebooks');
    dbService.saveSetting('notebooks', updated);
  };

  const handleDeleteNotebook = (id: string) => {
    const updated = notebooks.filter((nb) => nb.id !== id);
    setNotebooks(updated);
    if (activeNotebookId === id) {
      setActiveNotebookId(updated[0]?.id || null);
    }
    dbService.saveSetting('notebooks', updated);
  };

  const handleCreateUnit = (notebookId: string, name: string) => {
    const newUnit: NotebookUnit = {
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      notebookId,
      name,
      chapters: [
        {
          id: `chap-${Date.now()}-1`,
          notebookId,
          unitId: `unit-${Date.now()}`,
          name: 'General',
          color: '#873999',
          pageIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = notebooks.map((nb) =>
      nb.id === notebookId ? { ...nb, units: [...nb.units, newUnit], updatedAt: Date.now() } : nb
    );
    setNotebooks(updated);
    dbService.saveSetting('notebooks', updated);
  };

  const handleCreateChapter = (notebookId: string, unitId: string, name: string, color: string) => {
    const newChapter: NotebookChapter = {
      id: `chap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      notebookId,
      unitId,
      name,
      color,
      pageIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = notebooks.map((nb) => {
      if (nb.id !== notebookId) return nb;
      return {
        ...nb,
        units: nb.units.map((u) =>
          u.id === unitId ? { ...u, chapters: [...u.chapters, newChapter], updatedAt: Date.now() } : u
        ),
        updatedAt: Date.now()
      };
    });
    setNotebooks(updated);
    dbService.saveSetting('notebooks', updated);
  };

  const handleDeleteChapter = (notebookId: string, unitId: string, chapterId: string) => {
    const updated = notebooks.map((nb) => {
      if (nb.id !== notebookId) return nb;
      return {
        ...nb,
        units: nb.units.map((u) =>
          u.id === unitId ? { ...u, chapters: u.chapters.filter((c) => c.id !== chapterId), updatedAt: Date.now() } : u
        ),
        updatedAt: Date.now()
      };
    });
    setNotebooks(updated);
    dbService.saveSetting('notebooks', updated);
  };

  const handleCreateChapterPage = (notebookId: string, chapterId: string, title = 'Untitled Page') => {
    const newPage: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      notebookId,
      chapterId,
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

    setNotes((prev) => [newPage, ...prev]);
    dbService.saveNote(newPage);
    setActiveNoteId(newPage.id);

    const updated = notebooks.map((nb) => {
      if (nb.id !== notebookId) return nb;
      return {
        ...nb,
        units: nb.units.map((u) => ({
          ...u,
          chapters: u.chapters.map((c) =>
            c.id === chapterId ? { ...c, pageIds: [...c.pageIds, newPage.id], updatedAt: Date.now() } : c
          )
        }))
      };
    });
    setNotebooks(updated);
    dbService.saveSetting('notebooks', updated);
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
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] text-slate-800 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpenMobile && (
        <div
          onClick={() => setIsSidebarOpenMobile(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Pane 1: Apple Notes & OneNote Binder Sidebar */}
      <div
        className={`fixed md:relative z-50 md:z-0 h-full w-72 sm:w-80 md:w-64 shrink-0 transition-transform duration-200 ease-in-out ${
          isSidebarOpenMobile
            ? 'translate-x-0 shadow-2xl pointer-events-auto'
            : '-translate-x-full md:translate-x-0 pointer-events-none md:pointer-events-auto'
        }`}
      >
        <Sidebar
          notes={notes}
          folders={folders}
          notebooks={notebooks}
          sidebarMode={sidebarMode}
          onSidebarModeChange={(mode) => {
            setSidebarMode(mode);
            setAppView(mode);
          }}
          selectedFilter={selectedFilter}
          onSelectFilter={(f) => {
            setSelectedFilter(f);
            setSidebarMode('notes');
            setAppView('notes');
            setIsSidebarOpenMobile(false);
            setMobileView('list');
          }}
          currentView={appView}
          onSelectView={(v) => {
            setAppView(v);
            if (v === 'notebooks') setSidebarMode('notebooks');
            else setSidebarMode('notes');
          }}
          habitsCount={habits.length}
          tasksCount={tasks.filter((t) => !t.completed).length}
          journals={journals}
          activeJournalId={activeJournalId}
          onSelectJournal={(id) => {
            setActiveJournalId(id);
            setAppView('journal');
          }}
          onCreateJournal={handleCreateJournal}
          paraCount={paraItems.length}
          crmCount={crmContacts.length}
          activeNotebookId={activeNotebookId}
          onSelectNotebook={(id) => {
            setActiveNotebookId(id);
            setSidebarMode('notebooks');
            setAppView('notebooks');
            setIsSidebarOpenMobile(false);
          }}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateNotebook={handleCreateNotebook}
          onDeleteNotebook={handleDeleteNotebook}
          onCreateUnit={handleCreateUnit}
          onCreateChapter={handleCreateChapter}
          onSelectChapter={(nbId, chapId) => {
            setActiveNotebookId(nbId);
            setActiveChapterId(chapId);
            setSidebarMode('notebooks');
            setAppView('notebooks');
            setIsSidebarOpenMobile(false);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMCPModal={() => setIsMCPOpen(true)}
          onOpenAPIExplorer={() => setIsAPIExplorerOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isDriveConnected={gdriveConfig.isAuthorized}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />
      </div>

      {/* Main Content Area */}
      {sidebarMode === 'notebooks' || appView === 'notebooks' ? (
        <div className="flex-1 flex h-full overflow-hidden">
          {activeNotebook ? (
            <OneNoteWorkspace
              notebook={activeNotebook}
              allNotebooks={notebooks}
              notes={notes}
              activeNoteId={activeNoteId}
              activeChapterId={activeChapterId}
              onSelectChapter={(nbId, chapId) => setActiveChapterId(chapId)}
              onSelectNote={(noteId) => {
                setActiveNoteId(noteId);
                setMobileView('note');
              }}
              onCreatePage={handleCreateChapterPage}
              onDeletePage={handleDeleteNoteById}
              onUpdateNote={handleUpdateNote}
              onSelectNotebook={(id) => {
                setActiveNotebookId(id);
                setActiveChapterId(null);
              }}
              onCreateChapter={handleCreateChapter}
              onDeleteChapter={handleDeleteChapter}
              onCreateUnit={handleCreateUnit}
              onBackToNotesList={() => {
                setSidebarMode('notes');
                setAppView('notes');
              }}
              onOpenSidebar={() => setIsSidebarOpenMobile(true)}
              onCreateSubpage={handleCreateSubpage}
              onInlineTagsFound={handleInlineTagsFound}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center select-none">
              <div className="text-4xl mb-3">📓</div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Notebook Selected</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Create a notebook in the sidebar to organize units and chapters.
              </p>
              <button
                onClick={() => handleCreateNotebook('My Notebook', '#7719AA')}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                + Create Notebook
              </button>
            </div>
          )}
        </div>
      ) : appView === 'todo' ? (
        <TodoHubView
          tasks={tasks}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onBackToNotes={() => setAppView('notes')}
          onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        />
      ) : appView === 'habits' ? (
        <HabitTrackerView
          habits={habits}
          onSaveHabit={handleSaveHabit}
          onDeleteHabit={handleDeleteHabit}
          onBackToNotes={() => setAppView('notes')}
          onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        />
      ) : appView === 'journal' ? (
        <JournalView
          journal={journals.find((j) => j.id === activeJournalId) || journals[0]}
          allJournals={journals}
          onSelectJournal={(id) => setActiveJournalId(id)}
          onUpdateJournal={handleSaveJournal}
          onBackToNotes={() => setAppView('notes')}
          onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        />
      ) : appView === 'para' ? (
        <ParaVaultView
          items={paraItems}
          allNotes={notes}
          onSelectItem={() => {}}
          onSaveItem={handleSaveParaItem}
          onDeleteItem={handleDeleteParaItem}
          onOpenNote={(noteId) => {
            setActiveNoteId(noteId);
            setAppView('notes');
            setMobileView('note');
          }}
          onBackToNotes={() => setAppView('notes')}
          onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        />
      ) : appView === 'crm' ? (
        <PersonalCRMView
          contacts={crmContacts}
          onSaveContact={handleSaveCrmContact}
          onDeleteContact={handleDeleteCrmContact}
          onBackToNotes={() => setAppView('notes')}
          onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        />
      ) : (
        <>
          {/* Pane 2: Middle Notes List */}
          <div
            className={`h-full ${
              mobileView === 'list' ? 'w-full flex' : 'hidden md:flex md:w-80 lg:w-96'
            } shrink-0`}
          >
            <NotesList
              notes={notes}
              folders={folders}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onRestoreNote={handleRestoreNote}
              selectedFilter={selectedFilter}
              onBackToFolders={() => setIsSidebarOpenMobile(true)}
            />
          </div>

          {/* Pane 3: Singular Active Note Space */}
          <div
            className={`flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFB] dark:bg-[#181818] min-w-0 ${
              mobileView === 'note' ? 'flex w-full' : 'hidden md:flex'
            }`}
          >
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
              allNotes={notes}
              folders={folders}
              openTabs={activeTabsNotes}
              activeNoteId={activeNote.id}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSelectTab={handleSelectNote}
              onCloseTab={handleCloseTab}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onRestoreNote={handleRestoreNote}
              onOpenReminderModal={() => setIsReminderOpen(true)}
              onBackToNotes={() => setMobileView('list')}
            />

            {/* Note Body: Notion Document Mode or OneNote Infinite Canvas Mode or Timeline or Split */}
            <div className="flex-1 overflow-y-auto relative scrollbar-thin">
              {activeNote.viewMode === 'document' && (
                <BlockEditor
                  note={activeNote}
                  allNotes={notes}
                  onChange={(blocks: BlockItemType[]) =>
                    handleUpdateNote({ ...activeNote, blocks })
                  }
                  onNavigateSubpage={handleSelectNote}
                  onCreateSubpage={handleCreateSubpage}
                  onInlineTagsFound={handleInlineTagsFound}
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

              {activeNote.viewMode === 'timeline' && (
                <TimelineView
                  note={activeNote}
                  onChange={(blocks: BlockItemType[]) =>
                    handleUpdateNote({ ...activeNote, blocks })
                  }
                />
              )}

              {activeNote.viewMode === 'both' && (
                <div className="flex h-full w-full divide-x divide-black/10 dark:divide-white/10">
                  <div className="w-1/2 h-full overflow-y-auto scrollbar-thin">
                    <BlockEditor
                      note={activeNote}
                      allNotes={notes}
                      onChange={(blocks: BlockItemType[]) =>
                        handleUpdateNote({ ...activeNote, blocks })
                      }
                      onNavigateSubpage={handleSelectNote}
                      onCreateSubpage={handleCreateSubpage}
                      onInlineTagsFound={handleInlineTagsFound}
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
      </>
      )}

      {/* Floating Mobile Sidebar Trigger (shown only on list view when sidebar is closed) */}
      {mobileView === 'list' && !isSidebarOpenMobile && sidebarMode === 'notes' && (
        <button
          onClick={() => setIsSidebarOpenMobile(true)}
          className="fixed bottom-5 left-5 z-40 md:hidden p-3.5 rounded-full bg-amber-500 text-white shadow-apple-floating hover:bg-amber-600 active:scale-95 transition"
          title="Open Folders"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

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

      <APIExplorerModal
        isOpen={isAPIExplorerOpen}
        onClose={() => setIsAPIExplorerOpen(false)}
        apiServer={apiServer}
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
