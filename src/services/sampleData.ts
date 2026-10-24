import { Folder, NoteItem } from '../types/note';
import { HabitItem, TaskItem, JournalBook, ParaItem, CrmContact } from '../types/lifeos';

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
      },
      {
        id: 'b14',
        type: 'h3',
        content: 'Interactive Timeline View'
      },
      {
        id: 'b15',
        type: 'timeline',
        content: 'Project Milestones',
        timelineEvents: [
          {
            id: 'ev-1',
            date: '2026-10-10',
            title: 'Concept & System Design',
            description: 'Unified Apple Notes, Notion, OneNote, and Keep.',
            status: 'completed'
          },
          {
            id: 'ev-2',
            date: '2026-10-14',
            title: 'Core Engine & Canvas Inking',
            description: 'Infinite spatial canvas with mind maps and GIS OAuth.',
            status: 'in-progress'
          },
          {
            id: 'ev-3',
            date: '2026-10-20',
            title: 'Cross-Device Phone Rollout',
            description: 'Full PWA installation on iOS Safari and Android Chrome.',
            status: 'planned'
          }
        ]
      },
      {
        id: 'b16',
        type: 'h3',
        content: 'Notion Link-to-Page & Web View'
      },
      {
        id: 'b17',
        type: 'link-to-page',
        content: 'Direct Link to Mind Map Canvas',
        linkedNoteId: 'note-mindmap'
      },
      {
        id: 'b18',
        type: 'webview',
        content: 'Live Interactive Web Embed',
        url: 'https://en.wikipedia.org/wiki/Note-taking'
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
  },
  {
    id: 'note-on-arrays',
    title: 'Vectors, Dynamic Arrays & Hash Collisions',
    notebookId: 'nb-cs',
    unitId: 'unit-dsa',
    chapterId: 'chap-arrays',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    tags: ['dsa', 'algorithms', 'cs'],
    fontFamily: 'sans',
    fontSize: 16,
    viewMode: 'document',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    blocks: [
      { id: 'b-nb-1', type: 'h1', content: 'Vectors, Dynamic Arrays & Hash Collisions' },
      { id: 'b-nb-2', type: 'paragraph', content: 'In OneNote section style, this page explores amortized time complexity and bucket hash probing techniques.' },
      { id: 'b-nb-3', type: 'callout', content: 'Amortized Complexity: Doubling vector capacity on overflow yields O(1) amortized insertion cost across N elements.', calloutColor: '#EDE9FE', calloutIcon: '💡' },
      { id: 'b-nb-4', type: 'equation', content: 'T_{amortized} = \\frac{\\sum_{i=1}^N c_i}{N} = O(1)' },
      {
        id: 'b-nb-5',
        type: 'table',
        content: '',
        tableData: {
          headers: ['Operation', 'Dynamic Array', 'Linked List', 'Hash Table'],
          rows: [
            ['Random Access', 'O(1)', 'O(N)', 'O(1) avg'],
            ['Insert at End', 'O(1) amortized', 'O(1)', 'O(1) avg'],
            ['Insert at Beginning', 'O(N)', 'O(1)', 'O(1) avg'],
            ['Search', 'O(N) / O(log N)', 'O(N)', 'O(1) avg']
          ]
        }
      }
    ],
    canvasElements: []
  },
  {
    id: 'note-on-trees',
    title: 'Binary Search Trees & Self-Balancing AVL Trees',
    notebookId: 'nb-cs',
    unitId: 'unit-dsa',
    chapterId: 'chap-trees',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    tags: ['trees', 'avl', 'graphs'],
    fontFamily: 'sans',
    fontSize: 16,
    viewMode: 'both',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    blocks: [
      { id: 'b-tr-1', type: 'h1', content: 'Binary Search Trees & AVL Balancing' },
      { id: 'b-tr-2', type: 'paragraph', content: 'An AVL tree maintains height balance such that for every node, the heights of left and right subtrees differ by at most 1.' },
      { id: 'b-tr-3', type: 'equation', content: '|h_{left} - h_{right}| \\le 1' }
    ],
    canvasElements: [
      {
        id: 'node-root',
        type: 'mindmap-node',
        shapeType: 'circle',
        x: 400,
        y: 100,
        width: 80,
        height: 80,
        content: 'Root: 50',
        fillColor: '#E0F2FE',
        strokeColor: '#0284C7',
        strokeWidth: 2
      },
      {
        id: 'node-left',
        type: 'mindmap-node',
        shapeType: 'circle',
        x: 280,
        y: 220,
        width: 80,
        height: 80,
        content: 'Left: 25',
        fillColor: '#DCFCE7',
        strokeColor: '#16A34A',
        strokeWidth: 2,
        parentId: 'node-root'
      },
      {
        id: 'node-right',
        type: 'mindmap-node',
        shapeType: 'circle',
        x: 520,
        y: 220,
        width: 80,
        height: 80,
        content: 'Right: 75',
        fillColor: '#FEF3C7',
        strokeColor: '#D97706',
        strokeWidth: 2,
        parentId: 'node-root'
      },
      {
        id: 'conn-tree-1',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'straight',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-root', x: 420, y: 170 },
        connectorEnd: { elementId: 'node-left', x: 320, y: 220 }
      },
      {
        id: 'conn-tree-2',
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        connectorType: 'straight',
        strokeColor: '#64748B',
        strokeWidth: 2,
        connectorStart: { elementId: 'node-root', x: 460, y: 170 },
        connectorEnd: { elementId: 'node-right', x: 540, y: 220 }
      }
    ]
  }
];

