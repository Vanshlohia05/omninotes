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
    expect(res.notes[0].title).toContain('Welcome');

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
