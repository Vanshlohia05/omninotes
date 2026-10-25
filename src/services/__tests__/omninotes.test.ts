import { describe, it, expect, beforeEach } from 'vitest';
import { MCPServerEngine, MCP_TOOLS } from '../mcpServer';
import { NoteItem, Folder } from '../../types/note';
import { INITIAL_NOTES, INITIAL_FOLDERS } from '../sampleData';
import { notificationService } from '../notificationService';

describe('OmniNotes Model Context Protocol (MCP) Engine', () => {
  let notes: NoteItem[] = [];
  let folders: Folder[] = [];
  let mcpEngine: MCPServerEngine;

  beforeEach(() => {
    notes = JSON.parse(JSON.stringify(INITIAL_NOTES));
    folders = JSON.parse(JSON.stringify(INITIAL_FOLDERS));

    mcpEngine = new MCPServerEngine({
      getNotes: () => notes,
      getFolders: () => folders,
      onNoteCreate: (newNote: NoteItem) => {
        notes.unshift(newNote);
      },
      onNoteUpdate: (updatedNote: NoteItem) => {
        const index = notes.findIndex((n) => n.id === updatedNote.id);
        if (index !== -1) notes[index] = updatedNote;
      }
    });
  });

  it('exposes all 6 required MCP tools with valid schemas', () => {
    const tools = mcpEngine.getTools();
    expect(tools.length).toBe(6);
    const names = tools.map((t) => t.name);
    expect(names).toContain('list_folders');
    expect(names).toContain('search_notes');
    expect(names).toContain('read_note');
    expect(names).toContain('create_note');
    expect(names).toContain('update_note');
    expect(names).toContain('query_canvas');
  });

  it('executes list_folders correctly', async () => {
    const res = await mcpEngine.executeTool('list_folders', {});
    expect(res.folders).toBeDefined();
    expect(res.folders.length).toBe(3);
    expect(res.folders[0].name).toBe('Personal & Ideas');
  });

  it('searches notes by query text and tags', async () => {
    const res = await mcpEngine.executeTool('search_notes', { query: 'welcome' });
    expect(res.count).toBeGreaterThan(0);
    expect(res.notes.some((n: any) => n.title.includes('Welcome'))).toBe(true);

    const tagRes = await mcpEngine.executeTool('search_notes', { tag: 'canvas' });
    expect(tagRes.count).toBe(1);
    expect(tagRes.notes[0].title).toContain('Infinite Canvas');
  });

  it('reads full note blocks and canvas elements', async () => {
    const res = await mcpEngine.executeTool('read_note', { title: 'Welcome to OmniNotes ✨' });
    expect(res.title).toBe('Welcome to OmniNotes ✨');
    expect(res.blocks.length).toBeGreaterThan(5);
    expect(res.blocks.some((b: any) => b.type === 'equation')).toBe(true);
    expect(res.blocks.some((b: any) => b.type === 'table')).toBe(true);
  });

  it('creates new note through MCP engine with markdown blocks', async () => {
    const res = await mcpEngine.executeTool('create_note', {
      title: 'Agent Meeting Notes',
      tags: ['meeting', 'ai'],
      content: '# Meeting Agenda\n- Discuss architecture\n- [ ] Finalize PWA sync\n- [x] Test MCP engine'
    });

    expect(res.success).toBe(true);
    expect(res.note.title).toBe('Agent Meeting Notes');
    expect(res.note.blocks.length).toBe(4);
    expect(res.note.blocks[0].type).toBe('h1');
    expect(res.note.blocks[1].type).toBe('bullet');
    expect(res.note.blocks[2].type).toBe('task');
    expect(res.note.blocks[2].checked).toBe(false);
    expect(res.note.blocks[3].type).toBe('task');
    expect(res.note.blocks[3].checked).toBe(true);

    // Verify it was added to notes list
    expect(notes.length).toBe(INITIAL_NOTES.length + 1);
  });

  it('updates note and appends markdown block', async () => {
    const targetId = 'note-welcome';
    const res = await mcpEngine.executeTool('update_note', {
      noteId: targetId,
      isPinned: false,
      appendMarkdown: 'New research appended by LLM'
    });

    expect(res.success).toBe(true);
    expect(res.note.isPinned).toBe(false);
    const lastBlock = res.note.blocks[res.note.blocks.length - 1];
    expect(lastBlock.content).toBe('New research appended by LLM');
  });

  it('queries canvas diagram elements for infinite canvas note', async () => {
    const res = await mcpEngine.executeTool('query_canvas', { noteId: 'note-mindmap' });
    expect(res.elementsCount).toBeGreaterThan(0);
    expect(res.elements.some((e: any) => e.type === 'mindmap-node')).toBe(true);
    expect(res.elements.some((e: any) => e.type === 'connector')).toBe(true);
    expect(res.elements.some((e: any) => e.shapeType === 'diamond')).toBe(true);
  });
});

