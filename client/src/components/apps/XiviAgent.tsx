import { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { useDesktopStore } from "@/store/desktop";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface XiviAgentProps {
  initialQuery?: string;
  timestamp?: number;
}

export function XiviAgent({ initialQuery, timestamp }: XiviAgentProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const initialMessage = {
    role: "assistant" as const,
    content:
      "Hello! I'm Xivi, your virtual assistant. How can I help you today? 😊",
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const clearChat = () => {
    setMessages([initialMessage]);
    setInputQuery("");
  };

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
      const { eventBus } = await import("@/lib/eventBus");
      const handler = (question: string) => {
        handleQuery(question);
      };
      eventBus.on("newQuestion", handler);
      return () => eventBus.off("newQuestion", handler);
    };

    const cleanupPromise = setupEventBus();
    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, []);

  const handleQuery = async (questionToAsk?: string) => {
    const queryToSend = questionToAsk || inputQuery;
    if (!queryToSend.trim()) return;

    setInputQuery("");
    setIsLoading(true);

    const userMessage = { role: "user" as const, content: queryToSend };
    setMessages((prev) => [...prev, userMessage]);

    // Check for app opening commands
    const query = queryToSend.toLowerCase();
    const store = useDesktopStore.getState();

    // Handle theme changes
    if (query.includes("theme")) {
      if (query.includes("dark")) {
        store.updateSettings({ theme: "dark" });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I've switched to dark theme! 🌙"
        }]);
        setIsLoading(false);
        return;
      } else if (query.includes("light")) {
        store.updateSettings({ theme: "light" });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I've switched to light theme! ☀️"
        }]);
        setIsLoading(false);
        return;
      }
    }

    // Handle taskbar layout changes
    if (query.includes("taskbar")) {
      if (query.includes("normal") || query.includes("default")) {
        store.updateSettings({ taskbarMode: "normal" });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Taskbar set to normal mode! 🎯"
        }]);
        setIsLoading(false);
        return;
      } else if (query.includes("chrome")) {
        store.updateSettings({ taskbarMode: "chrome" });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Taskbar set to Chrome OS style! 🌐"
        }]);
        setIsLoading(false);
        return;
      } else if (query.includes("windows") || query.includes("win11")) {
        store.updateSettings({ taskbarMode: "windows11" });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Taskbar set to Windows 11 style! 💻"
        }]);
        setIsLoading(false);
        return;
      }
    }

    // Handle closing apps
    if (query.includes("close")) {
      const windowToClose = store.windows.find(w => 
        query.toLowerCase().includes(w.title.toLowerCase()) ||
        query.toLowerCase().includes(w.component.toLowerCase())
      );
      
      if (windowToClose) {
        store.removeWindow(windowToClose.id);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `I've closed ${windowToClose.title} for you! 🚪`
        }]);
        setIsLoading(false);
        return;
      }
    }

    // Handle opening apps
    if (
      query.includes("open") ||
      query.includes("launch") ||
      query.includes("start")
    ) {
      const store = useDesktopStore.getState();
      const { apps } = await import("@/lib/apps");

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

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `I've opened the ${app.title} app for you! 😊`,
            },
          ]);
          setIsLoading(false);
          return;
        }
      }
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const res = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer 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",
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a friendly and helpful assistant. Use emojis in your responses to make them more engaging and fun. Be concise but warm in your communication.",
                },
                ...messages,
                userMessage,
              ].map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            `API Error: ${res.status} - ${errorData.error?.message || "Unknown error"}`,
          );
        }

        const data = await res.json();
        if (data?.choices?.[0]?.message?.content) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.choices[0].message.content,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "⚠️ The API response was invalid. This might be due to rate limiting or server issues. Please try again in a moment.",
            },
          ]);
        }
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `❌ Connection Error: Unable to reach AI service after ${maxRetries} attempts. This might be a temporary issue. Please wait a moment and try again. Do not open a ticket as Xivi has no control over this. Error details: ${errorMessage}`,
            },
          ]);
          setIsLoading(false);
          return;
        }
        // Wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      break;
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-4"
                  : "bg-muted mr-4"
              }`}
            >
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
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="Type your message..."
            className="flex-1 bg-muted p-2 rounded-md"
          />
          <Button variant="outline" onClick={clearChat} disabled={isLoading}>
            Clear
          </Button>
          <Button onClick={() => handleQuery()} disabled={isLoading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
