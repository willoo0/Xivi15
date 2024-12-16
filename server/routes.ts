import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  app.get('/api/proxy', async (req: Request, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).send('URL parameter is required');
      }

      // Prevent proxy loops
      const refererUrl = req.headers.referer;
      if (refererUrl && new URL(refererUrl).pathname === '/api/proxy') {
        return res.redirect(url);
      }

      // Clean and validate URL
      let targetUrl: string;
      try {
        const parsed = new URL(url);
        if (!parsed.protocol.startsWith('http')) {
          parsed.protocol = 'https:';
        }
        // Prevent accessing our own server
        if (parsed.hostname === req.hostname) {
          return res.status(400).send('Cannot proxy requests to this server');
        }
        targetUrl = parsed.toString();
      } catch (e) {
        targetUrl = `https://${url}`;
      }

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const contentType = response.headers.get('content-type') || '';

      // Set response headers
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Final-URL': response.url
      });

      // Handle HTML content
      if (contentType.includes('text/html')) {
        let html = await response.text();
        
        // Add base tag to handle relative URLs
        const baseTag = `<base href="${new URL(response.url).origin}/">`;
        html = html.replace(/<head>/, `<head>${baseTag}`);
        
        // Add navigation handler script
        const script = `
          <script>
            document.addEventListener('click', (e) => {
              const link = e.target.closest('a');
              if (link && link.href) {
                e.preventDefault();
                window.parent.postMessage({ type: 'navigate', url: link.href }, '*');
              }
            });
          </script>
        `;
        html = html.replace('</body>', `${script}</body>`);
        
        return res.send(html);
      }

      // Stream other content types
      response.body.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching URL');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}