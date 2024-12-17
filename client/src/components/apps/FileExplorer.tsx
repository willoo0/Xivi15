import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, File, ChevronRight, ChevronUp, Trash, Plus } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useDesktopStore } from '@/store/desktop'
import { nanoid } from 'nanoid'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'


export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [files, setFiles] = useState<Record<string, any>>({})
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const { addWindow } = useDesktopStore()

  useEffect(() => {
    setFiles(fs.getFiles(currentPath))
  }, [currentPath])

  const handleCreateFile = (type: 'file' | 'folder' = 'file') => {
    const name = type === 'file' ? `New File ${Date.now()}` : `New Folder ${Date.now()}`
    if (fs.createFile(name, currentPath, type)) {
      setFiles(fs.getFiles(currentPath))
    }
  }

  const handleDeleteFile = (name: string) => {
    if (fs.deleteFile([...currentPath, name])) {
      setFiles(fs.getFiles(currentPath))
    }
  }

  const handleOpenFile = (name: string) => {
    console.log('[FileExplorer] Opening file:', name, 'from path:', currentPath);
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Invalid file name",
        variant: "destructive"
      });
      return;
    }

    const filePath = [...currentPath, name];
    console.log('[FileExplorer] Constructed file path:', filePath);

    // Verify if the file exists
    if (fs.getFileContent(filePath) === null) {
      // Create the file if it doesn't exist
      console.log('[FileExplorer] File not found, creating new file');
      if (!fs.createFile(name, currentPath)) {
        toast({
          title: "Error",
          description: "Failed to create file",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('[FileExplorer] Opening editor with path:', filePath);
    addWindow({
      id: nanoid(),
      title: name,
      component: 'TextEditor',
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 600,
        height: 400,
      },
      isMinimized: false,
      isMaximized: false,
      props: {
        path: filePath,
      },
    });
  }

  const navigateToFolder = (folder: string) => {
    setCurrentPath([...currentPath, folder])
  }

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1))
  }

  const handleRename = () => {
    if (newFileName && newFileName !== selectedFile) {
      const success = fs.renameFile([...currentPath, selectedFile], newFileName);
      if (success) {
        setFiles(fs.getFiles(currentPath));
        setRenameDialogOpen(false);
        setNewFileName("");
        setSelectedFile("");
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-2 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateUp}
          disabled={currentPath.length === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-sm">
          {currentPath.length === 0 ? 'Home' : currentPath.join(' / ')}
        </div>
      </div>

      <div className="flex-1 relative">
        <ScrollArea className="h-full">
          <ContextMenu>
            <ContextMenuTrigger className="flex flex-col min-h-[200px] p-4">
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(files).map(([name, file]) => (
                  <ContextMenu key={name}>
                    <ContextMenuTrigger>
                      <Button
                        variant="ghost"
                        className="h-24 w-full flex flex-col items-center justify-center space-y-2"
                        onClick={() => file.type === 'folder' ? navigateToFolder(name) : handleOpenFile(name)}
                      >
                        {file.type === 'folder' ? (
                          <Folder className="h-8 w-8" />
                        ) : (
                          <File className="h-8 w-8" />
                        )}
                        <span className="text-sm truncate max-w-full">{name}</span>
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {file.type === 'file' && (
                        <ContextMenuItem onClick={() => handleOpenFile(name)}>
                          Open
                        </ContextMenuItem>
                      )}
                      {file.type === 'folder' && (
                        <ContextMenuItem onClick={() => navigateToFolder(name)}>
                          Open
                        </ContextMenuItem>
                      )}
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => {
                        setSelectedFile(name);
                        setRenameDialogOpen(true);
                      }}>
                        Rename
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleDeleteFile(name)} className="text-red-600">
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleCreateFile('file')}>
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCreateFile('folder')}>
                New Folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ScrollArea>
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
            </DialogHeader>
            <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="New file name" />
            <DialogFooter>
              <Button onClick={handleRename}>Rename</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}