import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  // Proxy route for browser
  app.get('/api/proxy', async (req: Request, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).send('URL parameter is required');
      }

      const response = await fetch(url);
      const contentType = response.headers.get('content-type') || 'text/plain';
      
      // Set headers
      res.setHeader('Content-Type', contentType);
      
      // Pipe the response
      response.body?.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching the requested URL');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
