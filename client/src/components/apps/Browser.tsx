
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StartPage } from './browser/StartPage'

type Tab = {
  id: string
  url: string
  title: string
  loading: boolean
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', url: '', title: 'New Tab', loading: false }])
  const [activeTab, setActiveTab] = useState('1')
  const [urlInput, setUrlInput] = useState('')

  const currentTab = tabs.find(tab => tab.id === activeTab)

  const addTab = () => {
    const newTab = {
      id: Math.random().toString(36).substr(2, 9),
      url: '',
      title: 'New Tab',
      loading: false
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
    setUrlInput('')
  }

  const removeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    if (newTabs.length === 0) {
      const newTab = { id: Math.random().toString(36).substr(2, 9), url: '', title: 'New Tab', loading: false }
      setTabs([newTab])
      setActiveTab(newTab.id)
    } else if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
    setTabs(newTabs.length === 0 ? [{ id: '1', url: '', title: 'New Tab', loading: false }] : newTabs)
  }

  const navigate = useCallback((url: string) => {
    if (!url) return

    let processedUrl = url
    if (!url.match(/^https?:\/\//)) {
      if (url.includes('.') && !url.includes(' ')) {
        processedUrl = `https://${url}`
      } else {
        processedUrl = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`
      }
    }

    setTabs(tabs => tabs.map(tab =>
      tab.id === activeTab
        ? { ...tab, url: processedUrl, loading: true }
        : tab
    ))
    setUrlInput(processedUrl)
  }, [activeTab])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(urlInput)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs value={activeTab} className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <div className="flex items-center border-b">
          <TabsList className="flex-1 justify-start h-10 bg-transparent">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 px-4 data-[state=active]:bg-background",
                  tab.id === activeTab ? "border-b-2 border-primary" : ""
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{tab.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 hover:bg-destructive/20"
                  onClick={(e) => removeTab(tab.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={addTab}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 p-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate(currentTab?.url || '')}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <form onSubmit={handleUrlSubmit} className="flex-1">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search with DuckDuckGo"
              className="h-9"
            />
          </form>
        </div>

        <div className="flex-1 relative">
          {currentTab?.url ? (
            <iframe
              key={currentTab.url}
              src={`/ric/proxy/${encodeURIComponent(currentTab.url)}`}
              className="absolute inset-0 w-full h-full"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              onLoad={() => {
                setTabs(tabs => tabs.map(tab =>
                  tab.id === activeTab ? { ...tab, loading: false } : tab
                ))
              }}
            />
          ) : (
            <StartPage onNavigate={navigate} />
          )}
        </div>
      </Tabs>
    </div>
  )
}
