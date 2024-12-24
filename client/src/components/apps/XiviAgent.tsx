import { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { useDesktopStore } from '@/store/desktop';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface XiviAgentProps {
  initialQuery?: string;
  timestamp?: number;
}

export function XiviAgent({ initialQuery, timestamp }: XiviAgentProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I\'m Xivi, your virtual assistant. How can I help you today?'
  }]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery?.trim()) {
      handleQuery(initialQuery);
    }
  }, []);

  useEffect(() => {
    const setupEventBus = async () => {
      const { eventBus } = await import('@/lib/eventBus');
      const handler = (question: string) => {
        handleQuery(question);
      };
      eventBus.on('newQuestion', handler);
      return () => eventBus.off('newQuestion', handler);
    };
    
    const cleanupPromise = setupEventBus();
    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, []);

  const handleQuery = async (questionToAsk?: string) => {
    const queryToSend = questionToAsk || inputQuery;
    if (!queryToSend.trim()) return;

    setInputQuery('');
    setIsLoading(true);

    const userMessage = { role: 'user' as const, content: queryToSend };
    setMessages(prev => [...prev, userMessage]);

    // Check for app opening commands
    const query = queryToSend.toLowerCase();
    if (query.includes('open') || query.includes('launch') || query.includes('start')) {
      const store = useDesktopStore.getState();
      const { apps } = await import('@/lib/apps');

      for (const [key, app] of Object.entries(apps)) {
        if (query.includes(key)) {
          store.addWindow({
            id: nanoid(),
            title: app.title,
            component: app.component,
            position: {
              x: 50 + Math.random() * 100,
              y: 50 + Math.random() * 100,
              width: 600,
              height: 400,
            },
            isMinimized: false,
            isMaximized: false,
          });
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I've opened ${app.title} for you.`
          }]);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.choices[0].message.content
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground ml-4' 
                : 'bg-muted mr-4'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg mr-4">
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-100">•</span>
                <span className="animate-bounce delay-200">•</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="Type your message..."
            className="flex-1 bg-muted p-2 rounded-md"
          />
          <Button onClick={() => handleQuery()} disabled={isLoading}>Send</Button>
        </div>
      </div>
    </div>
  );
}