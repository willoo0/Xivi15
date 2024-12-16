
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  app.get('/api/proxy', async (req: Request, res) => {
    try {
      let url = req.query.url as string;
      if (!url) {
        return res.status(400).send('URL parameter is required');
      }

      // Prevent proxy loops and recursive loading
      if (req.headers.referer?.includes('/api/proxy')) {
        const targetUrl = new URL(url);
        // Only proxy the main request, not subsequent resources
        if (targetUrl.hostname === req.hostname) {
          return res.redirect(url);
        }
      }

      try {
        // Clean and validate URL
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
          parsedUrl.protocol = 'https:';
        }
        url = parsedUrl.toString();
      } catch (e) {
        if (!url.match(/^https?:\/\//)) {
          url = 'https://' + url;
        }
      }

      const fetchOptions = {
        redirect: 'follow' as const,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get('content-type') || '';
      const baseUrl = new URL(response.url).origin;

      // Set CORS and content type headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-Final-Url', response.url);

      // Handle HTML and CSS content
      if (contentType.includes('text/html') || contentType.includes('text/css')) {
        let text = await response.text();
        
        if (contentType.includes('text/html')) {
          // Inject script to handle link clicks
          const linkHandlerScript = `
            <script>
              document.addEventListener('click', function(e) {
                var link = e.target.closest('a');
                if (link) {
                  e.preventDefault();
                  var href = link.href;
                  if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                    window.parent.postMessage({ type: 'navigate', url: href }, '*');
                  }
                }
              }, true);
              
              // Handle form submissions
              document.addEventListener('submit', function(e) {
                e.preventDefault();
                var form = e.target;
                var url = form.action;
                var method = form.method.toUpperCase();
                
                if (method === 'GET') {
                  var formData = new FormData(form);
                  var params = new URLSearchParams(formData);
                  url = url + (url.includes('?') ? '&' : '?') + params.toString();
                  window.parent.postMessage({ type: 'navigate', url: url }, '*');
                }
              }, true);
            </script>
          `;
          
          // Insert script before </body> or at the end if no </body>
          text = text.replace('</body>', linkHandlerScript + '</body>');
          if (!text.includes('</body>')) {
            text += linkHandlerScript;
          }
        }
        
        // Rewrite relative URLs to absolute ones
        text = text.replace(/(?:href|src)=['"](?!http|data:|#|javascript:|mailto:)([^'"]+)['"]/g, (match, path) => {
          try {
            const absoluteUrl = new URL(path, response.url).toString();
            return match.replace(path, `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch {
            return match;
          }
        });
        
        // Handle CSS url() references
        text = text.replace(/url\(['"]?(?!data:|https?:|#)([^'")]+)['"]?\)/g, (match, path) => {
          try {
            const absoluteUrl = new URL(path, response.url).toString();
            return `url('/api/proxy?url=${encodeURIComponent(absoluteUrl)}')`;
          } catch {
            return match;
          }
        });
        
        return res.send(text);
      }

      // Stream other content types directly
      response.body?.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching the requested URL');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
