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
      if (!navigator.serviceWorker) {
        throw new Error("Service workers are not supported");
      }

      // Check if service worker is already registered
      const registration = await navigator.serviceWorker.getRegistration("/service/");
      
      if (!registration) {
        await navigator.serviceWorker.register("/uv/uv.sw.js", {
          scope: "/service/",
          updateViaCache: 'none'
        });
        console.log("UV service worker registered");
      } else {
        console.log("UV service worker already registered");
      }
    } catch (err) {
      console.error("Failed to register UV service worker:", err);
      throw new Error("Failed to initialize proxy service");
    }
  };

  useEffect(() => {
    const initUV = async () => {
      try {
        await registerSW();
        // Wait for service worker to be ready
        if (!navigator.serviceWorker.controller) {
          await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => resolve());
          });
        }
        console.log("UV initialized successfully");
      } catch (err) {
        console.error("Failed to initialize UV:", err);
      }
    };

    initUV();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    setLoading(true);

    try {
      // Verify UV is properly initialized
      if (!window.__uv$config) {
        throw new Error("UV proxy not initialized. Please refresh the page.");
      }

      // Format URL if needed
      let processedUrl = url.trim();
      if (!/^https?:\/\//i.test(processedUrl)) {
        processedUrl = `https://${processedUrl}`;
      }

      // Create the proxied URL using UV's encoding
      const encodedUrl = window.__uv$config.encodeUrl(processedUrl);
      
      // Get the current origin for proper proxy routing
      const currentOrigin = window.location.origin;
      
      // Construct the full proxied URL
      const proxiedUrl = `${currentOrigin}${window.__uv$config.prefix}${encodedUrl}`;
      
      console.log('Navigating to proxied URL:', proxiedUrl);
      
      // Use window.location.href for full page navigation
      if (window === window.top) {
        window.location.href = proxiedUrl;
      } else {
        // If we're in a frame, try to break out
        window.top.location.href = proxiedUrl;
      }
    } catch (err) {
      console.error("Failed to load page:", err);
      alert(err instanceof Error ? err.message : "Failed to load page");
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
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.forward()}
            disabled={loading}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              type="text"
              placeholder="Enter URL (e.g. google.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              disabled={loading}
              autoFocus
            />
          </form>
        </div>
      </Card>
    </div>
  );
}
