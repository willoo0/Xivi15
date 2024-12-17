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

  useEffect(() => {
    console.log('[TextEditor] Component mounted');
    console.log('[TextEditor] Current path:', path);
    
    if (!path || !Array.isArray(path) || path.length === 0 || !path.every(segment => typeof segment === 'string' && segment.length > 0)) {
      console.error('[TextEditor] Invalid path:', path);
      setContent('');
      return;
    }

    console.log('[TextEditor] Loading content for path:', path.join('/'));
    const fileContent = fs.getFileContent(path)
    if (fileContent !== null) {
      console.log('[TextEditor] Content loaded successfully');
      setContent(fileContent)
    } else {
      console.log('[TextEditor] New file');
      setContent('')
    }
  }, [path])

  const handleSave = () => {
    console.log('[TextEditor] Attempting to save file');
    console.log('[TextEditor] Current path:', path);
    console.log('[TextEditor] Current content length:', content.length);
    
    if (!path || !Array.isArray(path) || path.length === 0 || !path.every(segment => typeof segment === 'string' && segment.length > 0)) {
      console.error('[TextEditor] Invalid path:', path);
      toast({
        title: "Error",
        description: "Invalid file path",
        variant: "destructive"
      });
      return;
    }

    console.log('[TextEditor] Saving file:', path.join('/'));
    const success = fs.updateFileContent([...path], content);
    
    if (success) {
      toast({
        title: "Success",
        description: "File saved successfully"
      });
      console.log('[TextEditor] File saved successfully:', path.join('/'));
    } else {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive"
      });
      console.error('[TextEditor] Failed to save file. Path:', path.join('/'));
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