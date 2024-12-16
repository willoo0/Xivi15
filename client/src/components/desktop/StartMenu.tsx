import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDesktopStore } from '@/store/desktop'
import { AppWindow, Calculator, FileText, Settings } from 'lucide-react'
import { nanoid } from 'nanoid'

interface StartMenuProps {
  onClose: () => void
}

const apps = [
  {
    id: 'text-editor',
    title: 'Text Editor',
    component: 'TextEditor',
    icon: FileText
  },
  {
    id: 'calculator',
    title: 'Calculator',
    component: 'Calculator',
    icon: Calculator
  },
  {
    id: 'file-explorer',
    title: 'Files',
    component: 'FileExplorer',
    icon: AppWindow
  },
  {
    id: 'settings',
    title: 'Settings',
    component: 'Settings',
    icon: Settings
  }
]

export function StartMenu({ onClose }: StartMenuProps) {
  const { addWindow } = useDesktopStore()

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

  return (
    <Card className="fixed bottom-12 left-2 w-64 p-2 bg-background/80 backdrop-blur-md z-50">
      <div className="grid grid-cols-1 gap-1">
        {apps.map(app => (
          <Button
            key={app.id}
            variant="ghost"
            className="justify-start"
            onClick={() => handleAppClick(app)}
          >
            <app.icon className="h-4 w-4 mr-2" />
            {app.title}
          </Button>
        ))}
      </div>
    </Card>
  )
}
