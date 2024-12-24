
import { useState, useEffect } from 'react';
import { Command } from '@/components/ui/command';
import { Bot } from 'lucide-react';
import { useDesktopStore } from '@/store/desktop';
import { nanoid } from 'nanoid';

export function Spotlight() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { addWindow } = useDesktopStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === ' ' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const existingWindow = useDesktopStore.getState().windows.find(w => w.component === 'XiviAgent');
    
    if (existingWindow) {
      useDesktopStore.getState().setActiveWindow(existingWindow.id);
      if (existingWindow.isMinimized) {
        useDesktopStore.getState().toggleMinimize(existingWindow.id);
      }
      // Force XiviAgent to handle the new query by updating props with unique timestamp
      const updatedWindows = useDesktopStore.getState().windows.map(w => 
        w.id === existingWindow.id ? { ...w, props: { initialQuery: query.trim(), timestamp: Date.now() }} : w
      );
      useDesktopStore.setState({ windows: updatedWindows });
    } else {
      const windowId = nanoid();
      addWindow({
        id: windowId,
        title: 'Xivi Agent',
        component: 'XiviAgent',
        position: {
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 - 200,
          width: 600,
          height: 400,
        },
        props: {
          initialQuery: query.trim(),
          timestamp: Date.now()
        },
        isMinimized: false,
        isMaximized: false,
      });
      useDesktopStore.getState().setActiveWindow(windowId);
    }
    
    setQuery('');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center rounded-lg border bg-background shadow-xl">
            <div className="p-4">
              <Bot className="h-6 w-6" />
            </div>
            <input
              className="flex-1 bg-transparent p-4 text-lg outline-none"
              placeholder="Ask Xivi anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </form>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
    </div>
  );
}