export const INITIAL_NOTEBOOKS = [
  {
    id: 'nb-cs',
    name: 'Computer Science & Engineering',
    color: '#7719AA', // OneNote Purple
    icon: '💻',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 1,
    units: [
      {
        id: 'unit-dsa',
        notebookId: 'nb-cs',
        name: 'Unit 1: Data Structures & Algorithms',
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 2,
        chapters: [
          {
            id: 'chap-arrays',
            notebookId: 'nb-cs',
            unitId: 'unit-dsa',
            name: 'Arrays & Lists',
            color: '#873999', // OneNote Purple tab
            pageIds: ['note-on-arrays'],
            createdAt: Date.now() - 86400000 * 6,
            updatedAt: Date.now() - 86400000 * 2
          },
          {
            id: 'chap-trees',
            notebookId: 'nb-cs',
            unitId: 'unit-dsa',
            name: 'Trees & Graphs',
            color: '#038387', // OneNote Teal tab
            pageIds: ['note-on-trees'],
            createdAt: Date.now() - 86400000 * 5,
            updatedAt: Date.now() - 86400000 * 1
          }
        ]
      },
      {
        id: 'unit-systems',
        notebookId: 'nb-cs',
        name: 'Unit 2: Distributed Systems',
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 86400000 * 1,
        chapters: [
          {
            id: 'chap-consensus',
            notebookId: 'nb-cs',
            unitId: 'unit-systems',
            name: 'Consensus & Raft',
            color: '#0078D4', // OneNote Blue tab
            pageIds: [],
            createdAt: Date.now() - 86400000 * 3,
            updatedAt: Date.now() - 86400000 * 1
          }
        ]
      }
    ]
  }
];

