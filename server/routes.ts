import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  // Proxy route for browser
  app.get('/api/proxy', async (req: Request, res) => {
    try {
      const url = req.query.url as string;
      const mode = req.query.mode as string;
      
      if (!url) {
        return res.status(400).send('URL parameter is required');
      }

      const fetchOptions = {
        redirect: 'follow' as const,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      // For HEAD requests, just check URL and get redirects
      if (mode === 'head') {
        const response = await fetch(url, { ...fetchOptions, method: 'HEAD' });
        res.setHeader('x-final-url', response.url);
        return res.status(200).end();
      }

      const response = await fetch(url, fetchOptions);

      // Get content type
      const contentType = response.headers.get('content-type') || '';

      // Set response headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Content-Type', contentType);

      // Rewrite URLs in HTML and CSS content
      if (contentType.includes('text/html') || contentType.includes('text/css')) {
        let text = await response.text();
        const baseUrl = new URL(url).origin;
        
        // Replace relative URLs with absolute ones
        text = text.replace(/(url\(['"]?)(\/?[^)"']+)(['"]?\))/g, (match, start, path, end) => {
          if (path.startsWith('http')) return match;
          const absoluteUrl = new URL(path, baseUrl).toString();
          return `${start}/api/proxy?url=${encodeURIComponent(absoluteUrl)}${end}`;
        });
        
        // For HTML, also handle src and href attributes
        if (contentType.includes('text/html')) {
          text = text.replace(/(src|href)=['"](\/?[^'"]+)['"]/g, (match, attr, path) => {
            if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('#')) return match;
            const absoluteUrl = new URL(path, baseUrl).toString();
            return `${attr}="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
          });
        }
        
        return res.send(text);
      }

      // For other content types, pipe directly
      response.body?.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching the requested URL');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
