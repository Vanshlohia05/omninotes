import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BlockItem as BlockItemType, BlockType, NoteItem } from '../../types/note';
import { BlockItem } from './BlockItem';
import { SlashMenu } from './SlashMenu';
import { TableOfContents } from './TableOfContents';

interface BlockEditorProps {
  note: NoteItem;
  allNotes?: NoteItem[];
  onChange: (updatedBlocks: BlockItemType[]) => void;
  onNavigateSubpage?: (subpageId: string) => void;
  onCreateSubpage?: (title: string) => string;
  onInlineTagsFound?: (tags: string[]) => void;
  fullWidth?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  note,
  allNotes = [],
  onChange,
  onNavigateSubpage,
  onCreateSubpage,
  onInlineTagsFound,
  fullWidth = false
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

  const [focusTarget, setFocusTarget] = useState<{ id: string; pos?: 'start' | 'end' | number } | null>(null);

  const blocks = note.blocks.length > 0 ? note.blocks : [{ id: `b-${Date.now()}`, type: 'paragraph' as const, content: '' }];

  const handleUpdateBlock = (index: number, updated: BlockItemType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updated;
    onChange(newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      const emptyBlock: BlockItemType = { id: `b-${Date.now()}`, type: 'paragraph', content: '' };
      onChange([emptyBlock]);
      setFocusTarget({ id: emptyBlock.id, pos: 'start' });
      return;
    }
    const prevBlock = blocks[index - 1];
    const nextBlock = blocks[index + 1];
    const targetToFocus = prevBlock || nextBlock;
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
    if (targetToFocus) {
      setFocusTarget({ id: targetToFocus.id, pos: prevBlock ? 'end' : 'start' });
    }
  };

