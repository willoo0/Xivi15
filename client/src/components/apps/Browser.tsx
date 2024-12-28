import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StartPage } from './browser/StartPage'
import { Tooltip } from '@/components/ui/tooltip'

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

  // Browser actions
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

  const navigate = useCallback(async (url: string) => {
    if (!url) return

    let processedUrl = url
    if (!url.match(/^https?:\/\//)) {
      if (url.includes('.') && !url.includes(' ')) {
        processedUrl = `https://${url}`
      } else {
        processedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }

    setTabs(tabs => tabs.map(tab =>
      tab.id === activeTab
        ? { ...tab, url: processedUrl, loading: true }
        : tab
    ))
    setUrlInput(processedUrl)

    try {
      // Initialize UV proxy
      if (!window.__uv$config) {
        throw new Error("UV proxy not initialized")
      }

      const encodedUrl = window.__uv$config.encodeUrl(processedUrl)
      const proxyUrl = window.__uv$config.prefix + encodedUrl

      // Update the current tab's URL through UV
      window.navigator.serviceWorker.register('/uv/sw.js', {
        scope: '/service/',
      }).then(() => {
        setTabs(tabs => tabs.map(tab =>
          tab.id === activeTab
            ? { ...tab, url: proxyUrl, loading: false }
            : tab
        ))
      })
    } catch (err) {
      console.error('Navigation error:', err)
      setTabs(tabs => tabs.map(tab =>
        tab.id === activeTab
          ? { ...tab, loading: false }
          : tab
      ))
    }
  }, [activeTab])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(urlInput)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center px-2 pt-2">
          <TabsList className="flex-1 justify-start h-9 bg-transparent">
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
                <Tooltip content="Close tab">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-2 hover:bg-destructive/20"
                    onClick={(e) => removeTab(tab.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Tooltip>
              </TabsTrigger>
            ))}
          </TabsList>
          <Tooltip content="New tab">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={addTab}>
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </Tabs>

      <div className="flex items-center gap-2 p-2 border-b">
        <Tooltip content="Reload">
          <Button variant="ghost" size="icon" onClick={() => navigate(currentTab?.url || '')}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Back">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Forward">
          <Button variant="ghost" size="icon" disabled>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Tooltip>

        <form onSubmit={handleUrlSubmit} className="flex-1">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter URL or search"
            className="h-9"
          />
        </form>
      </div>

      <div className="flex-1 relative">
        {currentTab?.url ? (
          <div className="absolute inset-0 w-full h-full" id="uv-frame" />
        ) : (
          <StartPage onNavigate={navigate} />
        )}
      </div>
    </div>
  )
}