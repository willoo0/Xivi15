
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface StartPageProps {
  onNavigate: (url: string) => void
}

export function StartPage({ onNavigate }: StartPageProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onNavigate(query)
    }
  }

  const quickLinks = [
    { name: "Google", url: "https://google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Reddit", url: "https://reddit.com" },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background/80">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">🌐 Web Browser</h1>
          <p className="text-lg text-muted-foreground">
            Search or enter website name
          </p>
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

        <div className="grid grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.url}
              onClick={() => onNavigate(link.url)}
              className="p-4 rounded-lg hover:bg-muted transition-colors text-center"
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Globe } from 'lucide-react'

interface StartPageProps {
  onNavigate: (url: string) => void
}

export function StartPage({ onNavigate }: StartPageProps) {
  const popularSites = [
    { name: 'Google', url: 'google.com' },
    { name: 'YouTube', url: 'youtube.com' },
    { name: 'Wikipedia', url: 'wikipedia.org' },
    { name: 'Reddit', url: 'reddit.com' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-8">
      <h1 className="text-4xl font-bold flex items-center gap-2">
        <Globe className="h-8 w-8" />
        Browser
      </h1>
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
        {popularSites.map(site => (
          <Button
            key={site.url}
            variant="outline"
            className="h-24 w-24"
            onClick={() => onNavigate(site.url)}
          >
            {site.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
