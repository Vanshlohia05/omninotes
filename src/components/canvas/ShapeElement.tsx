import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, ShapeType } from '../../types/note';

interface ShapeElementProps {
  element: CanvasElement;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onUpdate: (updated: CanvasElement) => void;
  onDelete: () => void;
  onAddMindMapChild?: () => void;
  onAddMindMapSibling?: () => void;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({
  element,
  isSelected,
  scale,
  onSelect,
  onUpdate,
  onDelete,
  onAddMindMapChild,
  onAddMindMapSibling
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; elX: number; elY: number }>({
    startX: 0,
    startY: 0,
    elX: element.x,
    elY: element.y
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elX: element.x,
      elY: element.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStartRef.current.startX) / scale;
    const dy = (e.clientY - dragStartRef.current.startY) / scale;
    onUpdate({
      ...element,
      x: Math.round(dragStartRef.current.elX + dx),
      y: Math.round(dragStartRef.current.elY + dy)
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (onAddMindMapChild) onAddMindMapChild();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (onAddMindMapSibling) onAddMindMapSibling();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete();
    }
  };

  const shapeType: ShapeType = element.shapeType || 'rectangle';
  const width = element.width || 140;
  const height = element.height || 60;
  const fillColor = element.fillColor || '#FFFFFF';
  const strokeColor = element.strokeColor || '#E5A93C';
  const strokeWidth = element.strokeWidth || 2;

  // Render SVG geometry based on shape type
  const renderShapeGeometry = () => {
    switch (shapeType) {
      case 'circle':
        return (
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width / 2 - strokeWidth}
            ry={height / 2 - strokeWidth}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'rounded-rect':
        return (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={width - strokeWidth}
            height={height - strokeWidth}
            rx={14}
            ry={14}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'diamond':
        return (
          <polygon
            points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height / 2} ${width / 2},${height - strokeWidth} ${strokeWidth},${height / 2}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'triangle':
        return (
          <polygon
            points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height - strokeWidth} ${strokeWidth},${height - strokeWidth}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'hexagon': {
        const offset = width * 0.22;
        return (
          <polygon
            points={`${offset},${strokeWidth} ${width - offset},${strokeWidth} ${width - strokeWidth},${height / 2} ${width - offset},${height - strokeWidth} ${offset},${height - strokeWidth} ${strokeWidth},${height / 2}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'star': {
        const cx = width / 2;
        const cy = height / 2;
        const rOuter = Math.min(width, height) / 2 - strokeWidth;
        const rInner = rOuter * 0.45;
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? rOuter : rInner;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <polygon
            points={pts.join(' ')}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'cloud':
        return (
          <path
            d={`M ${width * 0.25} ${height * 0.75}
               A ${width * 0.18} ${height * 0.25} 0 0 1 ${width * 0.2} ${height * 0.4}
               A ${width * 0.22} ${height * 0.3} 0 0 1 ${width * 0.5} ${height * 0.25}
               A ${width * 0.22} ${height * 0.3} 0 0 1 ${width * 0.8} ${height * 0.4}
               A ${width * 0.18} ${height * 0.25} 0 0 1 ${width * 0.8} ${height * 0.75}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'speech-bubble':
        return (
          <path
            d={`M ${12} ${0}
               H ${width - 12}
               A 12 12 0 0 1 ${width} ${12}
               V ${height - 20}
               A 12 12 0 0 1 ${width - 12} ${height - 8}
               H ${30}
               L ${16} ${height}
               L ${20} ${height - 8}
               H ${12}
               A 12 12 0 0 1 ${0} ${height - 20}
               V ${12}
               A 12 12 0 0 1 ${12} ${0}
               Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'rectangle':
      default:
        return (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={width - strokeWidth}
            height={height - strokeWidth}
            rx={4}
            ry={4}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => setIsEditing(true)}
      style={{
        transform: `translate(${element.x}px, ${element.y}px)`,
        width: `${width}px`,
        height: `${height}px`
      }}
      className={`absolute cursor-move select-none touch-none transition-shadow ${
        isSelected ? 'ring-2 ring-amber-500 shadow-apple-floating z-20' : 'hover:shadow-md z-10'
      }`}
    >
      {/* Render Image Element if type is image */}
      {element.type === 'image' && element.imageUrl ? (
        <div className="w-full h-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 shadow-sm flex flex-col pointer-events-auto">
          <img
            src={element.imageUrl}
            alt={element.content || 'Canvas image'}
            className="w-full flex-1 object-cover pointer-events-none select-none"
          />
          {element.content && (
            <div className="p-1 text-[11px] text-center text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-neutral-900/90 truncate">
              {element.content}
            </div>
          )}
        </div>
      ) : (
        <>
          <svg className="w-full h-full overflow-visible drop-shadow-sm pointer-events-none">
            {renderShapeGeometry()}
          </svg>

          {/* Content / Text editing */}
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-auto">
            {isEditing ? (
              <textarea
                autoFocus
                rows={2}
                value={element.content || ''}
                onChange={(e) => onUpdate({ ...element, content: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="w-full h-full resize-none bg-transparent text-center focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
                style={{ fontSize: `${element.fontSize || 14}px` }}
              />
            ) : (
              <div
                className="w-full font-medium text-slate-800 dark:text-slate-100 break-words whitespace-pre-wrap leading-tight select-none"
                style={{ fontSize: `${element.fontSize || 14}px` }}
              >
                {element.content || 'Double click to edit'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mind map hint pills when selected */}
      {isSelected && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-900/90 text-white text-[10px] px-2 py-0.5 rounded-full shadow pointer-events-none whitespace-nowrap">
          <span>Tab: Child</span>
          <span>•</span>
          <span>Enter: Sibling</span>
          <span>•</span>
          <span>Ctrl+C/V: Copy</span>
        </div>
      )}
    </div>
  );
};
