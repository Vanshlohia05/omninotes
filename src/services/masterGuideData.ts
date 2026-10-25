import { NoteItem } from '../types/note';

export const MASTER_GUIDE_NOTE: NoteItem = {
  id: 'note-master-guide',
  title: '🌟 OmniNotes: Complete Feature, Framework & Slash Command Master Guide',
  folderId: 'folder-personal',
  isPinned: true,
  isArchived: false,
  isDeleted: false,
  tags: ['master-guide', 'features', 'slash-commands', 'life-os', 'notion', 'onenote', 'apple-notes'],
  color: '#FEF9C3',
  pageColor: '#FFFFFF',
  fontFamily: 'sans',
  fontSize: 16,
  viewMode: 'document',
  createdAt: Date.now() - 86400000 * 7,
  updatedAt: Date.now(),
  canvasElements: [],
  blocks: [
    {
      id: 'mg-callout-intro',
      type: 'callout',
      content: '🚀 Welcome to the complete OmniNotes Knowledge & Life OS Guide! This document lists and demonstrates every feature, framework, notebook tier, and interactive slash command (/) built into the application.',
      calloutIcon: '🌟',
      calloutColor: '#FEF08A'
    },
    {
      id: 'mg-h1-toc',
      type: 'h1',
      content: 'Table of Contents & Quick Navigation'
    },
    {
      id: 'mg-p-toc-desc',
      type: 'paragraph',
      content: 'Scroll through this comprehensive guide or click into each section to explore live examples, fake data, and step-by-step instructions on how to use every capability.'
    },
    {
      id: 'mg-bullet-1',
      type: 'bullet',
      content: '1. Apple Notes Experience: Smooth typing, 3-pane drill-down, pinned, reminders & trash.'
    },
    {
      id: 'mg-bullet-2',
      type: 'bullet',
      content: '2. Microsoft OneNote Notebooks: 4-tier hierarchy (Notebooks → Units → Chapters → Pages) & Infinite Spatial Canvas.'
    },
    {
      id: 'mg-bullet-3',
      type: 'bullet',
      content: '3. To-Do Prioritization Hub: 8 Frameworks (Eisenhower Matrix, Ivy Lee, Eat the Frog, 1-3-5, 2-Minute, MoSCoW, Done List).'
    },
    {
      id: 'mg-bullet-4',
      type: 'bullet',
      content: '4. Habit Tracker: Multi-month scrolling, custom colors, streaks & inline /habit blocks.'
    },
    {
      id: 'mg-bullet-5',
      type: 'bullet',
      content: '5. Book-Style Journaling Suite: 2-page spread, continuous scroll, auto-updating Page 1 TOC, ruling textures & 16 templates.'
    },
    {
      id: 'mg-bullet-6',
      type: 'bullet',
      content: '6. Second Brain (PARA Method): Projects, Areas, Resources, and Archives.'
    },
    {
      id: 'mg-bullet-7',
      type: 'bullet',
      content: '7. Personal Relationship CRM: Contact tiers, communication cadence, birthday alerts & catch-up logs.'
    },
    {
      id: 'mg-bullet-8',
      type: 'bullet',
      content: '8. Complete Interactive Directory of All "/" Slash Commands (with live working blocks).'
    },
    {
      id: 'mg-div-1',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 1: CORE NOTES & TYPING
    // ==========================================
    {
      id: 'mg-h1-notes',
      type: 'h1',
      content: '1. Apple Notes Experience & Formatting'
    },
    {
      id: 'mg-p-notes-1',
      type: 'paragraph',
      content: 'OmniNotes is designed to be as clean, fast, and clutter-free as Apple Notes. You can click anywhere to start typing effortlessly. Pressing Enter splits lines smoothly, and Backspace merges lines without ever losing cursor focus.'
    },
    {
      id: 'mg-h2-headings',
      type: 'h2',
      content: 'Heading Levels (/h1, /h2, /h3, /h4)'
    },
    {
      id: 'mg-h3-demo',
      type: 'h3',
      content: 'Heading 3: Ideal for sub-sections and topic breakdowns'
    },
    {
      id: 'mg-h4-demo',
      type: 'h4',
      content: 'Heading 4: Minor sub-heading for compact grouping'
    },
    {
      id: 'mg-p-list-intro',
      type: 'paragraph',
      content: 'Lists can be formatted as bullets (/bullet), numbered steps (/number), or interactive task checklists (/task):'
    },
    {
      id: 'mg-task-1',
      type: 'task',
      content: 'Click this checkbox to trigger celebration confetti! (/task)',
      checked: true
    },
    {
      id: 'mg-task-2',
      type: 'task',
      content: 'Reorder or delete items with hover drag handles',
      checked: false
    },
    {
      id: 'mg-quote-1',
      type: 'quote',
      content: '"Simplicity is the ultimate sophistication." — Leonardo da Vinci (/quote)'
    },
    {
      id: 'mg-div-2',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 2: NOTION ADVANCED BLOCKS
    // ==========================================
    {
      id: 'mg-h1-notion',
      type: 'h1',
      content: '2. Advanced Notion-Style Blocks'
    },
    {
      id: 'mg-p-notion-desc',
      type: 'paragraph',
      content: 'Beyond plain text, OmniNotes supports rich interactive blocks like spreadsheet tables, chronological timelines, math equations, code blocks, embeds, and internal page links:'
    },
    {
      id: 'mg-table-demo',
      type: 'table',
      content: '',
      tableData: {
        headers: ['Feature', 'Design Origin', 'Status', 'Trigger Command'],
        rows: [
          ['3-Pane Layout', 'Apple Notes', 'Active', 'Sidebar click'],
          ['Spatial Canvas', 'Microsoft OneNote', 'Active', 'Header toggle'],
          ['Slash Menu', 'Notion', 'Active', 'Type "/" on new line'],
          ['Prioritization Hub', 'Productivity Science', 'Active', 'Sidebar / To-Do Hub']
        ]
      }
    },
    {
      id: 'mg-timeline-demo',
      type: 'timeline',
      content: '',
      timelineEvents: [
        {
          id: 'ev-1',
          date: '2026-10-01',
          title: 'V1 Foundation Release',
          description: 'Apple Notes 3-pane layout, Google Drive sync, and initial block editor.',
          status: 'completed'
        },
        {
          id: 'ev-2',
          date: '2026-10-15',
          title: 'OneNote Notebooks & Canvas',
          description: '4-tier Notebook/Unit/Chapter architecture with colored binder tabs.',
          status: 'completed'
        },
        {
          id: 'ev-3',
          date: '2026-10-24',
          title: 'Life OS Suite & Frameworks Hub',
          description: 'Habit Tracker, Book-Style Journaling, To-Do Frameworks, PARA, and CRM.',
          status: 'completed'
        }
      ]
    },
    {
      id: 'mg-eq-demo',
      type: 'equation',
      content: 'E = mc^2 \\quad \\Longleftrightarrow \\quad \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'
    },
    {
      id: 'mg-code-demo',
      type: 'code',
      language: 'typescript',
      content: `// Sample TypeScript API invocation for OmniNotes
export async function fetchActiveTasks(): Promise<TaskItem[]> {
  const response = await fetch('/api/tasks?completed=false');
  const data = await response.json();
  return data.tasks;
}`
    },
    {
      id: 'mg-div-3',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 3: MICROSOFT ONENOTE & CANVAS
    // ==========================================
    {
      id: 'mg-h1-onenote',
      type: 'h1',
      content: '3. Microsoft OneNote Architecture & Infinite Canvas'
    },
    {
      id: 'mg-p-onenote-1',
      type: 'paragraph',
      content: 'Switch between "Notes" and "Notebooks" using the pill toggle at the top of the sidebar. Notebooks mirror Microsoft OneNote exactly with a 4-tier hierarchy:'
    },
    {
      id: 'mg-bullet-on-1',
      type: 'bullet',
      content: 'Tier 1: Notebooks (e.g. Computer Science, Creative Writing) with customizable binder colors.'
    },
    {
      id: 'mg-bullet-on-2',
      type: 'bullet',
      content: 'Tier 2: Units (Section Groups) clustering related subject domains.'
    },
    {
      id: 'mg-bullet-on-3',
      type: 'bullet',
      content: 'Tier 3: Chapters (Colored Tabs) representing distinct modules or topics.'
    },
    {
      id: 'mg-bullet-on-4',
      type: 'bullet',
      content: 'Tier 4: Pages: Freeform pages opening into the Infinite Spatial Canvas.'
    },
    {
      id: 'mg-callout-canvas',
      type: 'callout',
      content: '🎨 Infinite Canvas Mode: Click "Canvas" or "Split" in any note header to access infinite panning, zoom, shapes (rectangles, diamonds, speech bubbles, clouds), smart arrows, text cards, and freehand drawing pens.',
      calloutIcon: '🎨',
      calloutColor: '#E0F2FE'
    },
    {
      id: 'mg-div-4',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 4: TO-DO HUB & PRIORITIZATION FRAMEWORKS
    // ==========================================
    {
      id: 'mg-h1-todohub',
      type: 'h1',
      content: '4. To-Do Prioritization Hub (8 Scientific Frameworks)'
    },
    {
      id: 'mg-p-todohub-1',
      type: 'paragraph',
      content: 'Accessible by clicking "To-Do Hub" in the sidebar. Instead of a basic checklist, OmniNotes provides a dedicated command center with 8 prioritization models switchable via clean top header pills:'
    },
    {
      id: 'mg-bullet-td-1',
      type: 'bullet',
      content: '• All Tasks: Unified list with checkboxes, tags, and priority labels.'
    },
    {
      id: 'mg-bullet-td-2',
      type: 'bullet',
      content: '• Eisenhower 2x2 Matrix: Sort tasks into Do First (Q1), Schedule (Q2), Delegate (Q3), and Eliminate (Q4).'
    },
    {
      id: 'mg-bullet-td-3',
      type: 'bullet',
      content: '• Ivy Lee Method: Commit to exactly 6 tasks each day in strict numerical order. Never start task 2 until task 1 is finished.'
    },
    {
      id: 'mg-bullet-td-4',
      type: 'bullet',
      content: '• Eat the Frog: Highlights your single hardest, most dreaded task of the day with hero countdown and celebration.'
    },
    {
      id: 'mg-bullet-td-5',
      type: 'bullet',
      content: '• 1-3-5 Rule: Commit daily to 1 Big task, 3 Medium tasks, and 5 Small tasks.'
    },
    {
      id: 'mg-bullet-td-6',
      type: 'bullet',
      content: '• 2-Minute Rule: If an action takes under 2 minutes, execute it immediately.'
    },
    {
      id: 'mg-bullet-td-7',
      type: 'bullet',
      content: '• MoSCoW Method: Classify deliverables into Must-have, Should-have, Could-have, and Won’t-have.'
    },
    {
      id: 'mg-bullet-td-8',
      type: 'bullet',
      content: '• Anti-To-Do ("Done List"): An inspiring real-time log celebrating everything accomplished today.'
    },
    {
      id: 'mg-div-5',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 5: HABIT TRACKER
    // ==========================================
    {
      id: 'mg-h1-habits',
      type: 'h1',
      content: '5. Customizable Habit Tracker'
    },
    {
      id: 'mg-p-habits-1',
      type: 'paragraph',
      content: 'Located directly beneath the To-Do list in the sidebar. Track morning routines, physical fitness, deep work sprints, and reading habits with full multi-month navigation, custom color tags, and streak analytics.'
    },
    {
      id: 'mg-p-habits-inline',
      type: 'paragraph',
      content: 'You can also embed habit trackers directly inside any note using the /habit slash command. Try checking today’s box below:'
    },
    {
      id: 'mg-habit-demo',
      type: 'habit',
      content: '',
      habitData: {
        title: 'Daily Mindfulness & Deep Work Sprint',
        category: 'Morning Routine',
        color: '#10B981',
        icon: '🧘',
        streak: 7,
        todayCompleted: true,
        completions: {
          [new Date().toISOString().split('T')[0]]: true,
          [new Date(Date.now() - 86400000).toISOString().split('T')[0]]: true,
          [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: true
        }
      }
    },
    {
      id: 'mg-div-6',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 6: BOOK-STYLE JOURNALING SUITE
    // ==========================================
    {
      id: 'mg-h1-journals',
      type: 'h1',
      content: '6. Book-Style Journaling Suite'
    },
    {
      id: 'mg-p-journals-1',
      type: 'paragraph',
      content: 'Accessible under "Journals" in the sidebar. Manage multiple journal books (e.g. Personal Reflections, Bullet Journal, Commonplace Book, Shadow Work, Challenges).'
    },
    {
      id: 'mg-bullet-j-1',
      type: 'bullet',
      content: '• Dual View Switcher: Toggle instantly between Realistic 2-Page Book Spread (with flip controls) and Continuous Vertical Scroll.'
    },
    {
      id: 'mg-bullet-j-2',
      type: 'bullet',
      content: '• Page 1 Automated Table of Contents: Page 1 automatically scans and indexes all subsequent entries with live page numbers, dates, and 1-click jump links.'
    },
    {
      id: 'mg-bullet-j-3',
      type: 'bullet',
      content: '• Paper Rulings: Per-page toggle between Plain White, 1-Line Ruled, and Square Grid paper.'
    },
    {
      id: 'mg-bullet-j-4',
      type: 'bullet',
      content: '• 16 Built-in Templates: Gratitude Log, Bullet Journal (BuJo), Shadow Work, Decision Journal, WOOP Method, Ikigai Mapping, 75 Hard Sprint, Warren Buffett 5/25 Rule, SCAMPER, and Retrospectives.'
    },
    {
      id: 'mg-bullet-j-5',
      type: 'bullet',
      content: '• Edit History & Timeline: Slide-out drawer tracking edits, timestamps, and cached undo/redo snapshots.'
    },
    {
      id: 'mg-div-7',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 7: SECOND BRAIN (PARA METHOD)
    // ==========================================
    {
      id: 'mg-h1-para',
      type: 'h1',
      content: '7. Second Brain (PARA Method)'
    },
    {
      id: 'mg-p-para-1',
      type: 'paragraph',
      content: 'Organizes all digital knowledge by actionability into four clean tiers:'
    },
    {
      id: 'mg-bullet-para-1',
      type: 'bullet',
      content: '🎯 Projects: Active goals with fixed deadlines (e.g. "Launch OmniNotes v2.0").'
    },
    {
      id: 'mg-bullet-para-2',
      type: 'bullet',
      content: '🌿 Areas: Long-term spheres of responsibility to maintain (e.g. "Physical Health & Longevity").'
    },
    {
      id: 'mg-bullet-para-3',
      type: 'bullet',
      content: '📚 Resources: Topics of ongoing interest and reference material (e.g. "TypeScript Performance Playbook").'
    },
    {
      id: 'mg-bullet-para-4',
      type: 'bullet',
      content: '📦 Archives: Inactive items preserved for historical reference and instant search.'
    },
    {
      id: 'mg-div-8',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 8: PERSONAL RELATIONSHIP CRM
    // ==========================================
    {
      id: 'mg-h1-crm',
      type: 'h1',
      content: '8. Personal Relationship CRM'
    },
    {
      id: 'mg-p-crm-1',
      type: 'paragraph',
      content: 'Located under "Personal CRM" in the sidebar. Nurture meaningful connections with friends, family, mentors, and professional colleagues:'
    },
    {
      id: 'mg-bullet-crm-1',
      type: 'bullet',
      content: '• Relationship Tiers: Family, Close Friend, Friend, Mentor, Professional, Acquaintance.'
    },
    {
      id: 'mg-bullet-crm-2',
      type: 'bullet',
      content: '• Cadence Alerts: Set communication frequency (weekly, bi-weekly, monthly) and see who is due for a check-in.'
    },
    {
      id: 'mg-bullet-crm-3',
      type: 'bullet',
      content: '• Birthday Countdown: Visual alert badges (e.g. "🎂 in 7d") for upcoming birthdays.'
    },
    {
      id: 'mg-bullet-crm-4',
      type: 'bullet',
      content: '• 1-Click Catch-up Logging: Records coffee chats, phone calls, and notes with timestamps.'
    },
    {
      id: 'mg-div-9',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 9: INTERACTIVE SLASH COMMANDS DIRECTORY
    // ==========================================
    {
      id: 'mg-h1-slash',
      type: 'h1',
      content: '9. Complete Directory of All "/" Slash Commands'
    },
    {
      id: 'mg-p-slash-desc',
      type: 'paragraph',
      content: 'Type "/" on any blank line to trigger the command menu. Below are live, fully functioning instances of every single specialized block:'
    },

    // 1. Kanban
    {
      id: 'mg-h2-cmd-kanban',
      type: 'h2',
      content: 'Command: /kanban (Visual Workflow Board)'
    },
    {
      id: 'mg-kanban-block',
      type: 'kanban',
      content: '',
      kanbanData: {
        columns: [
          {
            id: 'todo',
            title: 'To Do',
            cards: [
              { id: 'k1', title: 'Plan Q4 roadmap' },
              { id: 'k2', title: 'Schedule dental check-up' }
            ]
          },
          {
            id: 'doing',
            title: 'In Progress',
            cards: [
              { id: 'k3', title: 'Implement Life OS master guide' }
            ]
          },
          {
            id: 'done',
            title: 'Done',
            cards: [
              { id: 'k4', title: 'Build habit tracker engine' },
              { id: 'k5', title: 'Push branch to GitHub' }
            ]
          }
        ]
      }
    },

    // 2. GTD
    {
      id: 'mg-h2-cmd-gtd',
      type: 'h2',
      content: 'Command: /gtd (Getting Things Done 5-Step System)'
    },
    {
      id: 'mg-gtd-block',
      type: 'gtd',
      content: ''
    },

    // 3. OKR
    {
      id: 'mg-h2-cmd-okr',
      type: 'h2',
      content: 'Command: /okr (Objectives & Key Results Tracker)'
    },
    {
      id: 'mg-okr-block',
      type: 'okr',
      content: '',
      interactiveData: {
        objective: 'Achieve Peak Personal Productivity & Mental Clarity',
        keyResults: [
          { id: 'kr1', text: 'Complete daily deep work sprints 5 days/week', progress: 100 },
          { id: 'kr2', text: 'Maintain 75 Hard challenge with 0 cheat days', progress: 85 },
          { id: 'kr3', text: 'Read 24 non-fiction books this year', progress: 70 }
        ]
      }
    },

    // 4. Budget & Kakeibo
    {
      id: 'mg-h2-cmd-budget',
      type: 'h2',
      content: 'Command: /budget & /kakeibo (Mindful Financial Ledger)'
    },
    {
      id: 'mg-budget-block',
      type: 'budget',
      content: ''
    },

    // 5. Mood Tracker
    {
      id: 'mg-h2-cmd-mood',
      type: 'h2',
      content: 'Command: /mood-tracker (Daily Energy, Sleep & Focus Log)'
    },
    {
      id: 'mg-mood-block',
      type: 'mood-tracker',
      content: ''
    },

    // 6. Six Thinking Hats
    {
      id: 'mg-h2-cmd-sixhats',
      type: 'h2',
      content: "Command: /six-hats (Edward de Bono's Decision Model)"
    },
    {
      id: 'mg-sixhats-block',
      type: 'six-hats',
      content: ''
    },

    {
      id: 'mg-div-10',
      type: 'divider',
      content: ''
    },

    // ==========================================
    // PART 10: SYNC & LOCAL AI REST OPENAPI
    // ==========================================
    {
      id: 'mg-h1-sync-api',
      type: 'h1',
      content: '10. Cross-Device Sync & Local AI REST OpenAPI Engine'
    },
    {
      id: 'mg-callout-sync',
      type: 'callout',
      content: '☁️ Google Drive Cross-Device Sync: OmniNotes encrypts and synchronizes your entire vault directly to Google Drive as an offline-first PWA, accessible from your desktop, tablet, and mobile browsers with zero vendor lock-in.',
      calloutIcon: '☁️',
      calloutColor: '#E0E7FF'
    },
    {
      id: 'mg-callout-api',
      type: 'callout',
      content: '🤖 Local AI REST API & OpenAPI Spec: Click the "API" button in the sidebar footer to view live OpenAPI 3.1 specs, cURL snippets, and test interactive endpoints (/api/notes, /api/search, /api/tasks, /api/habits) to connect OmniNotes to any local or cloud AI assistant.',
      calloutIcon: '🤖',
      calloutColor: '#F3E8FF'
    },
    {
      id: 'mg-p-conclusion',
      type: 'paragraph',
      content: 'OmniNotes gives you the speed and beauty of Apple Notes, the modular block power of Notion, the spatial canvas of Microsoft OneNote, and the ultimate Life OS productivity toolkit. Enjoy writing!'
    }
  ]
};
