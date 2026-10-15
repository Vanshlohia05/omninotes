import { NoteItem, Folder, BlockItem, BlockType } from '../types/note';
import { Notebook, NotebookUnit, NotebookChapter, ONENOTE_TAB_COLORS } from '../types/notebook';
import { OPENAPI_SPEC } from './openapiSpec';

export interface ApiServerContext {
  getNotes: () => NoteItem[];
  getFolders: () => Folder[];
  getNotebooks: () => Notebook[];
  onNoteCreate: (note: NoteItem) => void;
  onNoteUpdate: (note: NoteItem) => void;
  onNoteDelete: (id: string, permanent?: boolean) => void;
  onNotebooksChange: (notebooks: Notebook[]) => void;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  error?: string;
}

export class ApiServer {
  private ctx: ApiServerContext;

  constructor(ctx: ApiServerContext) {
    this.ctx = ctx;
  }

  public updateContext(ctx: Partial<ApiServerContext>) {
    this.ctx = { ...this.ctx, ...ctx };
  }

  /**
   * Universal simulated request handler
   */
  public async handleRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body: any = null,
    query: Record<string, string> = {}
  ): Promise<ApiResponse> {
    const cleanPath = path.replace(/^\/api/, '').replace(/\/$/, '') || '/';

    // GET /openapi.json
    if (cleanPath === '/openapi.json' && method === 'GET') {
      return { status: 200, data: OPENAPI_SPEC };
    }

    // --- NOTES CRUD ---
    // GET /notes
    if (cleanPath === '/notes' && method === 'GET') {
      let notes = this.ctx.getNotes().filter((n) => !n.isDeleted);

      if (query.search) {
        const q = query.search.toLowerCase();
        notes = notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)) ||
            n.blocks.some((b) => b.content.toLowerCase().includes(q))
        );
      }
      if (query.folder) {
        notes = notes.filter((n) => n.folderId === query.folder);
      }
      if (query.tag) {
        notes = notes.filter((n) => n.tags.some((t) => t.toLowerCase() === query.tag.toLowerCase()));
      }
      if (query.notebookId) {
        notes = notes.filter((n) => n.notebookId === query.notebookId);
      }
      if (query.chapterId) {
        notes = notes.filter((n) => n.chapterId === query.chapterId);
      }

      return {
        status: 200,
        data: {
          count: notes.length,
          notes: notes.map((n) => ({
            id: n.id,
            title: n.title,
            folderId: n.folderId,
            notebookId: n.notebookId,
            unitId: n.unitId,
            chapterId: n.chapterId,
            tags: n.tags,
            isPinned: n.isPinned,
            updatedAt: n.updatedAt,
            snippet: n.blocks.find((b) => b.content.trim().length > 0)?.content || ''
          }))
        }
      };
    }

    // POST /notes
    if (cleanPath === '/notes' && method === 'POST') {
      if (!body || !body.title) {
        return { status: 400, data: null, error: 'Missing required field: title' };
      }

      const blocks: BlockItem[] = [];
      if (body.content) {
        blocks.push(...this.parseMarkdownToBlocks(body.content));
      } else if (body.blocks && Array.isArray(body.blocks)) {
        blocks.push(...body.blocks);
      } else {
        blocks.push({ id: `b-${Date.now()}-1`, type: 'paragraph', content: '' });
      }

      const newNote: NoteItem = {
        id: body.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: body.title,
        folderId: body.folderId,
        notebookId: body.notebookId,
        unitId: body.unitId,
        chapterId: body.chapterId,
        isPinned: !!body.isPinned,
        isArchived: false,
        isDeleted: false,
        tags: Array.isArray(body.tags) ? body.tags : [],
        fontFamily: 'sans',
        fontSize: 16,
        viewMode: body.viewMode || 'document',
        blocks,
        canvasElements: body.canvasElements || [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.ctx.onNoteCreate(newNote);

      // If chapterId is specified, also append note id to that chapter
      if (newNote.notebookId && newNote.chapterId) {
        this.addPageToChapter(newNote.notebookId, newNote.chapterId, newNote.id);
      }

      return { status: 201, data: { success: true, note: newNote } };
    }

    // Match /notes/:id
    const noteIdMatch = cleanPath.match(/^\/notes\/([^/]+)$/);
    if (noteIdMatch) {
      const noteId = noteIdMatch[1];
      const existing = this.ctx.getNotes().find((n) => n.id === noteId);

      if (!existing) {
        return { status: 404, data: null, error: `Note not found with id: ${noteId}` };
      }

      if (method === 'GET') {
        return { status: 200, data: existing };
      }

      if (method === 'PUT') {
        const updated: NoteItem = {
          ...existing,
          title: body.title !== undefined ? body.title : existing.title,
          tags: Array.isArray(body.tags) ? body.tags : existing.tags,
          isPinned: body.isPinned !== undefined ? body.isPinned : existing.isPinned,
          isArchived: body.isArchived !== undefined ? body.isArchived : existing.isArchived,
          updatedAt: Date.now()
        };

        if (body.appendMarkdown) {
          const appendedBlocks = this.parseMarkdownToBlocks(body.appendMarkdown);
          updated.blocks = [...updated.blocks, ...appendedBlocks];
        }

        if (body.blocks && Array.isArray(body.blocks)) {
          updated.blocks = body.blocks;
        }

        if (body.canvasElements && Array.isArray(body.canvasElements)) {
          updated.canvasElements = body.canvasElements;
        }

        this.ctx.onNoteUpdate(updated);
        return { status: 200, data: { success: true, note: updated } };
      }

      if (method === 'DELETE') {
        const isPermanent = query.permanent === 'true';
        this.ctx.onNoteDelete(noteId, isPermanent);
        return {
          status: 200,
          data: {
            success: true,
            message: isPermanent ? `Note permanently deleted` : `Note moved to trash`
          }
        };
      }
    }

    // --- NOTEBOOKS CRUD ---
    // GET /notebooks
    if (cleanPath === '/notebooks' && method === 'GET') {
      const notebooks = this.ctx.getNotebooks();
      return {
        status: 200,
        data: { count: notebooks.length, notebooks }
      };
    }

    // POST /notebooks
    if (cleanPath === '/notebooks' && method === 'POST') {
      if (!body || !body.name) {
        return { status: 400, data: null, error: 'Missing required field: name' };
      }
      const notebooks = this.ctx.getNotebooks();
      const newNotebook: Notebook = {
        id: `nb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: body.name,
        color: body.color || '#7719AA',
        icon: body.icon || '📓',
        units: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updatedList = [newNotebook, ...notebooks];
      this.ctx.onNotebooksChange(updatedList);
      return { status: 201, data: newNotebook };
    }

    // Match /notebooks/:id
    const nbIdMatch = cleanPath.match(/^\/notebooks\/([^/]+)$/);
    if (nbIdMatch) {
      const nbId = nbIdMatch[1];
      const notebooks = this.ctx.getNotebooks();
      const existing = notebooks.find((nb) => nb.id === nbId);
      if (!existing) {
        return { status: 404, data: null, error: `Notebook not found with id: ${nbId}` };
      }

      if (method === 'GET') {
        return { status: 200, data: existing };
      }

      if (method === 'PUT') {
        const updated = notebooks.map((nb) =>
          nb.id === nbId
            ? {
                ...nb,
                name: body.name || nb.name,
                color: body.color || nb.color,
                icon: body.icon || nb.icon,
                updatedAt: Date.now()
              }
            : nb
        );
        this.ctx.onNotebooksChange(updated);
        return { status: 200, data: updated.find((nb) => nb.id === nbId) };
      }

      if (method === 'DELETE') {
        const filtered = notebooks.filter((nb) => nb.id !== nbId);
        this.ctx.onNotebooksChange(filtered);
        return { status: 200, data: { success: true, message: `Notebook ${nbId} deleted` } };
      }
    }

    // /notebooks/:id/units
    const nbUnitMatch = cleanPath.match(/^\/notebooks\/([^/]+)\/units$/);
    if (nbUnitMatch) {
      const nbId = nbUnitMatch[1];
      const notebooks = this.ctx.getNotebooks();
      const notebook = notebooks.find((nb) => nb.id === nbId);
      if (!notebook) {
        return { status: 404, data: null, error: `Notebook not found: ${nbId}` };
      }

      if (method === 'GET') {
        return { status: 200, data: { count: notebook.units.length, units: notebook.units } };
      }

      if (method === 'POST') {
        if (!body || !body.name) {
          return { status: 400, data: null, error: 'Missing required field: name' };
        }

        const newUnit: NotebookUnit = {
          id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          notebookId: nbId,
          name: body.name,
          chapters: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        const updated = notebooks.map((nb) =>
          nb.id === nbId ? { ...nb, units: [...nb.units, newUnit], updatedAt: Date.now() } : nb
        );
        this.ctx.onNotebooksChange(updated);
        return { status: 201, data: newUnit };
      }
    }

    // /notebooks/:id/units/:unitId
    const nbSingleUnitMatch = cleanPath.match(/^\/notebooks\/([^/]+)\/units\/([^/]+)$/);
    if (nbSingleUnitMatch) {
      const nbId = nbSingleUnitMatch[1];
      const unitId = nbSingleUnitMatch[2];
      const notebooks = this.ctx.getNotebooks();
      const notebook = notebooks.find((nb) => nb.id === nbId);
      if (!notebook) return { status: 404, data: null, error: `Notebook not found: ${nbId}` };

      const unit = notebook.units.find((u) => u.id === unitId);
      if (!unit) return { status: 404, data: null, error: `Unit not found: ${unitId}` };

      if (method === 'GET') {
        return { status: 200, data: unit };
      }

      if (method === 'DELETE') {
        const updated = notebooks.map((nb) =>
          nb.id === nbId
            ? { ...nb, units: nb.units.filter((u) => u.id !== unitId), updatedAt: Date.now() }
            : nb
        );
        this.ctx.onNotebooksChange(updated);
        return { status: 200, data: { success: true, message: `Unit ${unitId} deleted` } };
      }
    }

    // /notebooks/:id/units/:unitId/chapters
    const nbChapterMatch = cleanPath.match(/^\/notebooks\/([^/]+)\/units\/([^/]+)\/chapters$/);
    if (nbChapterMatch) {
      const nbId = nbChapterMatch[1];
      const unitId = nbChapterMatch[2];
      const notebooks = this.ctx.getNotebooks();
      const notebook = notebooks.find((nb) => nb.id === nbId);
      if (!notebook) return { status: 404, data: null, error: `Notebook not found: ${nbId}` };

      const unit = notebook.units.find((u) => u.id === unitId);
      if (!unit) return { status: 404, data: null, error: `Unit not found: ${unitId}` };

      if (method === 'GET') {
        return { status: 200, data: { count: unit.chapters.length, chapters: unit.chapters } };
      }

      if (method === 'POST') {
        if (!body || !body.name) {
          return { status: 400, data: null, error: 'Missing required field: name' };
        }

        const defaultColor = ONENOTE_TAB_COLORS[unit.chapters.length % ONENOTE_TAB_COLORS.length].hex;
        const newChapter: NotebookChapter = {
          id: `chap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          notebookId: nbId,
          unitId,
          name: body.name,
          color: body.color || defaultColor,
          pageIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        const updated = notebooks.map((nb) => {
          if (nb.id !== nbId) return nb;
          return {
            ...nb,
            units: nb.units.map((u) =>
              u.id === unitId ? { ...u, chapters: [...u.chapters, newChapter], updatedAt: Date.now() } : u
            ),
            updatedAt: Date.now()
          };
        });

        this.ctx.onNotebooksChange(updated);
        return { status: 201, data: newChapter };
      }
    }

    // /notebooks/:id/units/:unitId/chapters/:chapterId
    const nbSingleChapterMatch = cleanPath.match(/^\/notebooks\/([^/]+)\/units\/([^/]+)\/chapters\/([^/]+)$/);
    if (nbSingleChapterMatch) {
      const nbId = nbSingleChapterMatch[1];
      const unitId = nbSingleChapterMatch[2];
      const chapterId = nbSingleChapterMatch[3];
      const notebooks = this.ctx.getNotebooks();
      const notebook = notebooks.find((nb) => nb.id === nbId);
      if (!notebook) return { status: 404, data: null, error: `Notebook not found: ${nbId}` };

      const unit = notebook.units.find((u) => u.id === unitId);
      if (!unit) return { status: 404, data: null, error: `Unit not found: ${unitId}` };

      const chapter = unit.chapters.find((c) => c.id === chapterId);
      if (!chapter) return { status: 404, data: null, error: `Chapter not found: ${chapterId}` };

      if (method === 'GET') {
        return { status: 200, data: chapter };
      }

      if (method === 'DELETE') {
        const updated = notebooks.map((nb) => {
          if (nb.id !== nbId) return nb;
          return {
            ...nb,
            units: nb.units.map((u) =>
              u.id === unitId ? { ...u, chapters: u.chapters.filter((c) => c.id !== chapterId), updatedAt: Date.now() } : u
            ),
            updatedAt: Date.now()
          };
        });
        this.ctx.onNotebooksChange(updated);
        return { status: 200, data: { success: true, message: `Chapter ${chapterId} deleted` } };
      }
    }

    // /notebooks/:id/chapters/:chapterId/pages
    const nbPageMatch = cleanPath.match(/^\/notebooks\/([^/]+)\/chapters\/([^/]+)\/pages$/);
    if (nbPageMatch) {
      const nbId = nbPageMatch[1];
      const chapterId = nbPageMatch[2];

      if (method === 'GET') {
        const pages = this.ctx
          .getNotes()
          .filter((n) => !n.isDeleted && (n.chapterId === chapterId || (n.notebookId === nbId && n.chapterId === chapterId)));
        return {
          status: 200,
          data: {
            count: pages.length,
            pages: pages.map((n) => ({
              id: n.id,
              title: n.title,
              notebookId: n.notebookId,
              chapterId: n.chapterId,
              updatedAt: n.updatedAt,
              snippet: n.blocks.find((b) => b.content.trim().length > 0)?.content || ''
            }))
          }
        };
      }

      if (method === 'POST') {
        if (!body || !body.title) {
          return { status: 400, data: null, error: 'Missing required field: title' };
        }

        const blocks: BlockItem[] = [];
        if (body.markdown) {
          blocks.push(...this.parseMarkdownToBlocks(body.markdown));
        } else {
          blocks.push({ id: `b-${Date.now()}-1`, type: 'paragraph', content: '' });
        }

        const pageNote: NoteItem = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: body.title,
          notebookId: nbId,
          chapterId,
          isPinned: false,
          isArchived: false,
          isDeleted: false,
          tags: Array.isArray(body.tags) ? body.tags : [],
          fontFamily: 'sans',
          fontSize: 16,
          viewMode: body.viewMode || 'document',
          blocks,
          canvasElements: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        this.ctx.onNoteCreate(pageNote);
        this.addPageToChapter(nbId, chapterId, pageNote.id);

        return { status: 201, data: pageNote };
      }
    }

    return { status: 404, data: null, error: `Route not found: ${method} ${path}` };
  }

  private addPageToChapter(notebookId: string, chapterId: string, pageId: string) {
    const notebooks = this.ctx.getNotebooks();
    const updated = notebooks.map((nb) => {
      if (nb.id !== notebookId) return nb;
      return {
        ...nb,
        units: nb.units.map((unit) => ({
          ...unit,
          chapters: unit.chapters.map((chap) => {
            if (chap.id !== chapterId) return chap;
            if (chap.pageIds.includes(pageId)) return chap;
            return {
              ...chap,
              pageIds: [...chap.pageIds, pageId],
              updatedAt: Date.now()
            };
          })
        }))
      };
    });
    this.ctx.onNotebooksChange(updated);
  }

  /**
   * Helper: Parse Markdown string into structured Notion/OneNote blocks
   */
  public parseMarkdownToBlocks(content: string): BlockItem[] {
    const lines = content.split('\n');
    const blocks: BlockItem[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const id = `b-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 3)}`;

      if (trimmed.startsWith('# ')) {
        blocks.push({ id, type: 'h1', content: trimmed.substring(2) });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ id, type: 'h2', content: trimmed.substring(3) });
      } else if (trimmed.startsWith('### ')) {
        blocks.push({ id, type: 'h3', content: trimmed.substring(4) });
      } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('[ ] ')) {
        const text = trimmed.startsWith('- [ ] ') ? trimmed.substring(6) : trimmed.substring(4);
        blocks.push({ id, type: 'task', content: text, checked: false });
      } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('[x] ')) {
        const text = trimmed.startsWith('- [x] ') ? trimmed.substring(6) : trimmed.substring(4);
        blocks.push({ id, type: 'task', content: text, checked: true });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ id, type: 'bullet', content: trimmed.substring(2) });
      } else if (/^\d+\.\s/.test(trimmed)) {
        blocks.push({ id, type: 'number', content: trimmed.replace(/^\d+\.\s/, '') });
      } else if (trimmed.startsWith('> ')) {
        blocks.push({ id, type: 'quote', content: trimmed.substring(2) });
      } else if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        blocks.push({ id, type: 'equation', content: trimmed.slice(2, -2) });
      } else if (trimmed.length > 0 || blocks.length === 0) {
        blocks.push({ id, type: 'paragraph', content: line });
      }
    });

    return blocks.length > 0 ? blocks : [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }];
  }
}