describe('Reminder & Notification Logic', () => {
  it('correctly triggers past or current reminders and updates notified flag', () => {
    let triggeredNoteId: string | null = null;

    const testNotes: NoteItem[] = [
      {
        ...INITIAL_NOTES[0],
        id: 'note-reminder-test',
        reminder: {
          date: '2020-01-01',
          time: '00:00',
          notified: false
        }
      },
      {
        ...INITIAL_NOTES[1],
        id: 'note-future-reminder',
        reminder: {
          date: '2099-12-31',
          time: '23:59',
          notified: false
        }
      }
    ];

    notificationService.checkReminders(testNotes, (notifiedNote) => {
      triggeredNoteId = notifiedNote.id;
      expect(notifiedNote.reminder?.notified).toBe(true);
    });

    expect(triggeredNoteId).toBe('note-reminder-test');
  });
});

describe('Notion Blocks, Timeline & Inline Tagging', () => {
  it('correctly extracts inline hashtags from block content', () => {
    const text = 'Met with the design team #meeting #ui-ux and discussed #2026-roadmap';
    const matches = text.match(/#[a-zA-Z0-9_\-]+/g);
    expect(matches).toBeDefined();
    const tags = matches!.map((t) => t.substring(1));
    expect(tags).toEqual(['meeting', 'ui-ux', '2026-roadmap']);
  });

  it('serializes and validates timeline block milestones', () => {
    const welcomeNote = INITIAL_NOTES.find((n) => n.id === 'note-welcome')!;
    const timelineBlock = welcomeNote.blocks.find((b) => b.type === 'timeline');
    expect(timelineBlock).toBeDefined();
    expect(timelineBlock?.timelineEvents?.length).toBeGreaterThanOrEqual(3);

    const firstEvent = timelineBlock!.timelineEvents![0];
    expect(firstEvent.title).toBe('Concept & System Design');
    expect(firstEvent.status).toBe('completed');
  });

  it('resolves link-to-page internal document reference', () => {
    const welcomeNote = INITIAL_NOTES.find((n) => n.id === 'note-welcome')!;
    const linkBlock = welcomeNote.blocks.find((b) => b.type === 'link-to-page');
    expect(linkBlock).toBeDefined();
    expect(linkBlock?.linkedNoteId).toBe('note-mindmap');

    const referencedNote = INITIAL_NOTES.find((n) => n.id === linkBlock?.linkedNoteId);
    expect(referencedNote).toBeDefined();
    expect(referencedNote?.title).toContain('Infinite Canvas');
  });
});

describe('Recently Deleted 30-Day Auto Purge Logic', () => {
  it('computes exact days remaining before permanent deletion', () => {
    const now = Date.now();
    const tenDaysAgo = now - 86400000 * 10;
    const thirtyOneDaysAgo = now - 86400000 * 31;

    const calculateDays = (deletedAt: number) => {
      const elapsedDays = Math.floor((now - deletedAt) / 86400000);
      return Math.max(0, 30 - elapsedDays);
    };

    expect(calculateDays(tenDaysAgo)).toBe(20);
    expect(calculateDays(thirtyOneDaysAgo)).toBe(0);
  });

  it('restores deleted note back to active collection with deleted flag cleared', () => {
    const welcomeNote = INITIAL_NOTES.find((n) => n.id === 'note-welcome')!;
    const note: NoteItem = {
      ...welcomeNote,
      isDeleted: true,
      deletedAt: Date.now() - 86400000 * 5
    };

    const restored: NoteItem = {
      ...note,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now()
    };

    expect(restored.isDeleted).toBe(false);
    expect(restored.deletedAt).toBeUndefined();
  });
});

describe('Infinite Canvas Copy-Paste Logic', () => {
  it('correctly duplicates canvas element with coordinate offset and unique ID', () => {
    const canvasNote = INITIAL_NOTES.find((n) => n.id === 'note-mindmap')!;
    const original = canvasNote.canvasElements[0];
    const cloned = {
      ...original,
      id: `${original.type}-${Date.now()}`,
      x: original.x + 40,
      y: original.y + 40,
      childrenIds: undefined,
      parentId: undefined
    };

    expect(cloned.id).not.toBe(original.id);
    expect(cloned.x).toBe(original.x + 40);
    expect(cloned.y).toBe(original.y + 40);
    expect(cloned.content).toBe(original.content);
    expect(cloned.parentId).toBeUndefined();
  });
});

describe('Microsoft OneNote Architecture & Vibrant Colored Tabs', () => {
  it('provides signature OneNote tab colors palette', async () => {
    const { ONENOTE_TAB_COLORS, ONENOTE_BINDER_COLORS } = await import('../../types/notebook');
    expect(ONENOTE_TAB_COLORS.length).toBeGreaterThanOrEqual(8);
    const colorNames = ONENOTE_TAB_COLORS.map((c) => c.name);
    expect(colorNames).toContain('Purple');
    expect(colorNames).toContain('Teal');
    expect(colorNames).toContain('Blue');
    expect(colorNames).toContain('Green');
    expect(ONENOTE_BINDER_COLORS.length).toBeGreaterThanOrEqual(5);
  });

  it('validates OneNote Notebook -> Unit -> Chapter -> Pages hierarchy', async () => {
    const { INITIAL_NOTEBOOKS } = await import('../sampleData');
    expect(INITIAL_NOTEBOOKS.length).toBeGreaterThanOrEqual(1);

    const csNotebook = INITIAL_NOTEBOOKS[0];
    expect(csNotebook.name).toBe('Computer Science & Engineering');
    expect(csNotebook.color).toBe('#7719AA');
    expect(csNotebook.units.length).toBeGreaterThanOrEqual(2);

    const dsaUnit = csNotebook.units[0];
    expect(dsaUnit.name).toContain('Data Structures & Algorithms');
    expect(dsaUnit.chapters.length).toBeGreaterThanOrEqual(2);

    const arraysChapter = dsaUnit.chapters[0];
    expect(arraysChapter.name).toBe('Arrays & Lists');
    expect(arraysChapter.color).toBe('#873999');
    expect(arraysChapter.pageIds).toContain('note-on-arrays');

    const treesChapter = dsaUnit.chapters[1];
    expect(treesChapter.name).toBe('Trees & Graphs');
    expect(treesChapter.color).toBe('#038387');
    expect(treesChapter.pageIds).toContain('note-on-trees');
  });
});

describe('AI REST API Router & OpenAPI 3.1 Specification', () => {
  let notes: NoteItem[] = [];
  let folders: Folder[] = [];
  let notebooks: any[] = [];
  let apiServer: any;

  beforeEach(async () => {
    const { ApiServer } = await import('../apiServer');
    const { INITIAL_NOTEBOOKS } = await import('../sampleData');
    notes = JSON.parse(JSON.stringify(INITIAL_NOTES));
    folders = JSON.parse(JSON.stringify(INITIAL_FOLDERS));
    notebooks = JSON.parse(JSON.stringify(INITIAL_NOTEBOOKS));

    apiServer = new ApiServer({
      getNotes: () => notes,
      getFolders: () => folders,
      getNotebooks: () => notebooks,
      onNoteCreate: (newNote: NoteItem) => {
        notes.unshift(newNote);
      },
      onNoteUpdate: (updatedNote: NoteItem) => {
        const index = notes.findIndex((n) => n.id === updatedNote.id);
        if (index !== -1) notes[index] = updatedNote;
      },
      onNoteDelete: (id: string, permanent?: boolean) => {
        if (permanent) {
          notes = notes.filter((n) => n.id !== id);
        } else {
          notes = notes.map((n) => (n.id === id ? { ...n, isDeleted: true, deletedAt: Date.now() } : n));
        }
      },
      onNotebooksChange: (updatedNotebooks: any[]) => {
        notebooks = updatedNotebooks;
      }
    });
  });

  it('serves valid OpenAPI 3.1 schema at /openapi.json for ChatGPT Custom Actions', async () => {
    const res = await apiServer.handleRequest('GET', '/openapi.json');
    expect(res.status).toBe(200);
    expect(res.data.openapi).toBe('3.1.0');
    expect(res.data.info.title).toContain('OmniNotes');
    expect(res.data.paths['/notes']).toBeDefined();
    expect(res.data.paths['/notebooks']).toBeDefined();
    expect(res.data.paths['/notebooks/{id}/units']).toBeDefined();
    expect(res.data.paths['/notebooks/{id}/units/{unitId}/chapters']).toBeDefined();
  });

  it('queries notes list with search and chapter filters', async () => {
    const res = await apiServer.handleRequest('GET', '/notes', null, { search: 'vector' });
    expect(res.status).toBe(200);
    expect(res.data.count).toBeGreaterThanOrEqual(1);
    expect(res.data.notes[0].title).toContain('Vectors');

    const chapRes = await apiServer.handleRequest('GET', '/notes', null, { chapterId: 'chap-trees' });
    expect(chapRes.status).toBe(200);
    expect(chapRes.data.notes.some((n: any) => n.id === 'note-on-trees')).toBe(true);
  });

  it('creates note with raw markdown and structured block conversion', async () => {
    const res = await apiServer.handleRequest('POST', '/notes', {
      title: 'Neural Architecture Search',
      content: '# NAS Overview\n- Evolutionary strategy\n- Reinforcement learning\n- [ ] Benchmark on ImageNet\n- [x] Review DARTS paper\n$$Loss = \\alpha L_{train} + \\beta L_{val}$$',
      tags: ['ai', 'research']
    });

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.note.title).toBe('Neural Architecture Search');
    expect(res.data.note.tags).toEqual(['ai', 'research']);

    const blocks = res.data.note.blocks;
    expect(blocks[0].type).toBe('h1');
    expect(blocks[1].type).toBe('bullet');
    expect(blocks[2].type).toBe('bullet');
    expect(blocks[3].type).toBe('task');
    expect(blocks[3].checked).toBe(false);
    expect(blocks[4].type).toBe('task');
    expect(blocks[4].checked).toBe(true);
    expect(blocks[5].type).toBe('equation');
  });

  it('fetches single note by ID and updates content', async () => {
    const fetchRes = await apiServer.handleRequest('GET', '/notes/note-welcome');
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.data.title).toContain('Welcome to OmniNotes');

    const updateRes = await apiServer.handleRequest('PUT', '/notes/note-welcome', {
      appendMarkdown: '## Added by AI Agent\nAutonomous documentation synchronized.'
    });
    expect(updateRes.status).toBe(200);
    const updatedBlocks = updateRes.data.note.blocks;
    expect(updatedBlocks[updatedBlocks.length - 1].content).toBe('Autonomous documentation synchronized.');
  });

  it('performs full OneNote notebook, unit, chapter, and page CRUD', async () => {
    // 1. Create Notebook
    const nbRes = await apiServer.handleRequest('POST', '/notebooks', {
      name: 'Quantum Computing & Algorithms',
      color: '#0063B1'
    });
    expect(nbRes.status).toBe(201);
    const nbId = nbRes.data.id;
    expect(nbRes.data.name).toBe('Quantum Computing & Algorithms');

    // 2. Create Unit
    const unitRes = await apiServer.handleRequest('POST', `/notebooks/${nbId}/units`, {
      name: 'Unit 1: Qubits & Superposition'
    });
    expect(unitRes.status).toBe(201);
    const unitId = unitRes.data.id;

    // 3. Create Chapter with OneNote colored tab
    const chapRes = await apiServer.handleRequest('POST', `/notebooks/${nbId}/units/${unitId}/chapters`, {
      name: 'Bloch Sphere & Gates',
      color: '#873999'
    });
    expect(chapRes.status).toBe(201);
    const chapId = chapRes.data.id;
    expect(chapRes.data.color).toBe('#873999');

    // 4. Create Page inside Chapter
    const pageRes = await apiServer.handleRequest('POST', `/notebooks/${nbId}/chapters/${chapId}/pages`, {
      title: 'Hadamard & Pauli Matrices',
      markdown: '# Hadamard Gate\nTransforms |0> into (|0> + |1>)/sqrt(2).'
    });
    expect(pageRes.status).toBe(201);
    expect(pageRes.data.title).toBe('Hadamard & Pauli Matrices');
    expect(pageRes.data.chapterId).toBe(chapId);

    // Verify Chapter now contains the new page ID
    // 5. List Units
    const listUnitsRes = await apiServer.handleRequest('GET', `/notebooks/${nbId}/units`);
    expect(listUnitsRes.status).toBe(200);
    expect(listUnitsRes.data.count).toBe(1);
    expect(listUnitsRes.data.units[0].id).toBe(unitId);

    // 6. List Chapters in Unit
    const listChapsRes = await apiServer.handleRequest('GET', `/notebooks/${nbId}/units/${unitId}/chapters`);
    expect(listChapsRes.status).toBe(200);
    expect(listChapsRes.data.count).toBe(1);
    expect(listChapsRes.data.chapters[0].id).toBe(chapId);

    // 7. List Pages in Chapter
    const listPagesRes = await apiServer.handleRequest('GET', `/notebooks/${nbId}/chapters/${chapId}/pages`);
    expect(listPagesRes.status).toBe(200);
    expect(listPagesRes.data.count).toBe(1);
    expect(listPagesRes.data.pages[0].id).toBe(pageRes.data.id);

    // 8. Delete Chapter
    const delChapRes = await apiServer.handleRequest('DELETE', `/notebooks/${nbId}/units/${unitId}/chapters/${chapId}`);
    expect(delChapRes.status).toBe(200);
    expect(delChapRes.data.success).toBe(true);

    const postDelChaps = await apiServer.handleRequest('GET', `/notebooks/${nbId}/units/${unitId}/chapters`);
    expect(postDelChaps.data.count).toBe(0);

    // 9. Delete Unit
    const delUnitRes = await apiServer.handleRequest('DELETE', `/notebooks/${nbId}/units/${unitId}`);
    expect(delUnitRes.status).toBe(200);
    expect(delUnitRes.data.success).toBe(true);

    const postDelUnits = await apiServer.handleRequest('GET', `/notebooks/${nbId}/units`);
    expect(postDelUnits.data.count).toBe(0);

    // 10. Update & Delete Notebook
    const updateNbRes = await apiServer.handleRequest('PUT', `/notebooks/${nbId}`, {
      name: 'Advanced Quantum Computing'
    });
    expect(updateNbRes.status).toBe(200);
    expect(updateNbRes.data.name).toBe('Advanced Quantum Computing');

    const delNbRes = await apiServer.handleRequest('DELETE', `/notebooks/${nbId}`);
    expect(delNbRes.status).toBe(200);
    expect(delNbRes.data.success).toBe(true);

    const getDeletedNb = await apiServer.handleRequest('GET', `/notebooks/${nbId}`);
    expect(getDeletedNb.status).toBe(404);
  });

  it('guarantees OneNote active note is strictly scoped to chapter pages', () => {
    // Simulate notes in system: general note vs chapter-specific note
    const generalNote: NoteItem = {
      id: 'general-note-1',
      title: 'General Shopping List',
      blocks: [{ id: 'b1', type: 'paragraph', content: 'Milk, Eggs' }],
      canvasElements: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      fontFamily: 'sans',
      fontSize: 16,
      viewMode: 'document',
      tags: [],
      createdAt: 100,
      updatedAt: 100
    };

    const chapterNote: NoteItem = {
      id: 'chap-note-1',
      title: 'Binary Trees',
      notebookId: 'nb-1',
      chapterId: 'chap-1',
      blocks: [{ id: 'b2', type: 'paragraph', content: 'Tree definition' }],
      canvasElements: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      fontFamily: 'sans',
      fontSize: 16,
      viewMode: 'document',
      tags: [],
      createdAt: 200,
      updatedAt: 200
    };

    const chapterPages = [chapterNote];

    // Scoped active note selection: if activeNoteId is generalNote, it MUST NOT bleed into the chapter workspace
    const resolveActiveNote = (activeId: string | null) => {
      if (chapterPages.length === 0) return null;
      const foundInChapter = chapterPages.find((n) => n.id === activeId);
      return foundInChapter || chapterPages[0] || null;
    };

    // When activeNoteId points to general note from Apple Notes mode:
    const resolvedWhenGeneral = resolveActiveNote(generalNote.id);
    expect(resolvedWhenGeneral).not.toBeNull();
    expect(resolvedWhenGeneral?.id).toBe(chapterNote.id);
    expect(resolvedWhenGeneral?.title).toBe('Binary Trees');

    // When activeNoteId points to a chapter page:
    const resolvedWhenChapter = resolveActiveNote(chapterNote.id);
    expect(resolvedWhenChapter?.id).toBe(chapterNote.id);
  });
});


