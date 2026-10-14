import React, { useEffect, useState, useRef } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Quote,
  MessageSquare,
  Table as TableIcon,
  Minus,
  FileText,
  Bookmark,
  Video,
  Sigma,
  Code
} from 'lucide-react';
import { BlockType } from '../../types/note';

export interface SlashMenuItem {
  type: BlockType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const SLASH_COMMANDS: SlashMenuItem[] = [
  { type: 'h1', title: 'Heading 1', description: 'Big section heading', icon: <Heading1 className="w-4 h-4 text-amber-600" /> },
  { type: 'h2', title: 'Heading 2', description: 'Medium section heading', icon: <Heading2 className="w-4 h-4 text-amber-600" /> },
  { type: 'h3', title: 'Heading 3', description: 'Small section heading', icon: <Heading3 className="w-4 h-4 text-amber-600" /> },
  { type: 'h4', title: 'Heading 4', description: 'Sub-heading', icon: <Heading4 className="w-4 h-4 text-amber-600" /> },
  { type: 'bullet', title: 'Bulleted List', description: 'Create a simple bulleted list', icon: <List className="w-4 h-4 text-blue-500" /> },
  { type: 'number', title: 'Numbered List', description: 'Create a numbered ordered list', icon: <ListOrdered className="w-4 h-4 text-blue-500" /> },
  { type: 'task', title: 'To-do List', description: 'Track tasks with checkboxes & confetti', icon: <CheckSquare className="w-4 h-4 text-emerald-500" /> },
  { type: 'toggle', title: 'Toggle List', description: 'Collapsible toggle list', icon: <ChevronRight className="w-4 h-4 text-slate-500" /> },
  { type: 'callout', title: 'Callout', description: 'Highlight important info in a box', icon: <MessageSquare className="w-4 h-4 text-yellow-500" /> },
  { type: 'quote', title: 'Quote', description: 'Capture a quote or reference', icon: <Quote className="w-4 h-4 text-slate-500" /> },
  { type: 'table', title: 'Table', description: 'Interactive Notion-style table', icon: <TableIcon className="w-4 h-4 text-purple-500" /> },
  { type: 'divider', title: 'Divider', description: 'Visually divide sections', icon: <Minus className="w-4 h-4 text-slate-400" /> },
  { type: 'subpage', title: 'Sub-page', description: 'Embed a child page inside this page', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
  { type: 'equation', title: 'Math Equation', description: 'KaTeX LaTeX mathematical formula', icon: <Sigma className="w-4 h-4 text-red-500" /> },
  { type: 'code', title: 'Code Block', description: 'Syntax-highlighted code snippet', icon: <Code className="w-4 h-4 text-emerald-600" /> },
  { type: 'bookmark', title: 'Web Bookmark', description: 'Visual link card preview', icon: <Bookmark className="w-4 h-4 text-sky-500" /> },
  { type: 'youtube', title: 'YouTube Embed', description: 'Embed a video from YouTube', icon: <Video className="w-4 h-4 text-red-600" /> }
];

interface SlashMenuProps {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ query, onSelect, onClose, position }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase()) ||
    cmd.type.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.min(position.top, window.innerHeight - 320)}px`,
        left: `${Math.min(position.left, window.innerWidth - 300)}px`
      }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md rounded-xl shadow-apple-floating border border-black/10 dark:border-white/10 p-1.5 scrollbar-thin animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        Basic Blocks
      </div>
      {filtered.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors ${
              isSelected
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-neutral-800 shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
