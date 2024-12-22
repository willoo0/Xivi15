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
      // First check if service worker is already registered
      const registration = await navigator.serviceWorker.getRegistration("/service/");
      
      if (!registration) {
        await navigator.serviceWorker.register("/uv/uv.sw.js", {
          scope: "/service/",
          updateViaCache: 'none'
        });
        console.log("Service worker registered successfully");
      } else {
        console.log("Service worker already registered");
      }
    } catch (err) {
      console.error("Failed to register service worker:", err);
      throw new Error("Failed to initialize proxy service. Please refresh the page.");
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
      
      // Format URL if needed
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`;
      }

      // Ensure UV is properly initialized before proxying
      if (!window.__uv$config || !window.Ultraviolet) {
        throw new Error("Ultraviolet not initialized. Please refresh the page.");
      }
      
      // Use UV to encode and proxy the URL
      const encodedUrl = window.__uv$config.encodeUrl(formattedUrl);
      const proxiedUrl = window.__uv$config.prefix + encodedUrl;
      
      // Use the current window for navigation
      window.location.href = proxiedUrl;
    } catch (err) {
      console.error("Failed to load page:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.forward()}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              type="text"
              placeholder="Enter URL (e.g. google.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              autoFocus
            />
          </form>
        </div>
      </Card>
    </div>
  );
}