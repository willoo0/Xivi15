
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
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

      if (mode === 'head') {
        const response = await fetch(url, { ...fetchOptions, method: 'HEAD' });
        res.setHeader('x-final-url', response.url);
        return res.status(200).end();
      }

      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get('content-type') || '';
      const baseUrl = new URL(url).origin;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Content-Type', contentType);

      if (contentType.includes('text/html') || contentType.includes('text/css')) {
        let text = await response.text();
        
        // Rewrite relative URLs to absolute ones
        text = text.replace(/(?:href|src)=['"](?!http|data:|#)([^'"]+)['"]/g, (match, path) => {
          const absoluteUrl = new URL(path, baseUrl).toString();
          return match.replace(path, `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
        });
        
        // Handle CSS url() references
        text = text.replace(/url\(['"]?(?!data:)([^'")]+)['"]?\)/g, (match, path) => {
          if (path.startsWith('http')) return match;
          const absoluteUrl = new URL(path, baseUrl).toString();
          return `url('/api/proxy?url=${encodeURIComponent(absoluteUrl)}')`;
        });
        
        return res.send(text);
      }

      response.body?.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching the requested URL');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
