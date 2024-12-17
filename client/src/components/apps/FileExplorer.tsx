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
    try {
      if (!name || name.trim().length === 0) {
        throw new Error('Invalid file name: name cannot be empty');
      }

      if (!currentPath || !Array.isArray(currentPath)) {
        throw new Error('Invalid current directory path');
      }

      const filePath = [...currentPath, name].filter(Boolean);
      if (filePath.length === 0) {
        throw new Error('Cannot construct valid file path');
      }

      const fileExists = fs.getFileContent(filePath);
      if (fileExists === null) {
        throw new Error(`File not found: ${filePath.join('/')}`);
      }

    if (typeof name !== 'string') {
      console.error('[FileExplorer] Invalid file name type:', typeof name);
      return;
    }

    // Construct and validate full path
    const filePath = [...currentPath, name].filter(Boolean);
    console.log('[FileExplorer] Constructed file path:', filePath);

    if (filePath.length === 0) {
      console.error('[FileExplorer] Failed to construct valid file path');
      return;
    }

    // Verify file exists in filesystem
    const fileContent = fs.getFileContent(filePath);
    console.log('[FileExplorer] File content check:', fileContent !== null ? 'exists' : 'not found');

    console.log('[FileExplorer] Creating window for file:', filePath.join('/'));
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
    
    console.log('[FileExplorer] Window created with props:', { path: filePath });
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