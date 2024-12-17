
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface TextEditorProps {
  path: string[];
}

export function TextEditor({ path }: TextEditorProps) {
  const [content, setContent] = useState('')
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const fileContent = fs.getFileContent(path)
    if (fileContent !== null) {
      setContent(fileContent)
    }
  }, [path])

  const handleSave = () => {
    if (!Array.isArray(path)) {
      console.error('Path is not an array:', path);
      toast({
        title: "Error",
        description: "Invalid file path format",
        variant: "destructive"
      });
      return;
    }

    if (path.length === 0) {
      console.error('Empty path array');
      toast({
        title: "Error",
        description: "File path is empty",
        variant: "destructive"
      });
      return;
    }

    // Validate each path segment
    if (!path.every(segment => typeof segment === 'string' && segment.length > 0)) {
      console.error('Invalid path segments:', path);
      toast({
        title: "Error",
        description: "Invalid file path segments",
        variant: "destructive"
      });
      return;
    }

    console.log('Attempting to save file:', path.join('/'));
    const success = fs.updateFileContent(path, content);
    
    if (success) {
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully."
      });
      console.log('File saved successfully:', path.join('/'));
    } else {
      toast({
        title: "Error",
        description: "Failed to save file. Please check the console for details.",
        variant: "destructive"
      });
      console.error('Failed to save file. Path:', path.join('/'));
    }
  }

  const handleRename = () => {
    if (!path || path.length === 0) return;
    const currentName = path[path.length - 1];
    setNewFileName(currentName);
    setShowRenameDialog(true);
  }

  const confirmRename = () => {
    if (!newFileName || !path || path.length === 0) return;
    const currentName = path[path.length - 1];
    if (newFileName !== currentName) {
      const newPath = [...path.slice(0, -1), newFileName];
      const success = fs.createFile(newFileName, path.slice(0, -1), 'file');
      if (success) {
        fs.updateFileContent(newPath, content);
        fs.deleteFile(path);
        window.location.reload(); // Refresh to update path
        toast({
          title: "File renamed",
          description: "File has been renamed successfully."
        });
      }
    }
    setShowRenameDialog(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [content])

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <Button size="sm" className="w-full" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        className="flex-1 resize-none rounded-none border-0"
      />
      
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter new filename"
          />
          <DialogFooter>
            <Button onClick={() => setShowRenameDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
