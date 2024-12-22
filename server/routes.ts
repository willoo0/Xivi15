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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
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
            (function() {
              // Handle all link clicks
              document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.href) {
                  e.preventDefault();
                  const targetHref = link.href;
                  window.location.href = '/api/proxy?url=' + encodeURIComponent(targetHref);
                }
              });

              // Handle form submissions
              document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.method.toLowerCase() === 'get') {
                  e.preventDefault();
                  const formData = new FormData(form);
                  const queryString = new URLSearchParams(formData).toString();
                  const url = form.action + (form.action.includes('?') ? '&' : '?') + queryString;
                  window.parent.postMessage({ type: 'navigate', url }, '*');
                }
              });

              // Handle base target changes
              const bases = document.getElementsByTagName('base');
              for (const base of bases) {
                base.target = '_self';
              }

              // Override window.open
              const originalOpen = window.open;
              window.open = function(url) {
                if (url) {
                  window.parent.postMessage({ type: 'navigate', url }, '*');
                }
                return null;
              };
            })();
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

  app.get('/api/music/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      res.json(data.data.map((track: any) => ({
        videoId: track.id,
        title: track.title,
        artist: track.artist.name,
        url: track.preview
      })));
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search songs' });
    }
  });

  app.get('/api/music/stream', async (req, res) => {
    try {
      const videoId = req.query.videoId as string;
      const response = await fetch(`https://api.deezer.com/track/${videoId}`);
      const data = await response.json();
      res.json({ url: data.preview });
    } catch (error) {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Failed to get song URL' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}