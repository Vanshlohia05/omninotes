import { NoteItem, Folder, BlockItem, CanvasElement } from '../types/note';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'list_folders',
    description: 'Lists all available note folders in OmniNotes vault',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_notes',
    description: 'Searches notes by text query, tag, or folder ID',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term matching title or content' },
        tag: { type: 'string', description: 'Filter by tag (without #)' },
        folderId: { type: 'string', description: 'Filter by folder ID' },
        includeArchived: { type: 'boolean', description: 'Whether to include archived notes' }
      }
    }
  },
  {
    name: 'read_note',
    description: 'Reads full content, blocks, and metadata of a specific note by ID or title',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string', description: 'Unique identifier of the note' },
        title: { type: 'string', description: 'Exact or fuzzy title of the note' }
      }
    }
  },
  {
    name: 'create_note',
    description: 'Creates a new note with Notion-style blocks and Apple Notes styling',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the note' },
        folderId: { type: 'string', description: 'Target folder ID (optional)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to associate' },
        content: { type: 'string', description: 'Initial plain text or markdown content' },
        viewMode: { type: 'string', enum: ['document', 'canvas', 'both'], description: 'Default view' }
      },
      required: ['title']
    }
  },
  {
    name: 'update_note',
    description: 'Appends blocks or updates content of an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string', description: 'Target note ID' },
        appendMarkdown: { type: 'string', description: 'Markdown to parse and append as blocks' },
        isPinned: { type: 'boolean', description: 'Pin/unpin the note' },
        color: { type: 'string', description: 'Card color tint (hex)' }
      },
      required: ['noteId']
    }
  },
  {
    name: 'query_canvas',
    description: 'Queries infinite canvas shapes, mind map trees, and diagram elements of a note',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string', description: 'Target note ID' }
      },
      required: ['noteId']
    }
  }
];

export class MCPServerEngine {
  private getNotes: () => NoteItem[];
  private getFolders: () => Folder[];
  private onNoteCreate: (note: NoteItem) => void;
  private onNoteUpdate: (note: NoteItem) => void;

  constructor(handlers: {
    getNotes: () => NoteItem[];
    getFolders: () => Folder[];
    onNoteCreate: (note: NoteItem) => void;
    onNoteUpdate: (note: NoteItem) => void;
  }) {
    this.getNotes = handlers.getNotes;
    this.getFolders = handlers.getFolders;
    this.onNoteCreate = handlers.onNoteCreate;
    this.onNoteUpdate = handlers.onNoteUpdate;
  }

  getTools(): MCPToolDefinition[] {
    return MCP_TOOLS;
  }

  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const notes = this.getNotes();
    const folders = this.getFolders();

    switch (name) {
      case 'list_folders': {
        return {
          folders: folders.map((f) => ({
            id: f.id,
            name: f.name,
            color: f.color,
            notesCount: notes.filter((n) => !n.isDeleted && n.folderId === f.id).length
          }))
        };
      }

      case 'search_notes': {
        const query = (args.query || '').toLowerCase();
        const tag = (args.tag || '').toLowerCase();
        const folderId = args.folderId;
        const includeArchived = !!args.includeArchived;

        const results = notes.filter((n) => {
          if (n.isDeleted) return false;
          if (!includeArchived && n.isArchived) return false;
          if (folderId && n.folderId !== folderId) return false;
          if (tag && !n.tags.some((t) => t.toLowerCase() === tag)) return false;

          if (query) {
            const titleMatch = n.title.toLowerCase().includes(query);
            const tagMatch = n.tags.some((t) => t.toLowerCase().includes(query));
            const blockMatch = n.blocks.some((b) => b.content.toLowerCase().includes(query));
            return titleMatch || tagMatch || blockMatch;
          }
          return true;
        });

        return {
          count: results.length,
          notes: results.map((n) => ({
            id: n.id,
            title: n.title,
            tags: n.tags,
            folderId: n.folderId,
            isPinned: n.isPinned,
            viewMode: n.viewMode,
            snippet: n.blocks[0]?.content.slice(0, 150) || '',
            updatedAt: new Date(n.updatedAt).toISOString()
          }))
        };
      }

      case 'read_note': {
        const note = notes.find(
          (n) =>
            (args.noteId && n.id === args.noteId) ||
            (args.title && n.title.toLowerCase() === args.title.toLowerCase())
        );

        if (!note) {
          throw new Error(`Note not found: ${args.noteId || args.title}`);
        }

        return {
          id: note.id,
          title: note.title,
          tags: note.tags,
          folderId: note.folderId,
          viewMode: note.viewMode,
          blocksCount: note.blocks.length,
          canvasElementsCount: note.canvasElements?.length || 0,
          blocks: note.blocks,
          canvasSummary: note.canvasElements?.map((e) => ({
            type: e.type,
            shape: e.shapeType,
            content: e.content
          }))
        };
      }

      case 'create_note': {
        const rawContent = args.content || '';
        const lines = rawContent.split('\n').filter((l: string) => l.trim().length > 0);
        const blocks: BlockItem[] =
          lines.length > 0
            ? lines.map((line: string, i: number) => {
                if (line.startsWith('# ')) {
                  return { id: `block-${Date.now()}-${i}`, type: 'h1', content: line.replace('# ', '') };
                } else if (line.startsWith('## ')) {
                  return { id: `block-${Date.now()}-${i}`, type: 'h2', content: line.replace('## ', '') };
                } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                  return {
                    id: `block-${Date.now()}-${i}`,
                    type: 'task',
                    checked: line.startsWith('- [x] '),
                    content: line.replace(/- \[[ x]\] /, '')
                  };
                } else if (line.startsWith('- ')) {
                  return { id: `block-${Date.now()}-${i}`, type: 'bullet', content: line.replace('- ', '') };
                }
                return { id: `block-${Date.now()}-${i}`, type: 'paragraph', content: line };
              })
            : [{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }];

        const newNote: NoteItem = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: args.title,
          folderId: args.folderId || undefined,
          isPinned: false,
          isArchived: false,
          isDeleted: false,
          tags: Array.isArray(args.tags) ? args.tags : [],
          fontFamily: 'sans',
          fontSize: 16,
          viewMode: args.viewMode || 'document',
          blocks,
          canvasElements: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        this.onNoteCreate(newNote);
        return { success: true, note: newNote };
      }

      case 'update_note': {
        const note = notes.find((n) => n.id === args.noteId);
        if (!note) throw new Error(`Note not found: ${args.noteId}`);

        const updatedNote = { ...note, updatedAt: Date.now() };

        if (args.isPinned !== undefined) {
          updatedNote.isPinned = args.isPinned;
        }
        if (args.color) {
          updatedNote.color = args.color;
        }

        if (args.appendMarkdown) {
          const newBlock: BlockItem = {
            id: `block-${Date.now()}`,
            type: 'paragraph',
            content: args.appendMarkdown
          };
          updatedNote.blocks = [...updatedNote.blocks, newBlock];
        }

        this.onNoteUpdate(updatedNote);
        return { success: true, note: updatedNote };
      }

      case 'query_canvas': {
        const note = notes.find((n) => n.id === args.noteId);
        if (!note) throw new Error(`Note not found: ${args.noteId}`);
        return {
          noteId: note.id,
          title: note.title,
          elementsCount: note.canvasElements?.length || 0,
          elements: note.canvasElements || []
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
