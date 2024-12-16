import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useDesktopStore } from '@/store/desktop'
import { ContextMenu } from './ContextMenu'
import { nanoid } from 'nanoid'
import {
  AppWindow,
  Calculator,
  FileText,
  Settings,
  Terminal,
  Image,
  Music,
  Mail,
  Globe,
  Calendar,
  Map,
  Clock,
  Folder,
} from 'lucide-react'

interface StartMenuProps {
  onClose: () => void
}

const apps = [
  {
    id: 'browser',
    title: 'Web Browser',
    component: 'Browser',
    icon: Globe,
    category: 'Internet'
  },
  {
    id: 'text-editor',
    title: 'Text Editor',
    component: 'TextEditor',
    icon: FileText,
    category: 'Productivity'
  },
  {
    id: 'calculator',
    title: 'Calculator',
    component: 'Calculator',
    icon: Calculator,
    category: 'Accessories'
  },
  {
    id: 'file-explorer',
    title: 'Files',
    component: 'FileExplorer',
    icon: Folder,
    category: 'System'
  },
  {
    id: 'settings',
    title: 'Settings',
    component: 'Settings',
    icon: Settings,
    category: 'System'
  }
]

const categories = ['Internet', 'Productivity', 'Media', 'System', 'Accessories']

export function StartMenu({ onClose }: StartMenuProps) {
  const { addWindow } = useDesktopStore()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    appId: string
    appComponent: string
    appTitle: string
  } | null>(null)

  const handleAppClick = (app: typeof apps[0]) => {
    addWindow({
      id: nanoid(),
      title: app.title,
      component: app.component,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 600,
        height: 400
      },
      isMinimized: false,
      isMaximized: false
    })
    onClose()
  }

  const handleRightClick = (
    e: React.MouseEvent,
    app: typeof apps[0]
  ) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId: '',
      appComponent: app.component,
      appTitle: app.title
    })
  }

  return (
    <>
      <Card className="fixed bottom-12 left-2 w-80 p-2 bg-background/80 backdrop-blur-md z-50 menu-transition">
        <div className="grid grid-cols-1 gap-4">
          {categories.map((category) => {
            const categoryApps = apps.filter(app => app.category === category)
            if (categoryApps.length === 0) return null
            
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1 px-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {categoryApps.map(app => (
                    <Button
                      key={app.id}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleAppClick(app)}
                      onContextMenu={(e) => handleRightClick(e, app)}
                    >
                      <app.icon className="h-4 w-4 mr-2" />
                      {app.title}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
