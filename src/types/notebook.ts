export interface NotebookChapter {
  id: string;
  notebookId: string;
  unitId: string;
  name: string;
  color: string; // Vivid OneNote section tab color (hex)
  pageIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NotebookUnit {
  id: string;
  notebookId: string;
  name: string; // e.g. "Unit 1: Foundations"
  chapters: NotebookChapter[];
  createdAt: number;
  updatedAt: number;
}

export interface Notebook {
  id: string;
  name: string;
  color: string; // OneNote binder color
  icon?: string;
  units: NotebookUnit[];
  createdAt: number;
  updatedAt: number;
}

export interface OneNoteTabColor {
  name: string;
  hex: string;
  bgLight: string;
  border: string;
  badge: string;
}

export const ONENOTE_TAB_COLORS: OneNoteTabColor[] = [
  { name: 'Purple', hex: '#873999', bgLight: '#F5EBF7', border: '#873999', badge: 'bg-[#873999]' },
  { name: 'Blue', hex: '#0078D4', bgLight: '#EDF5FC', border: '#0078D4', badge: 'bg-[#0078D4]' },
  { name: 'Teal', hex: '#038387', bgLight: '#E8F6F6', border: '#038387', badge: 'bg-[#038387]' },
  { name: 'Green', hex: '#107C41', bgLight: '#EBF7EE', border: '#107C41', badge: 'bg-[#107C41]' },
  { name: 'Red', hex: '#D83B01', bgLight: '#FDF1EC', border: '#D83B01', badge: 'bg-[#D83B01]' },
  { name: 'Orange', hex: '#CA5010', bgLight: '#FCF3EB', border: '#CA5010', badge: 'bg-[#CA5010]' },
  { name: 'Yellow', hex: '#D97706', bgLight: '#FEF3C7', border: '#D97706', badge: 'bg-[#D97706]' },
  { name: 'Magenta', hex: '#C239B3', bgLight: '#FAF0F9', border: '#C239B3', badge: 'bg-[#C239B3]' }
];

export const ONENOTE_BINDER_COLORS = [
  { name: 'OneNote Purple', hex: '#7719AA' },
  { name: 'Deep Blue', hex: '#0063B1' },
  { name: 'Dark Teal', hex: '#038387' },
  { name: 'Forest Green', hex: '#107C41' },
  { name: 'Rust Red', hex: '#D83B01' },
  { name: 'Crimson', hex: '#D13438' },
  { name: 'Graphite', hex: '#5B6B72' },
  { name: 'Bronze Gold', hex: '#B46C00' }
];
