
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Browser() {
  const [url, setUrl] = useState('https://replit.com')
  const [iframeUrl, setIframeUrl] = useState(url)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let finalUrl = url
    if (!url.startsWith('http')) {
      finalUrl = `https://${url}`
    }
    setIframeUrl(finalUrl)
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex gap-2 p-2">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
        />
        <Button type="submit">Go</Button>
      </form>
      <iframe
        src={iframeUrl}
        className="flex-1 w-full"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  )
}
