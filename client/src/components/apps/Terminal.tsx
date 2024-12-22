
import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TerminalTab {
  id: string;
  history: string[];
  input: string;
}

export function Terminal() {
  const [tabs, setTabs] = useState<TerminalTab[]>([{ id: '1', history: [], input: '' }]);
  const [activeTab, setActiveTab] = useState('1');
  const [isBSOD, setIsBSOD] = useState(false);
  const [isRainbow, setIsRainbow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTerminal = tabs.find(tab => tab.id === activeTab) || tabs[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [tabs, activeTerminal.history]);

  const handleCommand = (command: string) => {
    let output = '';
    const parts = command.trim().split(' ');
    
    switch (parts[0].toLowerCase()) {
      case "rainbow":
        setIsRainbow(prev => !prev);
        output = isRainbow ? "Rainbow mode disabled" : "🌈 Rainbow mode enabled";
        break;
      case "kitty":
        output = "\x1b[35m🐱 Fetching a random cat...\x1b[0m\n";
        fetch('https://cataas.com/cat?json=true')
          .then(response => response.json())
          .then(data => {
            const newHistory = [...activeTerminal.history];
            newHistory.push(`\x1b[36mMeow! Here's your cat:\x1b[0m\nhttps://cataas.com${data.url}`);
            setTabs(prev => prev.map(tab =>
              tab.id === activeTab ? { ...tab, history: newHistory } : tab
            ));
          })
          .catch(() => {
            const newHistory = [...activeTerminal.history];
            newHistory.push("\x1b[31mFailed to fetch a cat image :(\x1b[0m");
            setTabs(prev => prev.map(tab =>
              tab.id === activeTab ? { ...tab, history: newHistory } : tab
            ));
          });
        break;
      case "bsod":
        setIsBSOD(true);
        return;
      case "help":
        output = "\x1b[36mAvailable commands:\x1b[0m ls, echo, cat, sudo, apt, pwd, whoami, clear, help, bsod, rainbow, kitty";
        break;
      default:
        output = `\x1b[31mCommand not found: ${command}\x1b[0m`;
    }

    if (output) {
      const newHistory = [...activeTerminal.history, `$ ${command}`, output];
      setTabs(prev => prev.map(tab =>
        tab.id === activeTab ? { ...tab, history: newHistory, input: '' } : tab
      ));
    }
  };

  if (isBSOD) {
    return (
      <div className="h-full bg-blue-600 text-white p-8 font-mono">
        <h1 className="text-xl mb-4">SYSTEM ERROR</h1>
        <p>A problem has been detected and the system has been halted.</p>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-zinc-900 text-zinc-100 font-mono ${isRainbow ? 'animate-rainbow' : ''}`}>
      <div className="flex items-center gap-2 p-2 bg-zinc-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-zinc-900">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                Terminal {tab.id}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        {activeTerminal.history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <div className="flex">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={activeTerminal.input}
            onChange={(e) => {
              setTabs(prev => prev.map(tab =>
                tab.id === activeTab ? { ...tab, input: e.target.value } : tab
              ));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeTerminal.input.trim()) {
                handleCommand(activeTerminal.input.trim());
              }
            }}
            className="flex-1 bg-transparent outline-none"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
