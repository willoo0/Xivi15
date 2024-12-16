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
  zIndex?: number
}

const TASKBAR_HEIGHT = 48
const SNAP_THRESHOLD = 20
const MIN_WINDOW_WIDTH = 300
const MIN_WINDOW_HEIGHT = 200

export function Window({ id, title, children, position, isMinimized, isMaximized, zIndex = 0 }: WindowProps) {
  const { setActiveWindow, updateWindowPosition, toggleMinimize, toggleMaximize, removeWindow } = useDesktopStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  // Calculate window bounds and snapping
  const getSnappedPosition = (x: number, y: number, width: number, height: number) => {
    // Calculate maximum bounds
    const maxX = window.innerWidth - width
    const maxY = window.innerHeight - TASKBAR_HEIGHT - height

    // Basic bounds checking
    let newX = Math.max(0, Math.min(x, maxX))
    let newY = Math.max(0, Math.min(y, maxY))

    // Snap to edges
    if (Math.abs(newX) < SNAP_THRESHOLD) newX = 0 // Left edge
    if (Math.abs(newX - maxX) < SNAP_THRESHOLD) newX = maxX // Right edge
    if (Math.abs(newY) < SNAP_THRESHOLD) newY = 0 // Top edge
    if (Math.abs(newY - maxY) < SNAP_THRESHOLD) newY = maxY // Bottom edge

    return { x: newX, y: newY }
  }

  useEffect(() => {
    if (isMaximized) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        const snapped = getSnappedPosition(newX, newY, position.width, position.height)
        
        updateWindowPosition(id, snapped)
      } else if (isResizing && windowRef.current) {
        e.preventDefault()
        const dx = e.clientX - startPos.x
        const dy = e.clientY - startPos.y
        
        // Calculate new size with minimum constraints
        const newWidth = Math.max(MIN_WINDOW_WIDTH, startSize.width + dx)
        const newHeight = Math.max(MIN_WINDOW_HEIGHT, startSize.height + dy)
        
        // Ensure window stays within bounds
        const maxWidth = window.innerWidth - position.x
        const maxHeight = window.innerHeight - TASKBAR_HEIGHT - position.y
        
        updateWindowPosition(id, {
          width: Math.min(newWidth, maxWidth),
          height: Math.min(newHeight, maxHeight)
        })
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        // If moved very little, treat as a click to focus
        const dx = Math.abs(startPos.x - e.clientX)
        const dy = Math.abs(startPos.y - e.clientY)
        if (dx < 5 && dy < 5) {
          setActiveWindow(id)
        }
      }
      
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, startPos, startSize, id, position, updateWindowPosition, isMaximized, setActiveWindow])

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return
    
    const rect = windowRef.current?.getBoundingClientRect()
    if (!rect) return

    e.stopPropagation()
    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: rect.width, height: rect.height })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && !isMaximized) {
      const rect = windowRef.current.getBoundingClientRect()
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setStartPos({ x: e.clientX, y: e.clientY })
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
        isMaximized && 'w-full h-full !left-0 !top-0',
        !isMaximized && 'resize-handle',
        isDragging && 'pointer-events-none opacity-90'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMaximized ? '100%' : position.width,
        height: isMaximized ? `calc(100% - ${TASKBAR_HEIGHT}px)` : position.height,
        zIndex,
        transform: isMaximized ? 'none' : undefined,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-primary/10 cursor-move select-none"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => toggleMaximize(id)}
      >
        <div className="font-medium">{title}</div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => toggleMinimize(id)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => toggleMaximize(id)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => removeWindow(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize hover:bg-primary/10 rounded-tl"
          onMouseDown={handleResizeStart}
        />
      )}
    </Card>
  )
}
