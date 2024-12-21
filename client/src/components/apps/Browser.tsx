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
  const [history, setHistory] = useState<{ [key: number]: string[] }>({ 1: [] })
  const [historyIndex, setHistoryIndex] = useState<{ [key: number]: number }>({ 1: -1 })
  const [loading, setLoading] = useState(false)

  const encodeUrl = (url: string) => {
    if (url === 'about:blank') return url;
    return `/uv/service/${btoa(url)}`;
  };

  const navigate = useCallback((tabId: number, url: string, addToHistory = true) => {
    let finalUrl = url.trim();
    
    try {
      new URL(finalUrl);
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
    } catch {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
    }

    setTabs(tabs => tabs.map(tab =>
      tab.id === tabId ? { ...tab, url: finalUrl } : tab
    ));
    setInputUrl(finalUrl);

    if (addToHistory) {
      setHistory(prev => {
        const tabHistory = [...(prev[tabId] || []).slice(0, (historyIndex[tabId] || 0) + 1)];
        tabHistory.push(finalUrl);
        return { ...prev, [tabId]: tabHistory };
      });
      setHistoryIndex(prev => ({
        ...prev,
        [tabId]: (prev[tabId] || -1) + 1
      }));
    }
  }, [historyIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      navigate(activeTab, inputUrl);
    }
  };

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { id: newId, url: 'about:blank', title: 'New Tab' }]);
    setActiveTab(newId);
    setHistory(prev => ({ ...prev, [newId]: [] }));
    setHistoryIndex(prev => ({ ...prev, [newId]: -1 }));
  };

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      const newTabs = tabs.filter(t => t.id !== id);
      setTabs(newTabs);
      if (activeTab === id) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
    }
  };

  const goBack = () => {
    const currentIndex = historyIndex[activeTab] || 0;
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const url = history[activeTab][newIndex];
      navigate(activeTab, url, false);
      setHistoryIndex(prev => ({ ...prev, [activeTab]: newIndex }));
    }
  };

  const goForward = () => {
    const currentIndex = historyIndex[activeTab] || 0;
    const tabHistory = history[activeTab] || [];
    if (currentIndex < tabHistory.length - 1) {
      const newIndex = currentIndex + 1;
      const url = tabHistory[newIndex];
      navigate(activeTab, url, false);
      setHistoryIndex(prev => ({ ...prev, [activeTab]: newIndex }));
    }
  };

  const refresh = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab) {
      navigate(activeTab, tab.url);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col border-b">
        <div className="flex items-center gap-2 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack}
            disabled={!history[activeTab] || (historyIndex[activeTab] || 0) <= 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goForward}
            disabled={!history[activeTab] || (historyIndex[activeTab] || 0) >= (history[activeTab]?.length || 0) - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refresh}>
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
                placeholder="Search or enter URL"
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
        {currentTab?.url === 'about:blank' ? (
          <StartPage onNavigate={(url) => navigate(activeTab, url)} />
        ) : currentTab && (
          <iframe
            key={`${currentTab.id}-${currentTab.url}`}
            src={encodeUrl(currentTab.url)}
            className="absolute inset-0 w-full h-full"
            onLoad={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
          />
        )}
      </div>
    </div>
  )
}