function buildPastCompletions(days: number): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result[key] = true;
  }
  return result;
}

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'habit-mindfulness',
    name: 'Morning Breathwork & Mindfulness',
    description: '10 minutes of box breathing or guided meditation upon waking',
    category: 'Morning Routine',
    color: '#10B981', // Emerald
    icon: '🧘',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    completions: buildPastCompletions(7),
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  },
  {
    id: 'habit-hydration',
    name: 'Hydration (2.5L Water)',
    description: 'Track daily intake with morning electrolyte boost',
    category: 'Fitness & Health',
    color: '#0EA5E9', // Sky
    icon: '💧',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    completions: buildPastCompletions(12),
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  },
  {
    id: 'habit-deepwork',
    name: 'Deep Work Sprint (90 min)',
    description: 'Uninterrupted creative focus with notifications silenced',
    category: 'Deep Work',
    color: '#6366F1', // Indigo
    icon: '🧠',
    frequency: 'weekdays',
    targetDaysPerWeek: 5,
    completions: buildPastCompletions(5),
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now()
  },
  {
    id: 'habit-reading',
    name: 'Evening Book Reading (20 pages)',
    description: 'Non-fiction books on philosophy, architecture, or science',
    category: 'Mindset & Evening',
    color: '#F59E0B', // Amber
    icon: '📚',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    completions: buildPastCompletions(18),
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now()
  },
  {
    id: 'habit-movement',
    name: 'Physical Movement (Run / Workout)',
    description: 'Zone 2 cardio or functional strength conditioning',
    category: 'Fitness & Health',
    color: '#F43F5E', // Rose
    icon: '🏃',
    frequency: 'daily',
    targetDaysPerWeek: 5,
    completions: buildPastCompletions(4),
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now()
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  // 1. Eat the Frog (Hero Task)
  {
    id: 'task-frog',
    title: 'Finalize Q4 Architecture & System Design',
    description: 'High priority system architecture design and client contract alignment',
    completed: false,
    isFrog: true,
    priority: 'urgent',
    dueDate: new Date().toISOString().split('T')[0],
    eisenhower: 'q1_do',
    ivyLeeOrder: 1,
    oneThreeFive: 'big',
    moscow: 'must',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now()
  },
  // 2. Eisenhower Matrix Tasks
  {
    id: 'task-eisen-q1',
    title: 'Fix PWA Service Worker Cache Invalidation',
    description: 'Ensure offline assets update immediately on deploy',
    completed: false,
    eisenhower: 'q1_do',
    priority: 'high',
    ivyLeeOrder: 2,
    oneThreeFive: 'medium',
    moscow: 'must',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now()
  },
  {
    id: 'task-eisen-q2',
    title: 'Draft 5-Year Vision & Second Brain Master Index',
    description: 'Strategic planning and long-term goal synthesis',
    completed: false,
    eisenhower: 'q2_schedule',
    priority: 'medium',
    ivyLeeOrder: 3,
    oneThreeFive: 'medium',
    moscow: 'should',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now()
  },
  {
    id: 'task-eisen-q3',
    title: 'Reply to quarterly insurance renewal email',
    description: 'Administrative follow-up with policy broker',
    completed: false,
    eisenhower: 'q3_delegate',
    priority: 'low',
    ivyLeeOrder: 4,
    oneThreeFive: 'small',
    moscow: 'could',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now()
  },
  {
    id: 'task-eisen-q4',
    title: 'Organize old desktop download screenshots',
    description: 'Purge transient files and free up disk space',
    completed: false,
    eisenhower: 'q4_eliminate',
    priority: 'low',
    ivyLeeOrder: 5,
    oneThreeFive: 'small',
    moscow: 'wont',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now()
  },
  // 3. 2-Minute Rule micro-tasks
  {
    id: 'task-2min-1',
    title: 'Text Sarah about dinner reservations',
    description: 'Confirm 7:30pm table at Osteria',
    completed: false,
    timeEstimateMinutes: 1,
    priority: 'low',
    ivyLeeOrder: 6,
    oneThreeFive: 'small',
    moscow: 'could',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now()
  },
  // 4. Completed Anti-To-Do ("Done List") Task
  {
    id: 'task-done-1',
    title: 'Set up Vite + Tailwind CSS React foundation',
    description: 'Initial repo setup, TypeScript config, and test harness',
    completed: true,
    completedAt: Date.now() - 86400000 * 2,
    priority: 'high',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2
  }
];

