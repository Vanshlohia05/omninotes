import React from 'react';
import { ListTree } from 'lucide-react';
import { BlockItem } from '../../types/note';

interface TableOfContentsProps {
  blocks: BlockItem[];
  onScrollToBlock: (blockId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ blocks, onScrollToBlock }) => {
  const headings = blocks.filter((b) => ['h1', 'h2', 'h3', 'h4'].includes(b.type));

  if (headings.length === 0) {
    return (
      <div className="my-3 p-3 rounded-lg border border-dashed border-slate-300 dark:border-neutral-700 text-xs text-slate-400 text-center">
        Table of Contents: Add Heading blocks (H1-H4) to populate this outline.
      </div>
    );
  }

  return (
    <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-black/5 dark:border-white/5">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <ListTree className="w-4 h-4 text-amber-600" />
        Table of Contents
      </div>
      <div className="space-y-1">
        {headings.map((heading) => {
          const indent =
            heading.type === 'h1'
              ? 'pl-1 font-semibold text-slate-800 dark:text-slate-100'
              : heading.type === 'h2'
              ? 'pl-4 font-medium text-slate-700 dark:text-slate-200'
              : heading.type === 'h3'
              ? 'pl-7 text-slate-600 dark:text-slate-300'
              : 'pl-10 text-slate-500 text-xs';

          return (
            <button
              key={heading.id}
              onClick={() => onScrollToBlock(heading.id)}
              className={`block w-full text-left text-sm py-1 rounded hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition truncate ${indent}`}
            >
              {heading.content || 'Untitled Section'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
