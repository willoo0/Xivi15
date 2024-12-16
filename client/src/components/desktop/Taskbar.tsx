import { Button } from '@/components/ui/button'
import { useDesktopStore } from '@/store/desktop'
import { StartMenu } from './StartMenu'
import { useState } from 'react'
import { AppWindow, Layout, Settings } from 'lucide-react'

export function Taskbar() {
  const { windows, activeWindowId, setActiveWindow, toggleMinimize } = useDesktopStore()
  const [showStartMenu, setShowStartMenu] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-md border-t flex items-center px-2 z-50">
        <Button
          variant={showStartMenu ? "secondary" : "ghost"}
          size="icon"
          className="mr-2"
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <Layout className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 flex items-center space-x-1">
          {windows.map(window => (
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
            >
              {window.component === 'TextEditor' && <AppWindow className="h-4 w-4 mr-2" />}
              {window.component === 'Settings' && <Settings className="h-4 w-4 mr-2" />}
              {window.title}
            </Button>
          ))}
        </div>
      </div>
      
      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}
    </>
  )
}
