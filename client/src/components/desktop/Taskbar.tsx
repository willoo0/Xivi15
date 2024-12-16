import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useDesktopStore } from '@/store/desktop'
import { StartMenu } from './StartMenu'
import { ContextMenu } from './ContextMenu'
import { nanoid } from 'nanoid'
import {
  AppWindow,
  Layout,
  Settings,
  FileText,
  Calculator,
  Folder,
} from 'lucide-react'

const appIcons: Record<string, any> = {
  TextEditor: FileText,
  Calculator: Calculator,
  FileExplorer: Folder,
  Settings: Settings,
}

export function Taskbar() {
  const { windows, activeWindowId, pinnedApps, setActiveWindow, toggleMinimize, addWindow } = useDesktopStore()
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId: string;
    appComponent: string;
    appTitle: string;
  } | null>(null)

  const handleRightClick = (
    e: React.MouseEvent,
    appId: string,
    appComponent: string,
    appTitle: string
  ) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId,
      appComponent,
      appTitle,
    })
  }

  const handlePinnedAppClick = (app: { component: string; title: string }) => {
    // Check if the app is already open
    const existingWindow = windows.find((w) => w.component === app.component)
    if (existingWindow) {
      if (activeWindowId === existingWindow.id) {
        toggleMinimize(existingWindow.id)
      } else {
        setActiveWindow(existingWindow.id)
      }
    } else {
      addWindow({
        id: nanoid(),
        title: app.title,
        component: app.component,
        position: {
          x: 50 + Math.random() * 100,
          y: 50 + Math.random() * 100,
          width: 600,
          height: 400,
        },
        isMinimized: false,
        isMaximized: false,
      })
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-md border-t flex items-center px-2 z-[9999]">
        <Button
          variant={showStartMenu ? "secondary" : "ghost"}
          size="icon"
          className="mr-2"
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <Layout className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 flex items-center space-x-1">
          {/* Pinned Apps */}
          {pinnedApps.map((app) => {
            const Icon = appIcons[app.component] || AppWindow
            return (
              <Button
                key={app.component}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePinnedAppClick(app)}
                onContextMenu={(e) =>
                  handleRightClick(e, '', app.component, app.title)
                }
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}

          <div className="w-px h-6 bg-border mx-2" />

          {/* Open Windows */}
          {windows.map((window) => {
            const Icon = appIcons[window.component] || AppWindow
            return (
              <Button
                key={window.id}
                variant={activeWindowId === window.id ? "secondary" : "ghost"}
                className="h-8 px-2 text-sm"
                onClick={() => {
                  if (activeWindowId === window.id) {
                    toggleMinimize(window.id)
                  } else {
                    setActiveWindow(window.id)
                  }
                }}
                onContextMenu={(e) =>
                  handleRightClick(e, window.id, window.component, window.title)
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {window.title}
              </Button>
            )
          })}
        </div>
      </div>
      
      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}

      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
