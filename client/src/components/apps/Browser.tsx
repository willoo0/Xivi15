
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
  const [history, setHistory] = useState<{ [key: number]: string[]}>({ 1: ['https://www.google.com'] })
  const [historyIndex, setHistoryIndex] = useState<{ [key: number]: number }>({ 1: 0 })

  const handleIframeLoad = async (tabId: number, iframe: HTMLIFrameElement) => {
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(tabs.find(t => t.id === tabId)?.url || '')}&mode=head`);
      if (response.ok) {
        const finalUrl = response.headers.get('x-final-url');
        if (finalUrl) {
          const title = tabs.find(t => t.id === tabId)?.title || finalUrl;
          
          setTabs(tabs.map(t => 
            t.id === tabId ? { 
              ...t, 
              url: finalUrl,
              title: title,
              icon: `${new URL(finalUrl).origin}/favicon.ico`
            } : t
          ))
          setInputUrl(finalUrl)
          
          // Update history
          const tabHistory = history[tabId] || []
          const tabHistoryIndex = historyIndex[tabId] || 0
          
          // Only add to history if it's a new URL
          if (tabHistory[tabHistoryIndex] !== finalUrl) {
            const newHistory = tabHistory.slice(0, tabHistoryIndex + 1)
            newHistory.push(finalUrl)
            setHistory({ ...history, [tabId]: newHistory })
            setHistoryIndex({ ...historyIndex, [tabId]: newHistory.length - 1 })
          }
        }
      }
    } catch (error) {
      console.error('Error handling iframe load:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let finalUrl = inputUrl.trim()
    
    try {
      const url = new URL(finalUrl)
      if (!url.protocol) {
        finalUrl = `https://${finalUrl}`
      }
    } catch {
      finalUrl = `https://${finalUrl}`
    }
    
    const tab = tabs.find(t => t.id === activeTab)
    if (tab) {
      setInputUrl(finalUrl)
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url: finalUrl } : t
      ))
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
    setHistory({ ...history, [newId]: ['https://www.google.com'] })
    setHistoryIndex({ ...historyIndex, [newId]: 0 })
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

  const navigate = (direction: 'back' | 'forward') => {
    const tabHistory = history[activeTab] || []
    const currentIndex = historyIndex[activeTab] || 0
    
    if (direction === 'back' && currentIndex > 0) {
      const newIndex = currentIndex - 1
      const url = tabHistory[newIndex]
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url } : t
      ))
      setHistoryIndex({ ...historyIndex, [activeTab]: newIndex })
      setInputUrl(url)
    } else if (direction === 'forward' && currentIndex < tabHistory.length - 1) {
      const newIndex = currentIndex + 1
      const url = tabHistory[newIndex]
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url } : t
      ))
      setHistoryIndex({ ...historyIndex, [activeTab]: newIndex })
      setInputUrl(url)
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'navigate' && event.data?.url) {
        setInputUrl(event.data.url);
        const tab = tabs.find(t => t.id === activeTab);
        if (tab) {
          setTabs(tabs.map(t => 
            t.id === activeTab ? { ...t, url: event.data.url } : t
          ));
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTab, tabs, setTabs]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col border-b">
        <div className="flex items-center gap-2 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('back')}
            disabled={!history[activeTab] || historyIndex[activeTab] === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('forward')}
            disabled={!history[activeTab] || historyIndex[activeTab] === (history[activeTab]?.length || 0) - 1}
          >
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
          onLoad={(e) => handleIframeLoad(activeTab, e.currentTarget)}
        />
      </div>
    </div>
  )
}
