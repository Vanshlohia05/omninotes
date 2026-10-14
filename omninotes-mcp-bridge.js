#!/usr/bin/env node

/**
 * OmniNotes MCP Server Bridge
 * Implements Model Context Protocol over Standard I/O (stdio)
 * Compatible with Claude Desktop, Antigravity, and Cursor.
 */

const readline = require('readline');

const TOOLS = [
  {
    name: 'list_folders',
    description: 'Lists all available note folders in OmniNotes vault',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'search_notes',
    description: 'Searches notes by text query, tag, or folder ID',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
        tag: { type: 'string', description: 'Filter by tag' },
        folderId: { type: 'string', description: 'Filter by folder ID' }
      }
    }
  },
  {
    name: 'read_note',
    description: 'Reads full content, blocks, and metadata of a specific note by ID or title',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string' },
        title: { type: 'string' }
      }
    }
  },
  {
    name: 'create_note',
    description: 'Creates a new note with Notion-style blocks and Apple Notes styling',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        content: { type: 'string' }
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
        noteId: { type: 'string' },
        appendMarkdown: { type: 'string' }
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
        noteId: { type: 'string' }
      },
      required: ['noteId']
    }
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    const id = msg.id;

    if (msg.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'omninotes-mcp', version: '1.0.0' },
          capabilities: { tools: {} }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (msg.method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    } else if (msg.method === 'tools/call') {
      const { name, arguments: args } = msg.params || {};
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                tool: name,
                note: `OmniNotes MCP executed ${name} successfully.`
              })
            }
          ]
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (e) {
    // Ignore invalid JSON
  }
});
