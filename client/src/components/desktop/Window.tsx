import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Maximize2, Minimize2, X } from 'lucide-react'
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 48; // Account for taskbar height
        const snapThreshold = 20;
        const originalWidth = position.width;
        const originalHeight = position.height;
        
        let newX = Math.max(0, Math.min(e.clientX - dragOffset.x, screenWidth - rect.width));
        let newY = Math.max(0, Math.min(e.clientY - dragOffset.y, screenHeight - rect.height));
        let newWidth = originalWidth;
        let newHeight = originalHeight;
        let isSnapped = false;

        // Left edge snap
        if (newX < snapThreshold) {
          newX = 0;
          newWidth = screenWidth / 2;
          newHeight = screenHeight;
          if (newY < snapThreshold) newY = 0;
          isSnapped = true;
        }
        // Right edge snap
        else if (newX > screenWidth - rect.width - snapThreshold) {
          newX = screenWidth / 2;
          newWidth = screenWidth / 2;
          newHeight = screenHeight;
          if (newY < snapThreshold) newY = 0;
          isSnapped = true;
        }
        // Top edge snap
        else if (newY < snapThreshold) {
          newY = 0;
          newWidth = screenWidth;
          newHeight = screenHeight;
          isSnapped = true;
        }

        // If not snapped, restore original size
        if (!isSnapped && rect.width === screenWidth || rect.width === screenWidth / 2) {
          newWidth = originalWidth;
          newHeight = originalHeight;
        }
        
        updateWindowPosition(id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
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

  if (isMinimized) {
    return null
  }

  return (
    <Card
      ref={windowRef}
      className={cn(
        'absolute flex flex-col rounded-lg overflow-hidden bg-background/80 backdrop-blur-md border shadow-lg',
        isMaximized && 'w-full h-full !left-0 !top-0'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMaximized ? '100%' : position.width,
        height: isMaximized ? '100%' : position.height,
        zIndex
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-primary/10 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="font-medium">{title}</div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => toggleMinimize(id)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleMaximize(id)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => removeWindow(id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </Card>
  )
}
