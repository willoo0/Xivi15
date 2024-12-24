
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function XiviMath() {
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const solveEquation = async () => {
    if (!equation.trim()) return;
    
    setLoading(true);
    try {
      // Try Wolfram Alpha first
      const wolframUrl = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(equation)}&appid=W4Q895-8WHH4Y43XU&podstate=Step-by-step solution&format=plaintext&output=json`;
      const wolframRes = await fetch(wolframUrl);
      const wolframData = await wolframRes.json();
      
      if (wolframData.queryresult?.success) {
        const steps = wolframData.queryresult.pods
          .find(pod => pod.title === "Step-by-step solution")
          ?.subpods[0]?.plaintext;
        
        if (steps) {
          setSolution(steps);
          setLoading(false);
          return;
        }
      }
      
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
    } catch (error) {
      setSolution("Error solving equation. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex gap-2">
        <Input
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Enter a math problem (e.g., solve 2x + 5 = 13)"
          onKeyDown={(e) => e.key === 'Enter' && solveEquation()}
        />
        <Button onClick={solveEquation} disabled={loading}>
          {loading ? 'Solving...' : 'Solve'}
        </Button>
      </div>
      {solution && (
        <div className="flex-1 overflow-auto bg-muted p-4 rounded-lg whitespace-pre-wrap">
          {solution}
        </div>
      )}
    </div>
  );
}
