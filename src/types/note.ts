export type FontStyle = 'sans' | 'serif' | 'mono' | 'handwritten';

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  parentId?: string | null;
  createdAt: number;
}

export type BlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'paragraph'
  | 'bullet'
  | 'number'
  | 'task'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'table'
  | 'divider'
  | 'subpage'
  | 'link-to-page'
  | 'bookmark'
  | 'webview'
  | 'youtube'
  | 'equation'
  | 'html'
  | 'code'
  | 'timeline'
  | 'image'
  | 'toc';

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface BlockItem {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  isOpen?: boolean;
  children?: BlockItem[];
  calloutIcon?: string;
  calloutColor?: string;
  tableData?: TableData;
  subpageId?: string;
  linkedNoteId?: string;
  url?: string;
  imageUrl?: string;
  imageCaption?: string;
  timelineEvents?: TimelineEvent[];
  language?: string;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
  bgColor?: string;
}

export type ShapeType =
  | 'rectangle'
  | 'rounded-rect'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'star'
  | 'speech-bubble'
  | 'cloud';

export type ConnectorType = 'straight' | 'arrow' | 'double-arrow' | 'curved';

export interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'connector' | 'drawing' | 'mindmap-node' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: FontStyle;
  textColor?: string;
  points?: { x: number; y: number }[]; // For freehand drawing
  tool?: 'pen' | 'highlighter';
  connectorStart?: { elementId?: string; x: number; y: number };
  connectorEnd?: { elementId?: string; x: number; y: number };
  connectorType?: ConnectorType;
  parentId?: string; // For mind map tree
  childrenIds?: string[];
}

export interface Reminder {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notified?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  folderId?: string;
  notebookId?: string;
  unitId?: string;
  chapterId?: string;
  isSubpage?: boolean;
  parentPageId?: string;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  tags: string[];
  color?: string; // Google Keep card tint
  pageColor?: string; // Page background
  fontFamily: FontStyle;
  fontSize: number;
  viewMode: 'document' | 'canvas' | 'timeline' | 'both';
  blocks: BlockItem[];
  canvasElements: CanvasElement[];
  reminder?: Reminder | null;
  createdAt: number;
  updatedAt: number;
}

export interface GDriveConfig {
  clientId: string;
  apiKey: string;
  accessToken?: string;
  userEmail?: string;
  isAuthorized: boolean;
  lastSyncedAt?: number;
}
