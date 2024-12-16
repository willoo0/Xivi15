
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X } from 'lucide-react'

interface Tab {
  id: number
  url: string
  title: string
}

export function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, url: 'https://www.google.com', title: 'Google' }])
  const [activeTab, setActiveTab] = useState(1)
  const [inputUrl, setInputUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tab = tabs.find(t => t.id === activeTab)
    if (tab) {
      let finalUrl = inputUrl
      if (!inputUrl.startsWith('http')) {
        finalUrl = `https://${inputUrl}`
      }
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, url: finalUrl } : t
      ))
    }
  }

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1
    setTabs([...tabs, { id: newId, url: 'https://www.google.com', title: 'New Tab' }])
    setActiveTab(newId)
  }

  const closeTab = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length > 1) {
      setTabs(tabs.filter(t => t.id !== id))
      if (activeTab === id) {
        setActiveTab(tabs[0].id)
      }
    }
  }

  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2">
        <Tabs value={String(activeTab)} className="flex-1">
          <TabsList className="flex w-full">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={String(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                {tab.title}
                <X className="h-4 w-4" onClick={(e) => closeTab(tab.id, e)} />
              </TabsTrigger>
            ))}
            <Button variant="ghost" size="icon" onClick={addTab} className="ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
        </Tabs>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-2">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL"
        />
        <Button type="submit">Go</Button>
      </form>
      <iframe
        src={currentTab?.url}
        className="flex-1 w-full"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  )
}
