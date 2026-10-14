import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  Type,
  Square,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  Star,
  MessageSquare,
  Cloud,
  ArrowRight,
  GitFork,
  PenTool,
  Highlighter,
  Eraser,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Palette
} from 'lucide-react';
import { ShapeType } from '../../types/note';

export type CanvasToolType = 'select' | 'hand' | 'text' | 'pen' | 'highlighter' | 'eraser';

interface CanvasToolbarProps {
  tool: CanvasToolType;
  onSelectTool: (tool: CanvasToolType) => void;
  onAddShape: (shapeType: ShapeType) => void;
  onAddMindMapNode: () => void;
  onAddConnector: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  strokeColor: string;
  onSelectStrokeColor: (color: string) => void;
}

const PALETTE_COLORS = [
  '#E5A93C', // Amber
  '#FF9500', // Apple Orange
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#1E293B', // Slate
  '#64748B'  // Muted Slate
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  tool,
  onSelectTool,
  onAddShape,
  onAddMindMapNode,
  onAddConnector,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  strokeColor,
  onSelectStrokeColor
}) => {
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-2xl bg-white/90 dark:bg-[#222222]/90 backdrop-blur-md shadow-apple-floating border border-black/10 dark:border-white/10 select-none">
      {/* Pointer / Select */}
      <button
        onClick={() => onSelectTool('select')}
        className={`p-2 rounded-xl transition ${
          tool === 'select'
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Select & Move (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      {/* Hand / Pan */}
      <button
        onClick={() => onSelectTool('hand')}
        className={`p-2 rounded-xl transition ${
          tool === 'hand'
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Hand Pan (Space + Drag)"
      >
        <Hand className="w-4 h-4" />
      </button>

      {/* Text / Click to Type */}
      <button
        onClick={() => onSelectTool('text')}
        className={`p-2 rounded-xl transition ${
          tool === 'text'
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Click anywhere to type (T)"
      >
        <Type className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-black/10 dark:bg-white/10 mx-0.5" />

      {/* Shapes Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsShapesOpen(!isShapesOpen)}
          className="flex items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
          title="Shapes Library"
        >
          <Square className="w-4 h-4 text-amber-600" />
        </button>

        {isShapesOpen && (
          <div className="absolute top-12 left-0 w-44 p-2 rounded-xl bg-white/95 dark:bg-[#252525]/95 backdrop-blur-md shadow-apple-floating border border-black/10 dark:border-white/10 grid grid-cols-3 gap-1 z-50">
            <button
              onClick={() => {
                onAddShape('rectangle');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
              <span className="text-[10px]">Rect</span>
            </button>

            <button
              onClick={() => {
                onAddShape('rounded-rect');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Rounded Rectangle"
            >
              <Square className="w-4 h-4 rounded-sm" />
              <span className="text-[10px]">Round</span>
            </button>

            <button
              onClick={() => {
                onAddShape('circle');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Circle / Ellipse"
            >
              <Circle className="w-4 h-4" />
              <span className="text-[10px]">Circle</span>
            </button>

            <button
              onClick={() => {
                onAddShape('diamond');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Decision Diamond"
            >
              <Diamond className="w-4 h-4" />
              <span className="text-[10px]">Diamond</span>
            </button>

            <button
              onClick={() => {
                onAddShape('triangle');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Triangle"
            >
              <Triangle className="w-4 h-4" />
              <span className="text-[10px]">Triangle</span>
            </button>

            <button
              onClick={() => {
                onAddShape('hexagon');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Hexagon"
            >
              <Hexagon className="w-4 h-4" />
              <span className="text-[10px]">Hexagon</span>
            </button>

            <button
              onClick={() => {
                onAddShape('star');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Star"
            >
              <Star className="w-4 h-4" />
              <span className="text-[10px]">Star</span>
            </button>

            <button
              onClick={() => {
                onAddShape('speech-bubble');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Speech Bubble"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px]">Speech</span>
            </button>

            <button
              onClick={() => {
                onAddShape('cloud');
                setIsShapesOpen(false);
              }}
              className="p-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200"
              title="Cloud"
            >
              <Cloud className="w-4 h-4" />
              <span className="text-[10px]">Cloud</span>
            </button>
          </div>
        )}
      </div>

      {/* Mind Map Node */}
      <button
        onClick={onAddMindMapNode}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1"
        title="Add Mind Map Node"
      >
        <GitFork className="w-4 h-4 text-indigo-500" />
      </button>

      {/* Connector Arrow */}
      <button
        onClick={onAddConnector}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
        title="Add Arrow Connector"
      >
        <ArrowRight className="w-4 h-4 text-emerald-500" />
      </button>

      <div className="w-[1px] h-5 bg-black/10 dark:bg-white/10 mx-0.5" />

      {/* Inking Tools */}
      <button
        onClick={() => onSelectTool('pen')}
        className={`p-2 rounded-xl transition ${
          tool === 'pen'
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Pen / Stylus"
      >
        <PenTool className="w-4 h-4" />
      </button>

      <button
        onClick={() => onSelectTool('highlighter')}
        className={`p-2 rounded-xl transition ${
          tool === 'highlighter'
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Highlighter"
      >
        <Highlighter className="w-4 h-4 text-yellow-500" />
      </button>

      <button
        onClick={() => onSelectTool('eraser')}
        className={`p-2 rounded-xl transition ${
          tool === 'eraser'
            ? 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Eraser"
      >
        <Eraser className="w-4 h-4" />
      </button>

      {/* Color Swatch */}
      <div className="relative">
        <button
          onClick={() => setIsColorOpen(!isColorOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1"
          title="Color Palette"
        >
          <div
            className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20"
            style={{ backgroundColor: strokeColor }}
          />
        </button>

        {isColorOpen && (
          <div className="absolute top-12 left-0 p-2 rounded-xl bg-white dark:bg-[#252525] shadow-apple-floating border border-black/10 dark:border-white/10 flex gap-1 z-50">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onSelectStrokeColor(c);
                  setIsColorOpen(false);
                }}
                className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-black/10 dark:bg-white/10 mx-0.5" />

      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={onResetZoom}
        className="px-1.5 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 transition"
        title="Reset Zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={onFitView}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition"
        title="Fit to Center"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
