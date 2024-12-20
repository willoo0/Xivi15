
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
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        updateWindowPosition(id, { x: newX, y: newY })
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
        'absolute flex flex-col rounded-lg overflow-hidden bg-background/80 backdrop-blur-md border shadow-lg fade-in',
        isMaximized && 'fixed inset-0 !w-full !h-full'
      )}
      style={{
        left: position?.x ?? 100,
        top: position?.y ?? 40,
        width: isMaximized ? '100%' : (position?.width ?? 600),
        height: isMaximized ? '100%' : (position?.height ?? 400),
        zIndex,
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
