import React, { useState, useRef } from 'react';
import { CanvasElement } from '../../types/note';

interface InkingLayerProps {
  tool: 'select' | 'hand' | 'text' | 'pen' | 'highlighter' | 'eraser';
  strokeColor: string;
  strokeWidth: number;
  scale: number;
  drawings: CanvasElement[];
  onAddDrawing: (element: CanvasElement) => void;
  onRemoveDrawing: (id: string) => void;
}

export const InkingLayer: React.FC<InkingLayerProps> = ({
  tool,
  strokeColor,
  strokeWidth,
  scale,
  drawings,
  onAddDrawing,
  onRemoveDrawing
}) => {
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);

  const isInkActive = tool === 'pen' || tool === 'highlighter';

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInkActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    isDrawingRef.current = true;
    setCurrentPoints([{ x, y }]);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || !isInkActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setCurrentPoints((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || !isInkActive) return;
    isDrawingRef.current = false;

    if (currentPoints.length > 1) {
      const newDrawing: CanvasElement = {
        id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'drawing',
        tool: tool as 'pen' | 'highlighter',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        points: currentPoints,
        strokeColor: tool === 'highlighter' ? '#FACC15' : strokeColor,
        strokeWidth: tool === 'highlighter' ? Math.max(strokeWidth * 3, 16) : strokeWidth
      };
      onAddDrawing(newDrawing);
    }
    setCurrentPoints([]);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Convert array of points to smooth SVG path
  const pointsToSvgPath = (points?: { x: number; y: number }[]) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
    }
    return d;
  };

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute inset-0 w-full h-full overflow-visible ${
        isInkActive ? 'pointer-events-auto cursor-crosshair z-30' : 'pointer-events-none z-10'
      }`}
    >
      {/* Existing Drawings */}
      {drawings.map((draw) => {
        const isHighlighter = draw.tool === 'highlighter';
        return (
          <path
            key={draw.id}
            d={pointsToSvgPath(draw.points)}
            stroke={draw.strokeColor || '#E5A93C'}
            strokeWidth={draw.strokeWidth || 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={isHighlighter ? 0.35 : 1}
            onClick={() => {
              if (tool === 'eraser') onRemoveDrawing(draw.id);
            }}
            className={tool === 'eraser' ? 'pointer-events-auto cursor-pointer hover:stroke-red-500' : ''}
          />
        );
      })}

      {/* Currently In-Progress Drawing */}
      {currentPoints.length > 0 && (
        <path
          d={pointsToSvgPath(currentPoints)}
          stroke={tool === 'highlighter' ? '#FACC15' : strokeColor}
          strokeWidth={tool === 'highlighter' ? Math.max(strokeWidth * 3, 16) : strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={tool === 'highlighter' ? 0.35 : 1}
        />
      )}
    </svg>
  );
};
