import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Maximize2, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDesktopStore, type WindowPosition } from '@/store/desktop'
import { cn } from '@/lib/utils'

interface WindowProps {
  id: string
  title: string
  children: React.ReactNode
  position: WindowPosition
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export function Window({ id, title, children, position, isMinimized, isMaximized, zIndex }: WindowProps) {
  const { setActiveWindow, updateWindowPosition, toggleMinimize, toggleMaximize, removeWindow } = useDesktopStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeEdge, setResizeEdge] = useState<string>('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    if (windowRef.current) {
      windowRef.current.classList.add('fade-out');
      windowRef.current.addEventListener('animationend', () => {
        removeWindow(id);
      }, { once: true });
      return;
    }
    removeWindow(id);
  }

  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized && windowRef.current) {
        cancelAnimationFrame(animationFrameId);
        
        animationFrameId = requestAnimationFrame(() => {
          const rect = windowRef.current?.getBoundingClientRect();
          if (!rect) return;
          
          const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - rect.width));
          const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - rect.height));
          
          updateWindowPosition(id, {
            x: newX,
            y: newY
          });
        });
      } else if (isResizing && windowRef.current) {
        cancelAnimationFrame(animationFrameId);
        
        animationFrameId = requestAnimationFrame(() => {
          const dx = e.clientX - startPos.x;
          const dy = e.clientY - startPos.y;
          let newWidth = startPos.width;
          let newHeight = startPos.height;
          let newX = position?.x ?? 0;
          let newY = position?.y ?? 0;

          if (resizeEdge.includes('right')) {
            newWidth = startPos.width + dx;
          }
          if (resizeEdge.includes('bottom')) {
            newHeight = startPos.height + dy;
          }
          if (resizeEdge.includes('left')) {
            newWidth = startPos.width - dx;
            newX = startPos.x + dx;
          }
          if (resizeEdge.includes('top')) {
            newHeight = startPos.height - dy;
            newY = startPos.y + dy;
          }

          // Ensure minimum size
          newWidth = Math.max(50, newWidth);
          newHeight = Math.max(50, newHeight);

          updateWindowPosition(id, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          });
        });
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, id, updateWindowPosition, isMaximized])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && !isMaximized) {
      setIsDragging(true)
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    setActiveWindow(id)
  }

  const handleMinimize = () => {
    if (windowRef.current && !isMinimized) {
      windowRef.current.classList.add('fade-out');
      windowRef.current.addEventListener('animationend', () => {
        toggleMinimize(id);
      }, { once: true });
      return;
    }
    toggleMinimize(id);
  }

  if (isMinimized) {
    return null
  }

  const constrainedY = Math.min(
    Math.max(position?.y ?? 0, 8),
    window.innerHeight - (position?.height ?? 400) - 48
  )

  const startResize = (e: React.MouseEvent, edge: string) => {
    if (!windowRef.current) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      width: windowRef.current.offsetWidth,
      height: windowRef.current.offsetHeight,
    });
    setActiveWindow(id);
  };

  return (
    <Card
      ref={windowRef}
      className={cn(
        'absolute flex flex-col rounded-lg overflow-hidden bg-background/80 backdrop-blur-md border shadow-lg fade-in window-transition group',
        isMaximized && 'fixed !left-0 !right-0 !top-8 !bottom-12'
      )}
      style={{
        left: position?.x ?? 100,
        top: position?.y ?? 40,
        width: isMaximized ? '100%' : (position?.width ?? 600),
        height: isMaximized ? 'calc(100% - 88px)' : (position?.height ?? 400),
        zIndex
      }}
      onClick={() => setActiveWindow(id)}
    >
      {!isMaximized && (
        <>
          <div className="absolute inset-x-0 top-0 h-1 cursor-n-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'top')} />
          <div className="absolute inset-y-0 left-0 w-1 cursor-w-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'left')} />
          <div className="absolute inset-y-0 right-0 w-1 cursor-e-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'right')} />
          <div className="absolute inset-x-0 bottom-0 h-1 cursor-s-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'bottom')} />
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'top-left')} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'top-right')} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'bottom-left')} />
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize group-hover:bg-primary/10" onMouseDown={(e) => startResize(e, 'bottom-right')} />
        </>
      )}
      <div
        className="flex items-center justify-between px-4 py-2 bg-primary/10 cursor-move"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      >
        <div className="font-medium">{title}</div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleMinimize}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleMaximize(id)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div 
        className="flex-1 overflow-auto p-4" 
        onWheel={(e) => {
          // Stop propagation only for non-game windows
          if (!['Tetris', 'Minesweeper'].includes(title)) {
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </Card>
  )
}