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
    try {
      if (!path) {
        throw new Error('File path is undefined or null');
      }

      if (!Array.isArray(path)) {
        throw new Error(`Invalid path type: expected array, got ${typeof path}`);
      }

      if (path.length === 0) {
        throw new Error('File path is empty');
      }

      path.forEach((segment, index) => {
        if (!segment || typeof segment !== 'string') {
          throw new Error(`Invalid path segment at position ${index}: ${segment}`);
        }
        if (segment.trim().length === 0) {
          throw new Error(`Empty path segment at position ${index}`);
        }
      });

      const fullPath = path.join('/');
      console.log('[TextEditor] Loading file:', fullPath);

    // Validate each path segment
    const invalidSegments = path.filter(segment => !segment || typeof segment !== 'string' || segment.length === 0);
    if (invalidSegments.length > 0) {
      console.error('[TextEditor] Invalid path segments found:', invalidSegments);
      setContent('');
      return;
    }

    console.log('[TextEditor] Path validation passed');
    console.log('[TextEditor] Attempting to load content for path:', path.join('/'));
    
    const fileContent = fs.getFileContent(path);
    if (fileContent !== null) {
      console.log('[TextEditor] Content loaded successfully, length:', fileContent.length);
      setContent(fileContent);
    } else {
      console.log('[TextEditor] No existing content found, initializing empty file');
      setContent('');
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