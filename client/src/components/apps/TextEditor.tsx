import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useToast } from '@/hooks/use-toast'

interface TextEditorProps {
  path?: string[];
}

export function TextEditor({ path }: TextEditorProps) {
  const [content, setContent] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    console.log('TextEditor: Loading content for path:', path);
    if (!Array.isArray(path) || path.length === 0) {
      console.error('Invalid or empty path:', path);
      return;
    }

    const fileContent = fs.getFileContent(path)
    if (fileContent !== null) {
      setContent(fileContent)
    } else {
      console.error('Could not load file content for path:', path);
    }
  }, [path])

  const handleSave = () => {
    console.log('TextEditor: Attempting to save file with path:', path);
    if (!Array.isArray(path) || path.length === 0) {
      toast({
        title: "Error",
        description: "Invalid file path",
        variant: "destructive"
      });
      return;
    }

    const success = fs.updateFileContent(path, content);
    if (success) {
      toast({
        title: "Success",
        description: "File saved successfully"
      });
      console.log('File saved successfully:', path.join('/'));
    } else {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive"
      });
      console.error('Failed to save file. Path:', path.join('/'));
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
    </div>
  )
}