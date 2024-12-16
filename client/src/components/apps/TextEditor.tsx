import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

export function TextEditor() {
  const [content, setContent] = useState('')

  return (
    <Textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Start typing..."
      className="w-full h-full resize-none"
    />
  )
}
