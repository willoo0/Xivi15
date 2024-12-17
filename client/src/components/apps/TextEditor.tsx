import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface TextEditorProps {
  path?: string[];
}

export function TextEditor({ path }: TextEditorProps) {
  const [content, setContent] = useState('')
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const { toast } = useToast()
  const [filePath, setFilePath] = useState<string[]>([])

  useEffect(() => {
    console.log('[TextEditor] Received path prop:', path);
    
    if (!path || !Array.isArray(path)) {
      console.error('[TextEditor] Invalid or missing path prop:', path);
      setContent('');
      toast({
        title: "Error",
        description: "Invalid file path provided",
        variant: "destructive"
      });
      return;
    }

    // Store validated path
    setFilePath(path);

    // Load file content
    const fileContent = fs.getFileContent(path);
    console.log('[TextEditor] Loaded content:', fileContent !== null ? 'success' : 'failed');
    
    if (fileContent !== null) {
      setContent(fileContent);
    } else {
      setContent('');
      if (path.length > 0) {
        toast({
          title: "Notice",
          description: "Creating new file",
        });
      }
    }
  }, [path])

  const handleSave = () => {
    console.log('[TextEditor] Attempting to save file with path:', filePath);
    
    if (filePath.length === 0) {
      console.error('[TextEditor] No file path available for saving');
      toast({
        title: "Error",
        description: "No file path available for saving",
        variant: "destructive"
      });
      return;
    }

    const success = fs.updateFileContent(filePath, content);
    console.log('[TextEditor] Save result:', success ? 'success' : 'failed');
    
    if (success) {
      toast({
        title: "Success",
        description: "File saved successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive"
      });
    }
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
  }, [content, path])

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
    </div>
  )
}