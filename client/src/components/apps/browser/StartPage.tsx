import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface StartPageProps {
  onNavigate: (url: string) => void
}

export function StartPage({ onNavigate }: StartPageProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalUrl = query.trim()
    
    // Check if it's a valid URL
    try {
      new URL(finalUrl)
      // If it doesn't have a protocol, add https://
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }
    } catch {
      // Not a valid URL, search on Google
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`
    }
    
    onNavigate(finalUrl)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background/80">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Web Browser</h1>
          <p className="text-lg text-muted-foreground">Search or enter website name</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web or enter a URL"
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
    </div>
  )
}
