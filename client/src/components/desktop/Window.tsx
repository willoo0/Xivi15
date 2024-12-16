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
  const [isResizing, setIsResizing] = useState(false)
  const [resizeEdge, setResizeEdge] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        updateWindowPosition(id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      } else if (isResizing && !isMaximized && windowRef.current) {
        e.preventDefault()
        const dx = e.clientX - startPos.x
        const dy = e.clientY - startPos.y
        const newWidth = Math.max(300, startSize.width + dx)
        const newHeight = Math.max(200, startSize.height + dy)
        
        updateWindowPosition(id, {
          width: newWidth,
          height: newHeight
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeEdge(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, startPos, startSize, id, updateWindowPosition, isMaximized])

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return
    
    const rect = windowRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartSize({ width: rect.width, height: rect.height })
  }

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
        cursor: isDragging ? 'grabbing' : undefined
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
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </Card>
  )
}