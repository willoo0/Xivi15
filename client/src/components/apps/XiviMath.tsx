
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
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Try Wolfram Alpha first
        const formattedEquation = equation.replace(/\s+/g, ' ').trim();
        const wolframUrl = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(formattedEquation)}&appid=W4Q895-8WHH4Y43XU&podstate=Step-by-step%20solution&format=plaintext&output=json`;
        
        const wolframRes = await fetch(wolframUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-cache'
        });

        if (!wolframRes.ok) {
          throw new Error(`Wolfram Alpha API error: ${wolframRes.status}`);
        }
      
      if (!wolframRes.ok) {
        throw new Error(`Wolfram Alpha API error: ${wolframRes.status}`);
      }
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
      retryCount++;
      if (retryCount === maxRetries) {
        let errorMessage = "An error occurred while solving the equation:\n\n";
        
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            errorMessage += "- Network error: Please check your internet connection and try again\n";
        } else if (error.message.includes('api.wolframalpha.com')) {
          errorMessage += "- Wolfram Alpha API error: Check if the equation format is valid\n";
        } else if (error.message.includes('groq.com')) {
          errorMessage += "- AI Service error: Unable to process the equation\n";
        } else {
          errorMessage += `- ${error.message}\n`;
        }
      } else {
        errorMessage += "- Unknown error occurred. Please check your equation format and try again\n";
      }
      
      errorMessage += "\nTip: Make sure your equation is properly formatted (e.g., 'solve 2x + 5 = 13' or '∫x^2dx')";
      setSolution(errorMessage);
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
