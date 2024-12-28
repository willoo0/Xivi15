import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Maximize, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
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
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
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

  return (
    <Card
      ref={windowRef}
      className={cn(
        'absolute flex flex-col rounded-lg overflow-hidden border shadow-lg fade-in window-transition',
        `bg-background/${Math.round(useDesktopStore().windowOpacity * 100 || 80)} backdrop-blur-md`,
        isMaximized && 'fixed !left-0 !right-0 !top-8 !bottom-12'
      )}
      style={{
        left: position?.x ?? 100,
        top: position?.y ?? 40, // Start below topbar
        width: isMaximized ? '100%' : (position?.width ?? 600),
        height: isMaximized ? 'calc(100% - 88px)' : (position?.height ?? 400), // Account for topbar and taskbar
        zIndex
      }}
      onClick={() => setActiveWindow(id)}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-primary/10 cursor-move"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      >
        <div className="font-medium">{title}</div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleMinimize}>
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimize</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => toggleMaximize(id)}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Maximize</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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