export const INITIAL_JOURNALS: JournalBook[] = [
  {
    id: 'journal-personal',
    title: 'Personal Reflections & Life Log',
    description: 'Evening reflections, deep thoughts, and seasonal audits',
    coverColor: '#D97706', // Apple Amber
    coverTexture: 'leather',
    defaultRuling: 'ruled',
    category: 'Personal',
    activePageNumber: 1,
    viewMode: 'book',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now(),
    pages: [
      {
        id: 'page-personal-toc',
        journalId: 'journal-personal',
        pageNumber: 1,
        title: 'Table of Contents',
        date: '2026-10-01',
        paperRuling: 'ruled',
        blocks: [
          { id: 'b-toc-1', type: 'h1', content: 'Table of Contents' },
          { id: 'b-toc-2', type: 'paragraph', content: 'Automatically generated index of all entries in this journal.' }
        ],
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now()
      },
      {
        id: 'page-personal-2',
        journalId: 'journal-personal',
        pageNumber: 2,
        title: 'Autumn Reflections & Mental Clarity',
        date: '2026-10-15',
        paperRuling: 'ruled',
        blocks: [
          { id: 'b-p2-1', type: 'h2', content: 'Autumn Reflections & Mental Clarity' },
          { id: 'b-p2-2', type: 'paragraph', content: 'Taking time to pause and reflect on the lessons from this past quarter. Focus on continuous steady progress over sudden bursts.' },
          { id: 'b-p2-3', type: 'quote', content: '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Will Durant' }
        ],
        createdAt: Date.now() - 86400000 * 9,
        updatedAt: Date.now() - 86400000 * 9
      },
      {
        id: 'page-personal-3',
        journalId: 'journal-personal',
        pageNumber: 3,
        title: 'Three Daily Gratitudes',
        date: '2026-10-20',
        paperRuling: 'ruled',
        blocks: [
          { id: 'b-p3-1', type: 'h2', content: 'Gratitude & Wins' },
          { id: 'b-p3-2', type: 'bullet', content: 'Crisp morning air during the 6am run' },
          { id: 'b-p3-3', type: 'bullet', content: 'Breakthrough on local-first database architecture' },
          { id: 'b-p3-4', type: 'bullet', content: 'Warm coffee conversation with close friends' }
        ],
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 86400000 * 4
      }
    ]
  },
  {
    id: 'journal-bujo',
    title: 'Daily Bullet Journal (BuJo)',
    description: 'Rapid logging, habit trackers, and daily sprint logs',
    coverColor: '#1E3A8A', // Midnight Blue
    coverTexture: 'hardcover',
    defaultRuling: 'grid',
    category: 'BuJo',
    activePageNumber: 1,
    viewMode: 'book',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now(),
    pages: [
      {
        id: 'page-bujo-toc',
        journalId: 'journal-bujo',
        pageNumber: 1,
        title: 'Bullet Journal Index',
        date: '2026-10-05',
        paperRuling: 'grid',
        blocks: [
          { id: 'b-bujo-1', type: 'h1', content: 'Index & Future Log' },
          { id: 'b-bujo-2', type: 'paragraph', content: 'Rapid log index mapping weeks to actionable sprints.' }
        ],
        createdAt: Date.now() - 86400000 * 15,
        updatedAt: Date.now()
      },
      {
        id: 'page-bujo-2',
        journalId: 'journal-bujo',
        pageNumber: 2,
        title: 'Sprint 42 Daily Log',
        date: '2026-10-22',
        paperRuling: 'grid',
        blocks: [
          { id: 'b-bujo-3', type: 'h2', content: 'Daily Log • Oct 22' },
          { id: 'b-bujo-4', type: 'task', content: 'Ship Life OS Core schemas and DB migration', checked: true },
          { id: 'b-bujo-5', type: 'task', content: 'Review pull requests and test coverage', checked: false }
        ],
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2
      }
    ]
  },
  {
    id: 'journal-commonplace',
    title: 'Engineering Commonplace Book',
    description: 'Clipped wisdom, architecture patterns, and book summaries',
    coverColor: '#065F46', // Forest Green
    coverTexture: 'linen',
    defaultRuling: 'plain',
    category: 'Commonplace',
    activePageNumber: 1,
    viewMode: 'scroll',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now(),
    pages: [
      {
        id: 'page-common-toc',
        journalId: 'journal-commonplace',
        pageNumber: 1,
        title: 'Commonplace Topics Index',
        date: '2026-09-25',
        paperRuling: 'plain',
        blocks: [
          { id: 'b-com-1', type: 'h1', content: 'Knowledge Index' },
          { id: 'b-com-2', type: 'paragraph', content: 'Curated technical notes, quotes, and mental frameworks.' }
        ],
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now()
      },
      {
        id: 'page-common-2',
        journalId: 'journal-commonplace',
        pageNumber: 2,
        title: 'Local-First Software Principles',
        date: '2026-10-10',
        paperRuling: 'plain',
        blocks: [
          { id: 'b-com-3', type: 'h2', content: 'Seven Principles of Local-First Software' },
          { id: 'b-com-4', type: 'paragraph', content: '1. No spinners: your work at your fingertips.\n2. Your work is not trapped on one device.\n3. The network is optional.\n4. Seamless collaboration with others.' }
        ],
        createdAt: Date.now() - 86400000 * 14,
        updatedAt: Date.now() - 86400000 * 14
      }
    ]
  }
];

