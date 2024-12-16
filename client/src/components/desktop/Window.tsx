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
  const [isResizing, setIsResizing] = useState(false)
  const [resizeEdge, setResizeEdge] = useState<string | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  const startResize = (e: React.MouseEvent, edge: string) => {
    if (!isMaximized) {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      setResizeEdge(edge)
      setActiveWindow(id)
    }
  }

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isResizing && windowRef.current && !isMaximized) {
        const rect = windowRef.current.getBoundingClientRect()
        let newWidth = position.width
        let newHeight = position.height
        let newX = position.x
        let newY = position.y

        if (resizeEdge?.includes('right')) {
          newWidth = Math.max(200, e.clientX - rect.left)
        }
        if (resizeEdge?.includes('bottom')) {
          newHeight = Math.max(200, e.clientY - rect.top)
        }
        if (resizeEdge?.includes('left')) {
          const deltaX = e.clientX - rect.left
          newWidth = Math.max(200, rect.width - deltaX)
          newX = position.x + deltaX
        }
        if (resizeEdge?.includes('top')) {
          const deltaY = e.clientY - rect.top
          newHeight = Math.max(200, rect.height - deltaY)
          newY = position.y + deltaY
        }

        updateWindowPosition(id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        })
      }
    }

    const stopResize = () => {
      setIsResizing(false)
      setResizeEdge(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResize)
    }

    return () => {
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
    }
  }, [isResizing, resizeEdge, id, position, updateWindowPosition, isMaximized])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - rect.width));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - rect.height));
        
        updateWindowPosition(id, {
          x: newX,
          y: newY
        })
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
        isMaximized && 'w-full h-full !left-0 !top-0',
        !isMaximized && 'resize-handle'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMaximized ? '100%' : position.width,
        height: isMaximized ? '100%' : position.height,
        zIndex,
        position: 'absolute',
        cursor: isDragging ? 'move' : 'default'
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
