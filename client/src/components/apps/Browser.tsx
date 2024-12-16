
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tab {
  id: number
  url: string
  title: string
  icon?: string
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, url: 'https://www.google.com', title: 'Google', icon: 'https://www.google.com/favicon.ico' }
  ])
  const [activeTab, setActiveTab] = useState(1)
  const [inputUrl, setInputUrl] = useState('https://www.google.com')

  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTab)
    if (currentTab) {
      setInputUrl(currentTab.url)
    }
  }, [activeTab])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tab = tabs.find(t => t.id === activeTab)
    if (tab) {
      let finalUrl = inputUrl
      if (!inputUrl.startsWith('http')) {
        finalUrl = `https://${inputUrl}`
      }
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url: finalUrl, title: finalUrl } : t
      ))
      setInputUrl(finalUrl)
    }
  }

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1
    setTabs([...tabs, { 
      id: newId, 
      url: 'https://www.google.com', 
      title: 'New Tab',
      icon: 'https://www.google.com/favicon.ico'
    }])
    setActiveTab(newId)
  }

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length > 1) {
      const newTabs = tabs.filter(t => t.id !== id)
      setTabs(newTabs)
      if (activeTab === id) {
        const lastTab = newTabs[newTabs.length - 1]
        setActiveTab(lastTab.id)
      }
    }
  }

  const refreshTab = () => {
    const tab = tabs.find(t => t.id === activeTab)
    if (tab) {
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url: t.url + '?' + Date.now() } : t
      ))
    }
  }

  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col border-b">
        <div className="flex items-center gap-2 p-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refreshTab} className="shrink-0">
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="pl-8"
                placeholder="Enter URL"
              />
            </div>
          </form>
        </div>
        
        <Tabs value={String(activeTab)} className="w-full">
          <TabsList className="flex w-full h-9 justify-start gap-1 bg-transparent p-1">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={String(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 data-[state=active]:bg-muted",
                  "relative group"
                )}
              >
                {tab.icon && (
                  <img src={tab.icon} className="h-4 w-4" alt="" />
                )}
                <span className="max-w-[120px] truncate">{tab.title}</span>
                <X 
                  className="h-4 w-4 opacity-0 group-hover:opacity-100" 
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </TabsTrigger>
            ))}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={addTab} 
              className="h-7 w-7 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 relative">
        <iframe
          key={currentTab?.url}
          src={`/api/proxy?url=${encodeURIComponent(currentTab?.url || '')}`}
          className="absolute inset-0 w-full h-full"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
