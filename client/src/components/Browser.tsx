import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    __uv$config: {
      prefix: string;
      bare: string;
      encodeUrl: (url: string) => string;
      decodeUrl: (url: string) => string;
      handler: string;
      bundle: string;
      config: string;
      sw: string;
    };
    Ultraviolet: {
      codec: {
        xor: {
          encode: (url: string) => string;
          decode: (url: string) => string;
        };
      };
    };
  }
}

export function Browser() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const registerSW = async () => {
    try {
      await navigator.serviceWorker.register("/uv.sw.js", {
        scope: "/service/",
      });
    } catch (err) {
      console.error("Failed to register service worker:", err);
    }
  };

  useEffect(() => {
    registerSW().catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!window.__uv$config) {
        throw new Error("Ultraviolet config not loaded");
      }
      
      const encodedUrl = window.__uv$config.encodeUrl(url);
      const proxiedUrl = window.__uv$config.prefix + encodedUrl;
      
      const frame = document.getElementById('browser-frame') as HTMLIFrameElement;
      if (frame) {
        frame.src = proxiedUrl;
      }
    } catch (err) {
      console.error("Failed to load page:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </form>
        </div>
        <div className="w-full h-[calc(100vh-12rem)] bg-white rounded-lg">
          <iframe
            id="browser-frame"
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms"
            title="Browser Frame"
          />
        </div>
      </Card>
    </div>
  );
}