  const handleInsertAfter = (index: number, type: BlockType = 'paragraph', content = '', focusPos: 'start' | 'end' | number = 'start') => {
    const newBlock: BlockItemType = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content
    };
    const newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    onChange(newBlocks);
    setFocusTarget({ id: newBlock.id, pos: focusPos });
  };

  const handleSplitBlock = (index: number, splitPos: number) => {
    const currentBlock = blocks[index];
    const beforeText = currentBlock.content.slice(0, splitPos);
    const afterText = currentBlock.content.slice(splitPos);

    // If current block is an empty list item or task, turn it back into a standard paragraph
    if (
      (currentBlock.type === 'bullet' || currentBlock.type === 'number' || currentBlock.type === 'task') &&
      currentBlock.content.trim() === ''
    ) {
      handleUpdateBlock(index, { ...currentBlock, type: 'paragraph' });
      setFocusTarget({ id: currentBlock.id, pos: 'start' });
      return;
    }

    // Maintain block type for consecutive list items
    const nextType: BlockType =
      currentBlock.type === 'bullet' || currentBlock.type === 'number' || currentBlock.type === 'task'
        ? currentBlock.type
        : 'paragraph';

    const updatedCurrent: BlockItemType = {
      ...currentBlock,
      content: beforeText
    };

    const newBlock: BlockItemType = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: nextType,
      content: afterText,
      checked: nextType === 'task' ? false : undefined
    };

    const newBlocks = [
      ...blocks.slice(0, index),
      updatedCurrent,
      newBlock,
      ...blocks.slice(index + 1)
    ];

    onChange(newBlocks);
    setFocusTarget({ id: newBlock.id, pos: 0 });
  };

  const handleMergeWithPrevious = (index: number) => {
    if (index === 0) return;
    const currentBlock = blocks[index];
    const prevBlock = blocks[index - 1];

    const textTypes = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'bullet', 'number', 'task', 'quote'];
    if (textTypes.includes(prevBlock.type) && textTypes.includes(currentBlock.type)) {
      const prevLength = prevBlock.content.length;
      const updatedPrev: BlockItemType = {
        ...prevBlock,
        content: prevBlock.content + currentBlock.content
      };
      const newBlocks = [...blocks.slice(0, index - 1), updatedPrev, ...blocks.slice(index + 1)];
      onChange(newBlocks);
      setFocusTarget({ id: prevBlock.id, pos: prevLength });
    } else {
      handleDeleteBlock(index);
    }
  };

  const handleNavigateBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setFocusTarget({ id: blocks[index - 1].id, pos: 'end' });
    } else if (direction === 'down' && index < blocks.length - 1) {
      setFocusTarget({ id: blocks[index + 1].id, pos: 'start' });
    }
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

    if (type === 'timeline') {
      updated.timelineEvents = [
        {
          id: `ev-${Date.now()}-1`,
          date: new Date().toISOString().split('T')[0],
          title: 'Project Kickoff',
          description: 'Initial scope, architecture, and setup.',
          status: 'completed'
        },
        {
          id: `ev-${Date.now()}-2`,
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          title: 'Milestone 1: Core Feature Development',
          description: 'Implement block editor, canvas, and cloud sync.',
          status: 'in-progress'
        },
        {
          id: `ev-${Date.now()}-3`,
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          title: 'Final Release & Review',
          description: 'Complete cross-device sync verification.',
          status: 'planned'
        }
      ];
    }

    if (type === 'link-to-page' && allNotes.length > 0) {
      const otherNote = allNotes.find((n) => n.id !== note.id) || allNotes[0];
      if (otherNote) {
        updated.linkedNoteId = otherNote.id;
      }
    }

    if (type === 'webview') {
      updated.url = 'https://en.wikipedia.org/wiki/Main_Page';
    }

    if (type === 'habit') {
      updated.habitData = {
        title: 'Daily Habit Goal',
        category: 'Routine',
        color: '#10B981',
        icon: '✨',
        streak: 0,
        todayCompleted: false,
        completions: {}
      };
    }

    if (type === 'kanban') {
      updated.kanbanData = {
        columns: [
          { id: 'todo', title: 'To Do', cards: [{ id: 'c1', title: 'Research & outline' }] },
          { id: 'doing', title: 'In Progress', cards: [{ id: 'c2', title: 'Draft implementation' }] },
          { id: 'done', title: 'Done', cards: [{ id: 'c3', title: 'Milestone kickoff' }] }
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

  const focusLastOrCreate = () => {
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && lastBlock.content.trim() === '') {
      setFocusTarget({ id: lastBlock.id, pos: 'end' });
    } else {
      handleInsertAfter(blocks.length - 1, 'paragraph', '', 'start');
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      focusLastOrCreate();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      onTouchEnd={handleContainerClick}
      className={`relative w-full py-6 transition-all duration-150 cursor-text touch-manipulation ${
        fullWidth
          ? 'max-w-none px-2 sm:px-6 space-y-1'
          : 'max-w-4xl mx-auto px-4 sm:px-8 space-y-1'
      } min-h-[calc(100vh-140px)]`}
    >
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
          totalBlocks={blocks.length}
          focusTarget={focusTarget}
          onClearFocusTarget={() => setFocusTarget(null)}
          allNotes={allNotes}
          onUpdate={(updated) => handleUpdateBlock(index, updated)}
          onDelete={() => handleDeleteBlock(index)}
          onInsertAfter={() => handleInsertAfter(index)}
          onSplit={(pos) => handleSplitBlock(index, pos)}
          onMergeWithPrevious={() => handleMergeWithPrevious(index)}
          onNavigate={(dir) => handleNavigateBlock(index, dir)}
          onTriggerSlash={(pos) => handleTriggerSlash(index, pos)}
          onNavigateSubpage={onNavigateSubpage}
          onInlineTagsFound={onInlineTagsFound}
        />
      ))}

      {/* Add Block at Bottom */}
      <div className="pt-4">
        <button
          onClick={() => handleInsertAfter(blocks.length - 1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 py-1.5 px-3 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition touch-manipulation"
        >
          <Plus className="w-3.5 h-3.5" />
          Click to add a block or type '/'
        </button>
      </div>

      {/* Tap anywhere in bottom area to focus keyboard */}
      <div
        role="button"
        tabIndex={0}
        onClick={focusLastOrCreate}
        onTouchEnd={focusLastOrCreate}
        className="h-44 w-full cursor-text touch-manipulation"
      />

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
