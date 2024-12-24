
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function XiviMath() {
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const maxRetries = 3;
  let retryCount = 0;

  const handleSolve = async () => {
    if (!equation.trim()) {
      setSolution('Please enter an equation.');
      return;
    }

    setLoading(true);
    try {
      // Try Wolfram Alpha first
      const formattedEquation = equation.replace(/\s+/g, ' ').trim();
      const wolframUrl = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(formattedEquation)}&appid=W4Q895-8WHH4Y43XU&podstate=Step-by-step%20solution&format=plaintext&output=json`;
      
      const wolframRes = await fetch(wolframUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!wolframRes.ok) {
        throw new Error(`Wolfram Alpha API error: ${wolframRes.status}`);
      }

      const wolframData = await wolframRes.json();
      
      if (wolframData.queryresult?.success) {
        const steps = wolframData.queryresult.pods
          .find((pod: any) => pod.title === 'Step-by-step solution')
          ?.subpods[0]?.plaintext;
        setSolution(steps || 'No step-by-step solution available.');
      } else {
        // Fallback to AI
        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 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",
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content: "You are a math expert. Provide step-by-step solutions to mathematical problems. Be clear and concise."
              },
              {
                role: "user",
                content: `Please solve this math problem step by step: ${equation}`
              }
            ]
          })
        });

        const aiData = await aiRes.json();
        setSolution(aiData.choices[0].message.content);
      }
    } catch (error) {
      console.error("API Error:", error);
      setSolution("An error occurred while solving the equation:\n\n- Network error: Unable to reach Wolfram Alpha or AI service\n\nTip: Make sure your equation is properly formatted (e.g., 'solve 2x + 5 = 13' or '∫x^2dx')");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-2">
        <Textarea
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Enter your equation (e.g., 'solve 2x + 5 = 13' or '∫x^2dx')"
          className="flex-1"
        />
        <Button onClick={handleSolve} disabled={loading}>
          {loading ? 'Solving...' : 'Solve'}
        </Button>
      </div>
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      {solution && !loading && (
        <div className="flex-1 overflow-auto bg-muted p-4 rounded-lg whitespace-pre-wrap">
          {solution}
        </div>
      )}
    </div>
  );
}
