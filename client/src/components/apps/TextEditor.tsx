
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { fs } from '@/lib/fileSystem'

interface TextEditorProps {
  path: string[];
}

export function TextEditor({ path }: TextEditorProps) {
  const [content, setContent] = useState('')

  useEffect(() => {
    const fileContent = fs.getFileContent(path)
    if (fileContent !== null) {
      setContent(fileContent)
    }
  }, [path])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    fs.updateFileContent(path, newContent)
  }

  return (
    <Textarea
      value={content}
      onChange={handleChange}
      placeholder="Start typing..."
      className="w-full h-full resize-none"
    />
  )
}