export const INITIAL_PARA_ITEMS: ParaItem[] = [
  {
    id: 'para-p1',
    type: 'project',
    title: 'Launch OmniNotes v2.0 Production',
    description: 'Complete cross-device sync, OneNote canvas, and Life OS modules',
    status: 'active',
    deadline: '2026-11-15',
    tags: ['release', 'architecture', 'pwa'],
    noteIds: ['note-arch-1'],
    color: '#3B82F6',
    icon: '🚀',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now()
  },
  {
    id: 'para-a1',
    type: 'area',
    title: 'Physical Health & Longevity',
    description: 'Ongoing standard of fitness, zone 2 running, sleep quality, and nutrition',
    status: 'active',
    tags: ['health', 'habits', 'biohacking'],
    noteIds: [],
    color: '#10B981',
    icon: '🌿',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  },
  {
    id: 'para-r1',
    type: 'resource',
    title: 'TypeScript & React Performance Playbook',
    description: 'Best practices for virtual lists, IndexedDB batching, and web workers',
    tags: ['engineering', 'reference'],
    noteIds: ['note-arch-2'],
    color: '#8B5CF6',
    icon: '📚',
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now()
  },
  {
    id: 'para-arc1',
    type: 'archive',
    title: 'Q1 2026 Initial Prototypes & Design Sprints',
    description: 'Historical artifacts from initial wireframes and early prototypes',
    status: 'archived',
    tags: ['history', '2026'],
    noteIds: [],
    color: '#64748B',
    icon: '📦',
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now()
  }
];

export const INITIAL_CRM_CONTACTS: CrmContact[] = [
  {
    id: 'crm-1',
    name: 'Elena Rostova',
    avatar: '👩‍💻',
    relationship: 'Lead AI Researcher & Co-founder',
    tier: 'close_friend',
    companyOrRole: 'DeepTech Labs',
    email: 'elena@deeptechlabs.io',
    phone: '+1 (555) 234-5678',
    birthday: '11-04',
    cadence: 'biweekly',
    cadenceDays: 14,
    lastCatchUpDate: '2026-10-18',
    notes: 'Discussing local embeddings on WebGPU and agentic workflows.',
    giftIdeas: ['Mechanical keyboard switches', 'Loose leaf oolong tea'],
    topicsToDiscuss: ['Vector search latency', 'Upcoming NeurIPS submissions'],
    interactions: [
      {
        id: 'inter-1',
        date: '2026-10-18',
        type: 'coffee',
        notes: 'Great catchup at Blue Bottle. Agreed to test IndexedDB vector cache.'
      }
    ],
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now()
  },
  {
    id: 'crm-2',
    name: 'Marcus Vance',
    avatar: '👨‍💼',
    relationship: 'Angel Investor & Advisor',
    tier: 'mentor',
    companyOrRole: 'Vance Capital',
    email: 'marcus@vancecap.com',
    birthday: '03-12',
    cadence: 'monthly',
    cadenceDays: 30,
    lastCatchUpDate: '2026-09-28',
    notes: 'Advises on enterprise positioning and SaaS distribution.',
    giftIdeas: ['Fountain pen ink', 'Architecture monograph'],
    topicsToDiscuss: ['Series A metrics', 'Q4 growth roadmap'],
    interactions: [
      {
        id: 'inter-2',
        date: '2026-09-28',
        type: 'call',
        notes: 'Monthly advisory sync. Recommended focusing on user retention and mobile fidelity.'
      }
    ],
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now()
  },
  {
    id: 'crm-3',
    name: 'Mom & Dad',
    avatar: '🏡',
    relationship: 'Parents',
    tier: 'family',
    phone: '+1 (555) 987-6543',
    birthday: '12-25',
    cadence: 'weekly',
    cadenceDays: 7,
    lastCatchUpDate: '2026-10-22',
    notes: 'Sunday family video calls.',
    giftIdeas: ['Garden tools', 'Framed family photos'],
    topicsToDiscuss: ['Thanksgiving visit dates', 'Dad’s new workshop projects'],
    interactions: [
      {
        id: 'inter-3',
        date: '2026-10-22',
        type: 'call',
        notes: 'Sunday catchup. Planning holiday schedule.'
      }
    ],
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now()
  }
];

