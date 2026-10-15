import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasElement, ShapeType, NoteItem } from '../../types/note';
import { ShapeElement } from './ShapeElement';
import { InkingLayer } from './InkingLayer';
import { CanvasToolbar, CanvasToolType } from './CanvasToolbar';

interface InfiniteCanvasProps {
  note: NoteItem;
  onChange: (updatedElements: CanvasElement[]) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ note, onChange }) => {
  const [tool, setTool] = useState<CanvasToolType>('select');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#E5A93C');
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0
  });
  const copiedElementRef = useRef<CanvasElement | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const elements = note.canvasElements || [];

  // Wheel zoom & pan
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom centered on pointer
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(Math.max(scale * zoomFactor, 0.25), 4.0);
        setScale(newScale);
      } else {
        // Two finger trackpad pan
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    },
    [scale]
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const [isSpaceDown, setIsSpaceDown] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsSpaceDown(true);
      }

      // Easy copy paste for canvas (Ctrl+C / Ctrl+V or Cmd+C / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        if (e.key.toLowerCase() === 'c') {
          const target = elements.find((el) => el.id === selectedId);
          if (target) {
            copiedElementRef.current = target;
          }
        } else if (e.key.toLowerCase() === 'v') {
          if (copiedElementRef.current) {
            e.preventDefault();
            const src = copiedElementRef.current;
            const newId = `${src.type}-${Date.now()}`;
            const cloned: CanvasElement = {
              ...src,
              id: newId,
              x: src.x + 40,
              y: src.y + 40,
              childrenIds: undefined,
              parentId: undefined
            };
            onChange([...elements, cloned]);
            setSelectedId(newId);
          }
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [elements, selectedId, onChange]);

  const handleAddImage = (imageUrl: string) => {
    const centerWorldX = Math.round((-pan.x + window.innerWidth / 2) / scale - 120);
    const centerWorldY = Math.round((-pan.y + window.innerHeight / 2) / scale - 90);

    const newImageEl: CanvasElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      x: centerWorldX,
      y: centerWorldY,
      width: 240,
      height: 180,
      imageUrl,
      content: 'Canvas diagram'
    };

    onChange([...elements, newImageEl]);
    setSelectedId(newImageEl.id);
  };

  // Pan interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle click or hand tool or spacebar held
    if (e.button === 1 || tool === 'hand' || isSpaceDown) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Click anywhere to type (OneNote feature!)
    if (tool === 'text') {
      const rect = e.currentTarget.getBoundingClientRect();
      const worldX = Math.round((e.clientX - rect.left - pan.x) / scale);
      const worldY = Math.round((e.clientY - rect.top - pan.y) / scale);

      const newTextCard: CanvasElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        shapeType: 'rounded-rect',
        x: worldX,
        y: worldY,
        width: 180,
        height: 80,
        content: 'Type your note here...',
        fillColor: '#FFFFFF',
        strokeColor: strokeColor,
        strokeWidth: 1.5,
        fontSize: 14
      };

      onChange([...elements, newTextCard]);
      setSelectedId(newTextCard.id);
      setTool('select');
      return;
    }

    // Deselect if clicking on empty canvas
    if (tool === 'select') {
      setSelectedId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.startPanX + dx,
      y: panStartRef.current.startPanY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Add Shape
  const handleAddShape = (shapeType: ShapeType) => {
    const centerWorldX = Math.round((-pan.x + window.innerWidth / 2) / scale - 80);
    const centerWorldY = Math.round((-pan.y + window.innerHeight / 2) / scale - 40);

    const newShape: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: centerWorldX,
      y: centerWorldY,
      width: shapeType === 'circle' ? 100 : shapeType === 'diamond' ? 120 : 150,
      height: shapeType === 'circle' ? 100 : shapeType === 'diamond' ? 90 : 70,
      content: shapeType.toUpperCase(),
      fillColor: '#FEF9C3',
      strokeColor: strokeColor,
      strokeWidth: 2,
      fontSize: 14
    };

    onChange([...elements, newShape]);
    setSelectedId(newShape.id);
  };

  // Add Mind Map Node
  const handleAddMindMapNode = () => {
    const centerWorldX = Math.round((-pan.x + window.innerWidth / 2) / scale - 80);
    const centerWorldY = Math.round((-pan.y + window.innerHeight / 2) / scale - 30);

    const newNode: CanvasElement = {
      id: `node-${Date.now()}`,
      type: 'mindmap-node',
      shapeType: 'rounded-rect',
      x: centerWorldX,
      y: centerWorldY,
      width: 160,
      height: 60,
      content: 'Central Idea 💡',
      fillColor: '#EDE9FE',
      strokeColor: '#8B5CF6',
      strokeWidth: 2,
      fontSize: 15
    };

    onChange([...elements, newNode]);
    setSelectedId(newNode.id);
  };

  // Mind map child node creation (Press Tab)
  const handleAddMindMapChild = (parentId: string) => {
    const parent = elements.find((el) => el.id === parentId);
    if (!parent) return;

    const childX = parent.x + (parent.width || 160) + 80;
    const childY = parent.y + (Math.random() * 60 - 30);

    const childId = `node-${Date.now()}`;
    const childNode: CanvasElement = {
      id: childId,
      type: 'mindmap-node',
      shapeType: 'rounded-rect',
      x: childX,
      y: childY,
      width: 140,
      height: 50,
      content: 'Sub-topic',
      fillColor: '#F3F4F6',
      strokeColor: '#9CA3AF',
      strokeWidth: 1.5,
      fontSize: 13,
      parentId: parent.id
    };

    // Auto-create connector line
    const connector: CanvasElement = {
      id: `conn-${Date.now()}`,
      type: 'connector',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      connectorType: 'curved',
      strokeColor: '#94A3B8',
      strokeWidth: 2,
      connectorStart: { elementId: parent.id, x: parent.x + (parent.width || 160), y: parent.y + (parent.height || 60) / 2 },
      connectorEnd: { elementId: childId, x: childX, y: childY + 25 }
    };

    const updatedParent = {
      ...parent,
      childrenIds: [...(parent.childrenIds || []), childId]
    };

    const otherElements = elements.map((el) => (el.id === parent.id ? updatedParent : el));
    onChange([...otherElements, childNode, connector]);
    setSelectedId(childId);
  };

  // Mind map sibling node creation (Press Enter)
  const handleAddMindMapSibling = (currentId: string) => {
    const current = elements.find((el) => el.id === currentId);
    if (!current) return;

    const siblingX = current.x;
    const siblingY = current.y + (current.height || 60) + 40;

    const siblingId = `node-${Date.now()}`;
    const siblingNode: CanvasElement = {
      id: siblingId,
      type: 'mindmap-node',
      shapeType: current.shapeType || 'rounded-rect',
      x: siblingX,
      y: siblingY,
      width: current.width || 140,
      height: current.height || 50,
      content: 'Sibling Idea',
      fillColor: current.fillColor,
      strokeColor: current.strokeColor,
      strokeWidth: current.strokeWidth,
      fontSize: current.fontSize,
      parentId: current.parentId
    };

    const newElements = [...elements, siblingNode];

    if (current.parentId) {
      const parent = elements.find((el) => el.id === current.parentId);
      if (parent) {
        const connector: CanvasElement = {
          id: `conn-${Date.now()}`,
          type: 'connector',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          connectorType: 'curved',
          strokeColor: '#94A3B8',
          strokeWidth: 2,
          connectorStart: { elementId: parent.id, x: parent.x + (parent.width || 160), y: parent.y + (parent.height || 60) / 2 },
          connectorEnd: { elementId: siblingId, x: siblingX, y: siblingY + 25 }
        };
        newElements.push(connector);
      }
    }

    onChange(newElements);
    setSelectedId(siblingId);
  };

  // Add Connector line
  const handleAddConnector = () => {
    const centerWorldX = Math.round((-pan.x + window.innerWidth / 2) / scale);
    const centerWorldY = Math.round((-pan.y + window.innerHeight / 2) / scale);

    const newConnector: CanvasElement = {
      id: `conn-${Date.now()}`,
      type: 'connector',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      connectorType: 'arrow',
      strokeColor: strokeColor,
      strokeWidth: 2,
      connectorStart: { x: centerWorldX - 100, y: centerWorldY },
      connectorEnd: { x: centerWorldX + 100, y: centerWorldY }
    };

    onChange([...elements, newConnector]);
  };

  // Update element
  const handleUpdateElement = (updated: CanvasElement) => {
    // If moving a shape or node, also update attached connectors
    const updatedElements = elements.map((el) => {
      if (el.id === updated.id) return updated;

      if (el.type === 'connector') {
        let connUpdated = false;
        let newStart = el.connectorStart;
        let newEnd = el.connectorEnd;

        if (el.connectorStart?.elementId === updated.id) {
          connUpdated = true;
          newStart = {
            ...el.connectorStart,
            x: updated.x + (updated.width || 140),
            y: updated.y + (updated.height || 60) / 2
          };
        }
        if (el.connectorEnd?.elementId === updated.id) {
          connUpdated = true;
          newEnd = {
            ...el.connectorEnd,
            x: updated.x,
            y: updated.y + (updated.height || 60) / 2
          };
        }

        if (connUpdated) {
          return { ...el, connectorStart: newStart, connectorEnd: newEnd };
        }
      }
      return el;
    });

    onChange(updatedElements);
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    onChange(elements.filter((el) => el.id !== id && el.connectorStart?.elementId !== id && el.connectorEnd?.elementId !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const drawings = elements.filter((el) => el.type === 'drawing');
  const shapes = elements.filter((el) => el.type !== 'drawing' && el.type !== 'connector');
  const connectors = elements.filter((el) => el.type === 'connector');

  return (
    <div
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full min-h-[350px] overflow-hidden select-none bg-slate-50 dark:bg-[#191919] touch-none ${
        tool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : tool === 'text' ? 'cursor-text' : ''
      }`}
      style={{
        touchAction: 'none',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 1px)',
        backgroundSize: `${24 * scale}px ${24 * scale}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Canvas Toolbar */}
      <CanvasToolbar
        tool={tool}
        onSelectTool={setTool}
        onAddShape={handleAddShape}
        onAddMindMapNode={handleAddMindMapNode}
        onAddConnector={handleAddConnector}
        onAddImage={handleAddImage}
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(s * 1.2, 4.0))}
        onZoomOut={() => setScale((s) => Math.max(s * 0.8, 0.25))}
        onResetZoom={() => setScale(1)}
        onFitView={() => {
          setScale(1);
          setPan({ x: 0, y: 0 });
        }}
        strokeColor={strokeColor}
        onSelectStrokeColor={setStrokeColor}
      />

      {/* World Space Container (Transformed with Pan and Zoom) */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Connectors SVG Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none z-10">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
            </marker>
          </defs>
          {connectors.map((conn) => {
            const start = conn.connectorStart || { x: 0, y: 0 };
            const end = conn.connectorEnd || { x: 100, y: 100 };
            const midX = (start.x + end.x) / 2;

            const pathD =
              conn.connectorType === 'curved'
                ? `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
                : `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

            return (
              <path
                key={conn.id}
                d={pathD}
                stroke={conn.strokeColor || '#64748B'}
                strokeWidth={conn.strokeWidth || 2}
                fill="none"
                markerEnd={conn.connectorType === 'arrow' || conn.connectorType === 'curved' ? 'url(#arrowhead)' : undefined}
                className="pointer-events-auto hover:stroke-red-500 cursor-pointer"
                onClick={() => handleDeleteElement(conn.id)}
              />
            );
          })}
        </svg>

        {/* Inking Layer (Freehand Drawing) */}
        <InkingLayer
          tool={tool}
          strokeColor={strokeColor}
          strokeWidth={3}
          scale={scale}
          drawings={drawings}
          onAddDrawing={(newDrawing) => onChange([...elements, newDrawing])}
          onRemoveDrawing={(id) => handleDeleteElement(id)}
        />

        {/* Shapes and Mind Map Nodes */}
        <div className="pointer-events-auto">
          {shapes.map((element) => (
            <ShapeElement
              key={element.id}
              element={element}
              isSelected={selectedId === element.id}
              scale={scale}
              onSelect={() => setSelectedId(element.id)}
              onUpdate={handleUpdateElement}
              onDelete={() => handleDeleteElement(element.id)}
              onAddMindMapChild={() => handleAddMindMapChild(element.id)}
              onAddMindMapSibling={() => handleAddMindMapSibling(element.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
