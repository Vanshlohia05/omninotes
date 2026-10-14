import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BlockItem as BlockItemType, BlockType, NoteItem } from '../../types/note';
import { BlockItem } from './BlockItem';
import { SlashMenu } from './SlashMenu';
import { TableOfContents } from './TableOfContents';

interface BlockEditorProps {
  note: NoteItem;
  onChange: (updatedBlocks: BlockItemType[]) => void;
  onNavigateSubpage?: (subpageId: string) => void;
  onCreateSubpage?: (title: string) => string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  note,
  onChange,
  onNavigateSubpage,
  onCreateSubpage
}) => {
  const [slashMenuState, setSlashMenuState] = useState<{
    isOpen: boolean;
    blockIndex: number;
    position: { top: number; left: number };
    query: string;
  }>({
    isOpen: false,
    blockIndex: 0,
    position: { top: 0, left: 0 },
    query: ''
  });

  const blocks = note.blocks.length > 0 ? note.blocks : [{ id: `b-${Date.now()}`, type: 'paragraph' as const, content: '' }];

  const handleUpdateBlock = (index: number, updated: BlockItemType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updated;
    onChange(newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      // Clear content instead of removing sole block
      onChange([{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }]);
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const handleInsertAfter = (index: number, type: BlockType = 'paragraph') => {
    const newBlock: BlockItemType = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content: ''
    };
    const newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    onChange(newBlocks);
  };

  const handleTriggerSlash = (index: number, position: { top: number; left: number }) => {
    setSlashMenuState({
      isOpen: true,
      blockIndex: index,
      position,
      query: ''
    });
  };

  const handleSelectSlashCommand = (type: BlockType) => {
    const { blockIndex } = slashMenuState;
    const targetBlock = blocks[blockIndex];

    let subpageId: string | undefined;
    if (type === 'subpage' && onCreateSubpage) {
      subpageId = onCreateSubpage('Untitled Sub-page');
    }

    const updated: BlockItemType = {
      ...targetBlock,
      type,
      content: targetBlock.content.replace('/', ''),
      subpageId
    };

    if (type === 'table') {
      updated.tableData = {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data A', 'Data B', 'Data C'],
          ['Data D', 'Data E', 'Data F']
        ]
      };
    }

    handleUpdateBlock(blockIndex, updated);
    setSlashMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleScrollToBlock = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto py-6 px-4 sm:px-8 space-y-1">
      {/* Table of Contents if note has headings */}
      {blocks.some((b) => ['h1', 'h2', 'h3'].includes(b.type)) && (
        <TableOfContents blocks={blocks} onScrollToBlock={handleScrollToBlock} />
      )}

      {/* Block List */}
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          index={index}
          onUpdate={(updated) => handleUpdateBlock(index, updated)}
          onDelete={() => handleDeleteBlock(index)}
          onInsertAfter={() => handleInsertAfter(index)}
          onTriggerSlash={(pos) => handleTriggerSlash(index, pos)}
          onNavigateSubpage={onNavigateSubpage}
        />
      ))}

      {/* Add Block at Bottom */}
      <div className="pt-4">
        <button
          onClick={() => handleInsertAfter(blocks.length - 1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 py-1.5 px-3 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Click to add a block or type '/'
        </button>
      </div>

      {/* Floating Slash Menu */}
      {slashMenuState.isOpen && (
        <SlashMenu
          query={slashMenuState.query}
          position={slashMenuState.position}
          onSelect={handleSelectSlashCommand}
          onClose={() => setSlashMenuState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
