
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { fs } from '@/lib/fileSystem'
import { useToast } from '@/hooks/use-toast'

interface TextEditorProps {
  path: string[];
}

export function TextEditor({ path }: TextEditorProps) {
  const [content, setContent] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const fileContent = fs.getFileContent(path)
    if (fileContent !== null) {
      setContent(fileContent)
    }
  }, [path])

  const handleSave = () => {
    const success = fs.updateFileContent(path, content);
    if (success) {
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save file. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleRename = () => {
    const currentName = path[path.length - 1];
    const newName = prompt('Enter new name:', currentName);
    if (newName && newName !== currentName) {
      const newPath = [...path.slice(0, -1), newName];
      const success = fs.createFile(newName, path.slice(0, -1), 'file');
      if (success) {
        fs.updateFileContent(newPath, content);
        fs.deleteFile(path);
        path = newPath;
        toast({
          title: "File renamed",
          description: "File has been renamed successfully."
        });
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end gap-2 p-2 border-b">
        <Button size="sm" onClick={handleRename}>
          Rename
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
        className="flex-1 resize-none rounded-none border-0"
      />
    </div>
  )
}
