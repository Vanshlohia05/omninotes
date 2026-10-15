/**
 * OpenAPI 3.1.0 Specification for OmniNotes & OneNote Notebooks
 * Ready for ChatGPT Custom Actions, Claude Desktop, Antigravity, and AI Agents
 */

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'OmniNotes AI Agent API',
    description: 'REST API enabling AI models and Custom GPT Actions to read, create, search, and edit notes, OneNote notebooks, units, chapters, and canvas elements.',
    version: '1.0.0',
    contact: {
      name: 'OmniNotes Integration Support',
      url: 'https://github.com/omninotes'
    }
  },
  servers: [
    {
      url: 'https://omninotes.local/api',
      description: 'Local OmniNotes API Server'
    }
  ],
  paths: {
    '/notes': {
      get: {
        operationId: 'listNotes',
        summary: 'Query and list notes with search, folder, tag, or notebook filters',
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Search keyword across titles and content blocks',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'folder',
            in: 'query',
            description: 'Filter notes by folder ID',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'tag',
            in: 'query',
            description: 'Filter notes by hashtag tag name',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'notebookId',
            in: 'query',
            description: 'Filter notes belonging to a specific OneNote notebook',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'chapterId',
            in: 'query',
            description: 'Filter notes belonging to a specific chapter',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of matching notes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    notes: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NoteSummary' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createNote',
        summary: 'Create a new note with title, markdown content, tags, or notebook association',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNoteRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Successfully created note',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    note: { $ref: '#/components/schemas/NoteItem' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/notes/{id}': {
      get: {
        operationId: 'getNoteById',
        summary: 'Fetch full note content, block tree, and canvas elements by note ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Unique Note ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Full Note Details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NoteItem' }
              }
            }
          },
          '404': {
            description: 'Note not found'
          }
        }
      },
      put: {
        operationId: 'updateNote',
        summary: 'Update note title, tags, append markdown, or modify block structure',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Unique Note ID',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateNoteRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Note updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    note: { $ref: '#/components/schemas/NoteItem' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        operationId: 'deleteNote',
        summary: 'Delete note or move to trash',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          },
          {
            name: 'permanent',
            in: 'query',
            required: false,
            description: 'If true, deletes permanently. Otherwise moves to trash.',
            schema: { type: 'boolean' }
          }
        ],
        responses: {
          '200': {
            description: 'Note deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/notebooks': {
      get: {
        operationId: 'listNotebooks',
        summary: 'List all Microsoft OneNote style Notebooks with nested Units and Chapters',
        responses: {
          '200': {
            description: 'List of notebooks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    notebooks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notebook' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createNotebook',
        summary: 'Create a new OneNote notebook binder',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Computer Science & AI' },
                  color: { type: 'string', example: '#7719AA' },
                  icon: { type: 'string', example: '📓' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Notebook created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notebook' }
              }
            }
          }
        }
      }
    },
    '/notebooks/{id}': {
      get: {
        operationId: 'getNotebookById',
        summary: 'Get details of a specific notebook binder including all units and chapters',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Notebook details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notebook' }
              }
            }
          },
          '404': { description: 'Notebook not found' }
        }
      },
      put: {
        operationId: 'updateNotebook',
        summary: 'Update notebook name, binder color, or icon',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  color: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Notebook updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notebook' }
              }
            }
          }
        }
      },
      delete: {
        operationId: 'deleteNotebook',
        summary: 'Delete a notebook and all its unit/chapter associations',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Notebook deleted successfully'
          }
        }
      }
    },
    '/notebooks/{id}/units': {
      get: {
        operationId: 'listNotebookUnits',
        summary: 'List all units (section groups) in a notebook',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Notebook ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of units',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    units: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NotebookUnit' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createNotebookUnit',
        summary: 'Create a new Unit (Section Group) inside a notebook',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Notebook ID',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Unit 1: Data Structures' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Unit created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotebookUnit' }
              }
            }
          }
        }
      }
    },
    '/notebooks/{id}/units/{unitId}': {
      get: {
        operationId: 'getNotebookUnit',
        summary: 'Get details of a specific unit',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Unit details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotebookUnit' }
              }
            }
          }
        }
      },
      delete: {
        operationId: 'deleteNotebookUnit',
        summary: 'Delete a unit from a notebook',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Unit deleted' }
        }
      }
    },
    '/notebooks/{id}/units/{unitId}/chapters': {
      get: {
        operationId: 'listNotebookChapters',
        summary: 'List all chapters (sections) in a unit',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'List of chapters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    chapters: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NotebookChapter' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createNotebookChapter',
        summary: 'Create a new Chapter / Section tab inside a notebook unit',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          },
          {
            name: 'unitId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Arrays & Lists' },
                  color: { type: 'string', example: '#873999' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Chapter created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotebookChapter' }
              }
            }
          }
        }
      }
    },
    '/notebooks/{id}/units/{unitId}/chapters/{chapterId}': {
      get: {
        operationId: 'getNotebookChapter',
        summary: 'Get details of a specific chapter section',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'chapterId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Chapter details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotebookChapter' }
              }
            }
          }
        }
      },
      delete: {
        operationId: 'deleteNotebookChapter',
        summary: 'Delete a chapter section from a unit',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'unitId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'chapterId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Chapter deleted' }
        }
      }
    },
    '/notebooks/{id}/chapters/{chapterId}/pages': {
      get: {
        operationId: 'listChapterPages',
        summary: 'List all pages belonging to a specific chapter section',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'chapterId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'List of chapter pages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                    pages: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NoteSummary' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createChapterPage',
        summary: 'Create a new OneNote page within a specific chapter',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          },
          {
            name: 'chapterId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Binary Search Trees & Complexity' },
                  markdown: { type: 'string', example: '# BST Notes\n- Left < Root < Right\n- O(log N) average depth' },
                  tags: { type: 'array', items: { type: 'string' } },
                  isSubpage: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Page created and added to chapter',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NoteItem' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      NoteSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          folderId: { type: 'string', nullable: true },
          notebookId: { type: 'string', nullable: true },
          unitId: { type: 'string', nullable: true },
          chapterId: { type: 'string', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          isPinned: { type: 'boolean' },
          updatedAt: { type: 'integer' },
          snippet: { type: 'string' }
        }
      },
      NoteItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          folderId: { type: 'string', nullable: true },
          notebookId: { type: 'string', nullable: true },
          chapterId: { type: 'string', nullable: true },
          isPinned: { type: 'boolean' },
          isArchived: { type: 'boolean' },
          isDeleted: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                content: { type: 'string' }
              }
            }
          },
          canvasElements: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'integer' },
          updatedAt: { type: 'integer' }
        }
      },
      CreateNoteRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Agent Strategy Memo' },
          content: { type: 'string', description: 'Raw markdown or plain text', example: '# Objective\nAutomate unit test generation.' },
          tags: { type: 'array', items: { type: 'string' }, example: ['work', 'ai'] },
          folderId: { type: 'string' },
          notebookId: { type: 'string' },
          chapterId: { type: 'string' }
        }
      },
      UpdateNoteRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          appendMarkdown: { type: 'string', description: 'Appends new blocks to the note' },
          tags: { type: 'array', items: { type: 'string' } },
          isPinned: { type: 'boolean' },
          isArchived: { type: 'boolean' }
        }
      },
      Notebook: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          color: { type: 'string' },
          icon: { type: 'string' },
          units: {
            type: 'array',
            items: { $ref: '#/components/schemas/NotebookUnit' }
          },
          createdAt: { type: 'integer' },
          updatedAt: { type: 'integer' }
        }
      },
      NotebookUnit: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          notebookId: { type: 'string' },
          name: { type: 'string' },
          chapters: {
            type: 'array',
            items: { $ref: '#/components/schemas/NotebookChapter' }
          }
        }
      },
      NotebookChapter: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          notebookId: { type: 'string' },
          unitId: { type: 'string' },
          name: { type: 'string' },
          color: { type: 'string' },
          pageIds: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};
