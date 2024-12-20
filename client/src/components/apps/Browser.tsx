import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StartPage } from './browser/StartPage'

interface Tab {
  id: number
  url: string
  title: string
  icon?: string
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, url: 'about:blank', title: 'New Tab' }
  ])
  const [activeTab, setActiveTab] = useState(1)
  const [inputUrl, setInputUrl] = useState('')
  const [history, setHistory] = useState<{ [key: number]: string[] }>({})
  const [historyIndex, setHistoryIndex] = useState<{ [key: number]: number }>({})
  const [loading, setLoading] = useState(false)

  const navigate = useCallback((tabId: number, url: string, addToHistory = true) => {
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    setTabs(tabs => tabs.map(tab =>
      tab.id === tabId ? { ...tab, url: finalUrl } : tab
    ))
    setInputUrl(finalUrl)

    if (addToHistory) {
      setHistory(prev => {
        const tabHistory = [...(prev[tabId] || []), finalUrl]
        return { ...prev, [tabId]: tabHistory }
      })
      setHistoryIndex(prev => ({
        ...prev,
        [tabId]: (prev[tabId] || 0) + 1
      }))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = inputUrl.trim()
    
    try {
      new URL(query)
      navigate(activeTab, query)
    } catch {
      navigate(activeTab, `https://www.google.com/search?q=${encodeURIComponent(query)}`)
    }
  }

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1
    setTabs([...tabs, { id: newId, url: 'about:blank', title: 'New Tab' }])
    setActiveTab(newId)
  }

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length > 1) {
      const newTabs = tabs.filter(t => t.id !== id)
      setTabs(newTabs)
      if (activeTab === id) {
        setActiveTab(newTabs[newTabs.length - 1].id)
      }
    }
  }

  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col border-b">
        <div className="flex items-center gap-2 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => history[activeTab]?.length > 1 && window.history.back()}
            disabled={!history[activeTab] || (historyIndex[activeTab] || 0) <= 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.forward()}
            disabled={true}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => currentTab && navigate(activeTab, currentTab.url)}
          >
            <RotateCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="pl-8"
                placeholder="Search or enter website name"
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
                className="flex items-center gap-2 px-4 data-[state=active]:bg-muted relative group"
              >
                {tab.icon && <img src={tab.icon} className="h-4 w-4" alt="" />}
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
        {currentTab?.url === 'about:blank' ? (
          <StartPage onNavigate={(url) => navigate(activeTab, url)} />
        ) : (
          currentTab && (
            <iframe
              key={`${currentTab.id}-${currentTab.url}`}
              src={`/api/proxy?url=${encodeURIComponent(currentTab.url)}`}
              className="absolute inset-0 w-full h-full"
              sandbox="allow-same-origin allow-scripts allow-forms"
              onLoad={(e) => {
                setLoading(false);
                const frame = e.target as HTMLIFrameElement;
                frame.contentWindow?.document.querySelectorAll('a').forEach(link => {
                  link.onclick = (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    if (href) {
                      navigate(currentTab.id, href);
                    }
                  };
                });
              }}
              onLoadStart={() => setLoading(true)}
            />
          )
        )}
      </div>
    </div>
  )
}