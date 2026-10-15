import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Play,
  Calendar,
  Link as LinkIcon,
  Globe,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Upload,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import katex from 'katex';
import { BlockItem as BlockItemType, NoteItem, TableData, TimelineEvent } from '../../types/note';
import { TableBlock } from './TableBlock';
import { TimelineBlock } from './TimelineBlock';

interface BlockItemProps {
  block: BlockItemType;
  index: number;
  allNotes?: NoteItem[];
  onUpdate: (updated: BlockItemType) => void;
  onDelete: () => void;
  onInsertAfter: () => void;
  onTriggerSlash: (position: { top: number; left: number }) => void;
  onNavigateSubpage?: (subpageId: string) => void;
  onInlineTagsFound?: (tags: string[]) => void;
}

const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Purple', value: '#7C3AED' }
];

const BG_HIGHLIGHTS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Mint', value: '#BBF7D0' },
  { name: 'Sky', value: '#BAE6FD' },
  { name: 'Lavender', value: '#DDD6FE' },
  { name: 'Pink', value: '#FBCFE8' }
];

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  allNotes = [],
  onUpdate,
  onDelete,
  onInsertAfter,
  onTriggerSlash,
  onNavigateSubpage,
  onInlineTagsFound
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const equationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.style.height = 'auto';
      textInputRef.current.style.height = `${textInputRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  // Render KaTeX for equation block
  useEffect(() => {
    if (block.type === 'equation' && equationRef.current) {
      try {
        katex.render(block.content || 'E = mc^2', equationRef.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch {
        equationRef.current.innerText = block.content;
      }
    }
  }, [block.type, block.content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onInsertAfter();
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val === '/') {
      const rect = e.target.getBoundingClientRect();
      onTriggerSlash({ top: rect.bottom + 4, left: rect.left });
    }

    // Detect inline hashtags: #tag-name
    const matches = val.match(/#[a-zA-Z0-9_\-]+/g);
    if (matches && onInlineTagsFound) {
      const tags = matches.map((t) => t.substring(1));
      onInlineTagsFound(tags);
    }

    onUpdate({ ...block, content: val });
  };

  const handleTaskToggle = () => {
    const nextState = !block.checked;
    if (nextState) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E5A93C', '#FF9500', '#10B981', '#3B82F6']
      });
    }
    onUpdate({ ...block, checked: nextState });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Case transforms
  const transformCase = (mode: 'upper' | 'lower' | 'title') => {
    let text = block.content;
    if (mode === 'upper') text = text.toUpperCase();
    if (mode === 'lower') text = text.toLowerCase();
    if (mode === 'title') {
      text = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    onUpdate({ ...block, content: text });
  };

  // Image file upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdate({ ...block, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // YouTube embed helper
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const textAlignClass =
    block.align === 'center'
      ? 'text-center'
      : block.align === 'right'
      ? 'text-right'
      : 'text-left';

  const blockTextStyle: React.CSSProperties = {
    color: block.textColor || undefined,
    backgroundColor: block.bgColor || undefined
  };

  const handleFocusTextarea = (target: HTMLElement) => {
    if (target.closest('button, input, textarea, a, select, [role="button"], .katex, table')) {
      return;
    }
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleFocusTextarea(e.target as HTMLElement);
  };

  const handleRowTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    handleFocusTextarea(e.target as HTMLElement);
  };

  return (
    <div
      id={`block-${block.id}`}
      role="group"
      onClick={handleRowClick}
      onTouchEnd={handleRowTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFormatOpen(false);
      }}
      className="group relative flex items-start gap-1 py-1 px-1 rounded-lg transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015] cursor-text touch-manipulation"
    >
      {/* Block Controls & Drag Handle */}
      <div
        className={`flex items-center gap-0.5 pt-1 pr-1 select-none transition-opacity ${
          isHovered
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto'
        }`}
      >
        <button
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5"
          title="Drag block"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Per-block styling popover button */}
        <div className="relative">
          <button
            onClick={() => setIsFormatOpen(!isFormatOpen)}
            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="Block Formatting (Color, Alignment, Case)"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {isFormatOpen && (
            <div className="absolute left-6 top-0 w-52 p-2 bg-white dark:bg-[#252525] rounded-xl shadow-apple-floating border border-black/10 dark:border-white/10 z-50 space-y-2 text-xs">
              {/* Alignment */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Align</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdate({ ...block, align: 'left' })}
                    className={`p-1 rounded ${block.align === 'left' || !block.align ? 'bg-amber-100 text-amber-800' : 'hover:bg-black/5'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdate({ ...block, align: 'center' })}
                    className={`p-1 rounded ${block.align === 'center' ? 'bg-amber-100 text-amber-800' : 'hover:bg-black/5'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdate({ ...block, align: 'right' })}
                    className={`p-1 rounded ${block.align === 'right' ? 'bg-amber-100 text-amber-800' : 'hover:bg-black/5'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Case transform */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Case</span>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => transformCase('upper')}
                    className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-amber-100 hover:text-amber-800"
                  >
                    AA
                  </button>
                  <button
                    onClick={() => transformCase('lower')}
                    className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-amber-100 hover:text-amber-800"
                  >
                    aa
                  </button>
                  <button
                    onClick={() => transformCase('title')}
                    className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-amber-100 hover:text-amber-800"
                  >
                    Aa
                  </button>
                </div>
              </div>

              {/* Text color */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Color</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.name}
                      onClick={() => onUpdate({ ...block, textColor: tc.value || undefined })}
                      title={tc.name}
                      className="w-4 h-4 rounded-full border border-black/10 hover:scale-110 transition"
                      style={{ backgroundColor: tc.value || '#64748B' }}
                    />
                  ))}
                </div>
              </div>

              {/* Highlight background */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Highlight</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BG_HIGHLIGHTS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => onUpdate({ ...block, bgColor: bg.value || undefined })}
                      title={bg.name}
                      className="w-4 h-4 rounded-full border border-black/10 hover:scale-110 transition"
                      style={{ backgroundColor: bg.value || '#E2E8F0' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          title="Delete block"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Main Block Content */}
      <div className="flex-1 min-w-0">
        {/* Headings */}
        {block.type === 'h1' && (
          <textarea
            ref={textInputRef}
            rows={1}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 1"
            style={blockTextStyle}
            className={`w-full resize-none overflow-hidden bg-transparent font-bold text-2xl lg:text-3xl text-slate-900 dark:text-slate-50 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-tight ${textAlignClass}`}
          />
        )}

        {block.type === 'h2' && (
          <textarea
            ref={textInputRef}
            rows={1}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 2"
            style={blockTextStyle}
            className={`w-full resize-none overflow-hidden bg-transparent font-semibold text-xl lg:text-2xl text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-snug ${textAlignClass}`}
          />
        )}

        {block.type === 'h3' && (
          <textarea
            ref={textInputRef}
            rows={1}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 3"
            style={blockTextStyle}
            className={`w-full resize-none overflow-hidden bg-transparent font-medium text-lg lg:text-xl text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-snug ${textAlignClass}`}
          />
        )}

        {block.type === 'h4' && (
          <textarea
            ref={textInputRef}
            rows={1}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Heading 4"
            style={blockTextStyle}
            className={`w-full resize-none overflow-hidden bg-transparent font-medium text-base text-slate-700 dark:text-slate-300 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 ${textAlignClass}`}
          />
        )}

        {/* Paragraph */}
        {block.type === 'paragraph' && (
          <textarea
            ref={textInputRef}
            rows={1}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands..."
            style={blockTextStyle}
            className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-base ${textAlignClass}`}
          />
        )}

        {/* Bullet List */}
        {block.type === 'bullet' && (
          <div className="flex items-start gap-2.5">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-400 shrink-0" />
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="List item..."
              style={blockTextStyle}
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-base ${textAlignClass}`}
            />
          </div>
        )}

        {/* Numbered List */}
        {block.type === 'number' && (
          <div className="flex items-start gap-2">
            <span className="font-mono text-sm text-slate-500 dark:text-slate-400 select-none pt-0.5 min-w-[20px]">
              {index + 1}.
            </span>
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Numbered item..."
              style={blockTextStyle}
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-base ${textAlignClass}`}
            />
          </div>
        )}

        {/* Task List (Checkbox + strike-through) */}
        {block.type === 'task' && (
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={handleTaskToggle}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
            />
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="To-do item..."
              style={blockTextStyle}
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-base transition-all ${
                block.checked ? 'line-through text-slate-400 dark:text-slate-500' : ''
              } ${textAlignClass}`}
            />
          </div>
        )}

        {/* Toggle List (Collapsible) */}
        {block.type === 'toggle' && (
          <div className="space-y-1">
            <div className="flex items-start gap-1.5">
              <button
                onClick={() => onUpdate({ ...block, isOpen: !block.isOpen })}
                className="p-1 rounded text-slate-500 hover:bg-slate-200/50 dark:hover:bg-neutral-800 transition"
              >
                {block.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <textarea
                ref={textInputRef}
                rows={1}
                value={block.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Toggle header..."
                style={blockTextStyle}
                className={`w-full resize-none overflow-hidden bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 text-base ${textAlignClass}`}
              />
            </div>
            {block.isOpen && (
              <div className="pl-6 border-l-2 border-slate-200 dark:border-neutral-800 ml-2 space-y-2 py-1">
                <textarea
                  rows={2}
                  value={block.children?.[0]?.content || ''}
                  onChange={(e) => {
                    const children = [{ id: `${block.id}-child`, type: 'paragraph' as const, content: e.target.value }];
                    onUpdate({ ...block, children });
                  }}
                  placeholder="Empty toggle content. Click to add details..."
                  className="w-full resize-none bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Callout Block */}
        {block.type === 'callout' && (
          <div
            style={{ backgroundColor: block.calloutColor || '#FEF9C3' }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-black/5 dark:border-white/5 my-2 text-slate-800 dark:text-slate-900 shadow-sm"
          >
            <div className="text-xl select-none pt-0.5">{block.calloutIcon || '💡'}</div>
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Callout text..."
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 leading-relaxed text-base ${textAlignClass}`}
            />
          </div>
        )}

        {/* Quote Block */}
        {block.type === 'quote' && (
          <div className="border-l-3 border-amber-500 pl-4 py-1 italic my-2">
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Empty quote..."
              style={blockTextStyle}
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-base ${textAlignClass}`}
            />
          </div>
        )}

        {/* Interactive Notion Table Block */}
        {block.type === 'table' && (
          <TableBlock
            data={block.tableData}
            onChange={(newData: TableData) => onUpdate({ ...block, tableData: newData })}
          />
        )}

        {/* Timeline View Block */}
        {block.type === 'timeline' && (
          <TimelineBlock
            events={block.timelineEvents}
            onChange={(events: TimelineEvent[]) => onUpdate({ ...block, timelineEvents: events })}
          />
        )}

        {/* Divider Block */}
        {block.type === 'divider' && (
          <div className="py-3">
            <hr className="border-t border-slate-200 dark:border-neutral-800" />
          </div>
        )}

        {/* Sub-page Block (Notion page within page) */}
        {block.type === 'subpage' && (
          <div
            onClick={() => onNavigateSubpage && onNavigateSubpage(block.subpageId || '')}
            className="flex items-center gap-2.5 p-2.5 my-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer group transition shadow-sm bg-white dark:bg-[#202020]"
          >
            <span className="text-xl">📄</span>
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Sub-page title..."
              className="font-medium text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none flex-1"
            />
            <span className="text-xs text-slate-400 group-hover:text-amber-600 transition flex items-center gap-1">
              Open Page <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Link to Page (Notion feature) */}
        {block.type === 'link-to-page' && (
          <div className="my-2 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#202020] shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <select
                  value={block.linkedNoteId || ''}
                  onChange={(e) => onUpdate({ ...block, linkedNoteId: e.target.value })}
                  className="w-full text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">Select a note to link...</option>
                  {allNotes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title || 'Untitled Note'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {block.linkedNoteId && (
              <button
                onClick={() => onNavigateSubpage && onNavigateSubpage(block.linkedNoteId!)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition shrink-0"
              >
                <span>Jump to Note</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Image Block */}
        {block.type === 'image' && (
          <div className="my-3 space-y-2 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-800/40">
            {block.imageUrl ? (
              <div className="space-y-2">
                <div className={`overflow-hidden rounded-lg flex ${textAlignClass === 'text-center' ? 'justify-center' : textAlignClass === 'text-right' ? 'justify-end' : 'justify-start'}`}>
                  <img
                    src={block.imageUrl}
                    alt={block.imageCaption || 'Note attachment'}
                    className="max-h-96 rounded-lg object-contain border border-black/5 dark:border-white/5 shadow-sm"
                  />
                </div>
                <input
                  type="text"
                  value={block.imageCaption || ''}
                  onChange={(e) => onUpdate({ ...block, imageCaption: e.target.value })}
                  placeholder="Add an image caption..."
                  className="w-full text-center text-xs text-slate-500 bg-transparent focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={block.imageUrl || ''}
                    onChange={(e) => onUpdate({ ...block, imageUrl: e.target.value })}
                    placeholder="Paste image URL (https://...)..."
                    className="flex-1 text-xs bg-white dark:bg-neutral-900 p-2 rounded-lg border border-black/10 dark:border-white/10 focus:outline-none"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-pink-500" />
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Web View Block */}
        {block.type === 'webview' && (
          <div className="my-3 space-y-2 rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-800/40 p-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-600" />
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => onUpdate({ ...block, url: e.target.value })}
                placeholder="Enter live website URL to embed (e.g. https://example.com)..."
                className="flex-1 text-xs bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-black/10 dark:border-white/10 focus:outline-none"
              />
              {block.url && (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-cyan-600 transition"
                  title="Open externally"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {block.url ? (
              <div className="w-full h-80 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 shadow-inner">
                <iframe
                  src={block.url}
                  title="Web view"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            ) : (
              <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-neutral-900 flex items-center justify-center text-xs text-slate-400">
                Enter URL above to load interactive live web view
              </div>
            )}
          </div>
        )}

        {/* Web Bookmark Block */}
        {block.type === 'bookmark' && (
          <div className="my-2 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#202020] shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => onUpdate({ ...block, url: e.target.value })}
                placeholder="Paste web URL (e.g. https://apple.com)..."
                className="w-full text-xs font-mono bg-slate-50 dark:bg-neutral-800 p-1.5 rounded border border-black/5 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {block.url && (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-amber-600 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <textarea
              ref={textInputRef}
              rows={1}
              value={block.content}
              onChange={handleChange}
              placeholder="Bookmark description / title..."
              className="w-full resize-none overflow-hidden bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
            />
          </div>
        )}

        {/* YouTube Embed Block */}
        {block.type === 'youtube' && (
          <div className="my-3 space-y-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-800 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <Play className="w-3.5 h-3.5" /> YouTube
              </span>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => onUpdate({ ...block, url: e.target.value })}
                placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)..."
                className="flex-1 text-xs bg-white dark:bg-neutral-900 p-1.5 rounded border border-black/5 dark:border-white/5 focus:outline-none"
              />
            </div>
            {block.url ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                <iframe
                  src={getYouTubeEmbedUrl(block.url)}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-slate-200 dark:bg-neutral-900 flex items-center justify-center text-xs text-slate-400">
                Enter YouTube link above to load video preview
              </div>
            )}
          </div>
        )}

        {/* KaTeX Math Equation Block */}
        {block.type === 'equation' && (
          <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>LaTeX Math Equation</span>
              <span className="font-mono text-[10px]">KaTeX Rendered</span>
            </div>
            <textarea
              ref={textInputRef}
              rows={2}
              value={block.content}
              onChange={handleChange}
              placeholder="Enter LaTeX formula, e.g. \int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
              className="w-full font-mono text-xs p-2 rounded bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div
              ref={equationRef}
              className="py-2 px-3 overflow-x-auto text-center text-slate-900 dark:text-slate-100 min-h-[40px] flex items-center justify-center"
            />
          </div>
        )}

        {/* Code Block with Syntax & Copy */}
        {block.type === 'code' && (
          <div className="my-3 rounded-xl overflow-hidden bg-neutral-900 text-slate-100 shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800 text-xs text-slate-400 border-b border-neutral-700">
              <input
                type="text"
                value={block.language || 'typescript'}
                onChange={(e) => onUpdate({ ...block, language: e.target.value })}
                placeholder="Language (e.g. js, python, sql)..."
                className="bg-transparent font-mono text-xs focus:outline-none text-amber-400"
              />
              <button
                onClick={copyCode}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              ref={textInputRef}
              rows={3}
              value={block.content}
              onChange={handleChange}
              placeholder="// Write code here..."
              className="w-full bg-transparent font-mono text-xs p-3 focus:outline-none text-emerald-300 leading-relaxed resize-none"
            />
          </div>
        )}

        {/* Raw HTML Block */}
        {block.type === 'html' && (
          <div className="my-3 p-3 rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-neutral-800/40 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sandboxed HTML Block
            </div>
            <textarea
              ref={textInputRef}
              rows={2}
              value={block.content}
              onChange={handleChange}
              placeholder="<button class='px-4 py-2 bg-blue-500 text-white rounded'>Interactive Button</button>"
              className="w-full font-mono text-xs p-2 rounded bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 focus:outline-none"
            />
            <div
              className="p-3 bg-white dark:bg-neutral-900 rounded border border-black/5 dark:border-white/5"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
