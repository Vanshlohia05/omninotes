import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Trash2,
  Copy,
  ExternalLink,
  Smile,
  Check,
  Code as CodeIcon,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import katex from 'katex';
import { BlockItem as BlockItemType, TableData } from '../../types/note';
import { TableBlock } from './TableBlock';

interface BlockItemProps {
  block: BlockItemType;
  index: number;
  isFocused?: boolean;
  onUpdate: (updated: BlockItemType) => void;
  onDelete: () => void;
  onInsertAfter: () => void;
  onTriggerSlash: (position: { top: number; left: number }) => void;
  onNavigateSubpage?: (subpageId: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  isFocused,
  onUpdate,
  onDelete,
  onInsertAfter,
  onTriggerSlash,
  onNavigateSubpage
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const equationRef = useRef<HTMLDivElement>(null);

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
      } catch (e) {
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
    onUpdate({ ...block, content: val });
  };

  const handleTaskToggle = () => {
    const nextState = !block.checked;
    if (nextState) {
      // Trigger festive celebration confetti!
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

  // Helper for YouTube embed ID extraction
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

  return (
    <div
      id={`block-${block.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-start gap-1 py-1 px-1 rounded-lg transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
    >
      {/* Block Drag Handle & Delete */}
      <div
        className={`flex items-center gap-0.5 pt-1 pr-1 select-none transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5"
          title="Drag block"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
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
            className="w-full resize-none overflow-hidden bg-transparent font-bold text-2xl lg:text-3xl text-slate-900 dark:text-slate-50 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-tight"
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
            className="w-full resize-none overflow-hidden bg-transparent font-semibold text-xl lg:text-2xl text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-snug"
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
            className="w-full resize-none overflow-hidden bg-transparent font-medium text-lg lg:text-xl text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-snug"
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
            className="w-full resize-none overflow-hidden bg-transparent font-medium text-base text-slate-700 dark:text-slate-300 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700"
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
            className="w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-[15px]"
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
              className="w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-[15px]"
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
              className="w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-[15px]"
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
              className={`w-full resize-none overflow-hidden bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-[15px] transition-all ${
                block.checked ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
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
                className="w-full resize-none overflow-hidden bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 text-[15px]"
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
              className="w-full resize-none overflow-hidden bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400 leading-relaxed text-[15px]"
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
              className="w-full resize-none overflow-hidden bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-700 leading-relaxed text-[15px]"
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
