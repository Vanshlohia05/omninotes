import { Folder, NoteItem } from '../types/note';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'folder-personal',
    name: 'Personal & Ideas',
    color: '#E5A93C', // Apple yellow/amber
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'folder-work',
    name: 'Work & Projects',
    color: '#3B82F6', // Blue
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'folder-diagrams',
    name: 'Canvas & Mind Maps',
    color: '#10B981', // Emerald
    createdAt: Date.now() - 86400000 * 3
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to OmniNotes ✨',
    folderId: 'folder-personal',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    tags: ['welcome', 'guide', 'apple', 'notion'],
    color: '#FEF9C3', // Pastel yellow
    pageColor: '#FFFFFF',
    fontFamily: 'sans',
    fontSize: 16,
    viewMode: 'document',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    blocks: [
      {
        id: 'b1',
        type: 'callout',
        content: 'OmniNotes combines Apple Notes elegance, Notion modular blocks, Microsoft OneNote spatial canvas, and Google Keep color agility.',
        calloutColor: '#FEF08A'
      },
      {
        id: 'b2',
        type: 'h1',
        content: 'Everything in One Knowledge System'
      },
      {
        id: 'b3',
        type: 'paragraph',
        content: 'Type anywhere, press "/" to access Notion commands, switch to Canvas view at the top for infinite spatial mapping, and sync across desktop and phone with Google Drive.'
      },
      {
        id: 'b4',
        type: 'h2',
        content: 'Quick Checklist (Click to Celebrate 🎉)'
      },
      {
        id: 'b5',
        type: 'task',
        content: 'Try completing this task to see confetti celebration',
        checked: false
      },
      {
        id: 'b6',
        type: 'task',
        content: 'Switch between Sans, Serif, Mono, and Handwritten fonts in the top bar',
        checked: false
      },
      {
        id: 'b7',
        type: 'task',
        content: 'Click "Canvas" view mode at top to see OneNote-style infinite canvas',
        checked: false
      },
      {
        id: 'b8',
        type: 'h2',
        content: 'Notion Modular Blocks & KaTeX Equation'
      },
      {
        id: 'b9',
        type: 'equation',
        content: 'E = mc^2 \\quad \\text{and} \\quad \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'
      },
      {
        id: 'b10',
        type: 'toggle',
        content: 'Collapsible Toggle: Click to expand hidden knowledge',
        isOpen: false,
        children: [
          {
            id: 'b10-1',
            type: 'paragraph',
            content: 'Nested sub-content works seamlessly! You can nest text, lists, and quotes inside toggle blocks.'
          }
        ]
      },
      {
        id: 'b11',
        type: 'quote',
        content: 'Simplicity is the ultimate sophistication. — Leonardo da Vinci'
      },
      {
        id: 'b12',
        type: 'h3',
        content: 'Interactive Table'
      },
      {
        id: 'b13',
        type: 'table',
        content: '',
        tableData: {
          headers: ['Feature', 'Platform Origin', 'Status'],
          rows: [
            ['3-Pane Layout & Folders', 'Apple Notes', 'Integrated ✨'],
            ['Slash Menu & Modular Blocks', 'Notion', 'Integrated ✨'],
            ['Infinite Canvas & Mind Maps', 'Microsoft OneNote', 'Integrated ✨'],
            ['Pastel Quick Cards & Colors', 'Google Keep', 'Integrated ✨'],
            ['Cross-Device Phone Sync', 'Google Drive PWA', 'Ready 🚀']
          ]
        }
      }
    ],
    canvasElements: []
  },
  {
    id: 'note-mindmap',
    title: 'Infinite Canvas & Architecture Mind Map 🗺️',
    folderId: 'folder-diagrams',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    tags: ['canvas', 'mindmap', 'onenote', 'flowchart'],
    color: '#E0F2FE', // Pastel blue
    pageColor: '#F8FAFC',
    fontFamily: 'sans',
    fontSize: 16,
    viewMode: 'canvas',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
    blocks: [
      {
        id: 'c-b1',
        type: 'paragraph',
        content: 'This note is in Infinite Canvas mode! Click the top View mode to toggle between Document and Canvas.'
      }
    ],
    canvasElements: [
      {
        id: 'node-center',
        type: 'mindmap-node',
        shapeType: 'rounded-rect',
        x: 400,
        y: 250,
        width: 180,
        height: 70,
        content: 'OmniNotes Core 🧠',
        fillColor: '#FEF08A',
        strokeColor: '#EAB308',
        strokeWidth: 2,
        fontSize: 18,
        childrenIds: ['node-apple', 'node-notion', 'node-onenote', 'node-gdrive']
      },
      {
        id: 'node-apple',
        type: 'mindmap-node',
        shapeType: 'rounded-rect',
        x: 120,
        y: 120,
        width: 160,
        height: 60,
        content: 'Apple Notes Elegance 🍏',
        fillColor: '#F3F4F6',
        strokeColor: '#9CA3AF',
        strokeWidth: 2,
        parentId: 'node-center'
      },
      {
        id: 'node-notion',
        type: 'mindmap-node',
        shapeType: 'rounded-rect',
        x: 680,
        y: 120,
        width: 160,
        height: 60,
        content: 'Notion Block Engine 🧱',
        fillColor: '#EDE9FE',
        strokeColor: '#8B5CF6',
        strokeWidth: 2,
        parentId: 'node-center'
      },
      {
        id: 'node-onenote',
        type: 'mindmap-node',
        shapeType: 'rounded-rect',
        x: 120,
        y: 380,
        width: 170,
        height: 60,
        content: 'OneNote Infinite Canvas 🎨',
        fillColor: '#DCFCE7',
        strokeColor: '#22C55E',
        strokeWidth: 2,
        parentId: 'node-center'
      },
      {
        id: 'node-gdrive',
        type: 'mindmap-node',
        shapeType: 'rounded-rect',
        x: 680,
        y: 380,
        width: 160,
        height: 60,
        content: 'Google Drive Sync ☁️',
        fillColor: '#FFEDD5',
        strokeColor: '#F97316',
        strokeWidth: 2,
        parentId: 'node-center'
      },
      {
        id: 'shape-diamond',
        type: 'shape',
        shapeType: 'diamond',
        x: 430,
        y: 420,
        width: 120,
        height: 100,
        content: 'Conflict?\nAuto-Merge',
        fillColor: '#FCE7F3',
        strokeColor: '#EC4899',
        strokeWidth: 2,
        fontSize: 13
      },
      {
        id: 'conn-1',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'curved',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-center', x: 400, y: 285 },
        connectorEnd: { elementId: 'node-apple', x: 280, y: 150 }
      },
      {
        id: 'conn-2',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'curved',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-center', x: 580, y: 285 },
        connectorEnd: { elementId: 'node-notion', x: 680, y: 150 }
      },
      {
        id: 'conn-3',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'curved',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-center', x: 400, y: 285 },
        connectorEnd: { elementId: 'node-onenote', x: 290, y: 410 }
      },
      {
        id: 'conn-4',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'curved',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-center', x: 580, y: 285 },
        connectorEnd: { elementId: 'node-gdrive', x: 680, y: 410 }
      }
    ]
  },
  {
    id: 'note-phone-sync',
    title: 'Phone Sync & PWA Installation Guide 📱',
    folderId: 'folder-work',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    tags: ['mobile', 'gdrive', 'pwa', 'sync'],
    color: '#DCFCE7', // Pastel green
    pageColor: '#FFFFFF',
    fontFamily: 'sans',
    fontSize: 16,
    viewMode: 'document',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 7200000,
    blocks: [
      {
        id: 'ps1',
        type: 'h1',
        content: 'How Phone Sync Works without App Store friction'
      },
      {
        id: 'ps2',
        type: 'callout',
        content: 'OmniNotes is an installable Progressive Web App (PWA) with local-first IndexedDB storage + Google Drive cloud vault.',
        calloutColor: '#BBF7D0'
      },
      {
        id: 'ps3',
        type: 'h2',
        content: '1. On your iPhone or iPad'
      },
      {
        id: 'ps4',
        type: 'bullet',
        content: 'Open this URL in Safari'
      },
      {
        id: 'ps5',
        type: 'bullet',
        content: 'Tap the Share button (square with arrow up)'
      },
      {
        id: 'ps6',
        type: 'bullet',
        content: 'Select "Add to Home Screen" — it installs as a standalone native app icon with 120fps gesture fluidity!'
      },
      {
        id: 'ps7',
        type: 'h2',
        content: '2. On your Android Phone'
      },
      {
        id: 'ps8',
        type: 'bullet',
        content: 'Open this URL in Chrome'
      },
      {
        id: 'ps9',
        type: 'bullet',
        content: 'Tap the three-dots menu or the install banner and tap "Install App"'
      },
      {
        id: 'ps10',
        type: 'h2',
        content: '3. Google Drive Sync'
      },
      {
        id: 'ps11',
        type: 'paragraph',
        content: 'Click the Settings gear in the bottom-left sidebar. You can connect your Google Drive or download a full JSON Vault Backup to transfer directly between any device.'
      }
    ],
    canvasElements: []
  }
];
