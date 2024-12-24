
import { useEffect, useState } from 'react';
import { Command } from '@/components/ui/command';
import { Search, Bot } from 'lucide-react';

export function XiviAgent() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
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
          messages: [{
            role: 'user',
            content: query
          }]
        })
      });
      
      const data = await res.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      setResponse('Sorry, I encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        document.getElementById('xiviSearch')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center">
      <div className="w-[600px] bg-background rounded-lg shadow-lg">
        <div className="flex items-center gap-2 p-4 border-b">
          <Bot className="w-5 h-5" />
          <input
            id="xiviSearch"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="Ask Xivi anything... (Ctrl+Space)"
            className="flex-1 bg-transparent border-none outline-none"
            autoFocus
          />
          {isLoading && <div className="animate-spin">⌛</div>}
        </div>
        {response && (
          <div className="p-4 max-h-[400px] overflow-auto">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
