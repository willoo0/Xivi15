
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, File, ChevronRight } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useDesktopStore } from '@/store/desktop'
import { nanoid } from 'nanoid'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [files, setFiles] = useState<Record<string, any>>({})
  const { addWindow } = useDesktopStore()

  useEffect(() => {
    setFiles(fs.getFiles(currentPath))
  }, [currentPath])

  const handleCreateFile = () => {
    const name = `New File ${Date.now()}`
    if (fs.createFile(name, currentPath)) {
      setFiles(fs.getFiles(currentPath))
    }
  }

  const handleOpenFile = (name: string) => {
    addWindow({
      id: nanoid(),
      title: name,
      component: 'TextEditor',
      props: {
        path: [...currentPath, name],
      },
    })
  }

  const navigateToFolder = (folder: string) => {
    setCurrentPath([...currentPath, folder])
  }

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1))
  }

  return (
    <div className="flex h-full">
      <div className="w-48 border-r p-2">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setCurrentPath([])}
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              onClick={navigateUp}
              className="w-full justify-start"
            >
              ..
            </Button>
          )}
          
          <ContextMenu>
            <ContextMenuTrigger className="w-full h-full min-h-[200px]">
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(files).map(([name, file]) => (
                  <Button
                    key={name}
                    variant="ghost"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    onClick={() => file.type === 'folder' ? navigateToFolder(name) : handleOpenFile(name)}
                  >
                    {file.type === 'folder' ? (
                      <Folder className="h-8 w-8" />
                    ) : (
                      <File className="h-8 w-8" />
                    )}
                    <span className="text-sm">{name}</span>
                  </Button>
                ))}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={handleCreateFile}>
                New File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </ScrollArea>
    </div>
  )
}
