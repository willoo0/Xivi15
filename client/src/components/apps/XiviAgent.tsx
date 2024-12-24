
import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface XiviAgentProps {
  initialQuery?: string;
}

export function XiviAgent({ initialQuery }: XiviAgentProps = {}) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I\'m Xivi, your virtual assistant. How can I help you today?'
  }]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleQuery(initialQuery);
    }
  }, []);

  const handleQuery = async (inputQuery?: string) => {
    const queryToSend = inputQuery || query;
    if (!queryToSend.trim()) return;

    const userMessage = { role: 'user' as const, content: queryToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!inputQuery) setQuery('');
    setIsLoading(true);

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
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.choices[0].message.content
      };
      setMessages(prev => [...prev, assistantMessage]);
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
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
