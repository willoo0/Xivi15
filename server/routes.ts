import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";
import fetch from 'node-fetch';

export function registerRoutes(app: Express): Server {
  app.use('/ric', async (req, res, next) => {
    if (req.url === '/') {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Proxy</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
            .container { text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            input { padding: 8px; width: 300px; margin-right: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <form id="form">
              <input type="text" id="url" placeholder="Enter URL" required>
              <button type="submit">Go</button>
            </form>
          </div>
          <script>
            document.getElementById('form').onsubmit = (e) => {
              e.preventDefault();
              const url = document.getElementById('url').value;
              window.location.href = '/ric/proxy/' + encodeURIComponent(url);
            };
          </script>
        </body>
        </html>
      `);
    } else {
      const path = req.url;
      if (!path || path === '/') return;

      try {
        // Extract and process the URL
        const urlMatch = path.match(/^\/proxy\/(.+)$/);
        if (!urlMatch) {
          throw new Error('Invalid URL format');
        }

        let url = decodeURIComponent(urlMatch[1]);
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        // Get stored cookies for this URL
        const cookies = req.headers['x-stored-cookies'] || '';

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookies
          }
        });

        // Get cookies from response
        const setCookies = response.headers.raw()['set-cookie'] || [];
        if (setCookies.length > 0) {
          res.setHeader('x-set-cookies', JSON.stringify(setCookies));
        }

        const contentType = response.headers.get('content-type') || '';
        res.set('Content-Type', contentType);

        // Handle images and binary content
        if (contentType.startsWith('image/') || contentType.includes('application/octet-stream')) {
          return response.body.pipe(res);
        }

        if (contentType.includes('text/html')) {
          let content = await response.text();
          
          // Rewrite URLs in HTML
          content = content.replace(/href="([^"]*)"/g, (match, p1) => {
            if (p1.startsWith('http')) {
              return `href="/ric/proxy/${encodeURIComponent(p1)}"`;
            }
            const baseUrl = new URL(url).origin;
            const fullUrl = new URL(p1, baseUrl).toString();
            return `href="/ric/proxy/${encodeURIComponent(fullUrl)}"`;
          });

          content = content.replace(/action="([^"]*)"/g, (match, p1) => {
            if (p1.startsWith('http')) {
              return `action="/ric/proxy/${encodeURIComponent(p1)}"`;
            }
            const baseUrl = new URL(url).origin;
            const fullUrl = new URL(p1, baseUrl).toString();
            return `action="/ric/proxy/${encodeURIComponent(fullUrl)}"`;
          });

          content = content.replace(/src="([^"]*)"/g, (match, p1) => {
            if (p1.startsWith('http')) {
              return `src="/ric/proxy/${encodeURIComponent(p1)}"`;
            }
            const baseUrl = new URL(url).origin;
            const fullUrl = new URL(p1, baseUrl).toString();
            return `src="/ric/proxy/${encodeURIComponent(fullUrl)}"`;
          });

          res.send(content);
        } else {
          response.body.pipe(res);
        }
      } catch (error) {
        res.status(500).send(`Proxy Error: ${error.message}`);
      }
    }
  });
  const PIN = "ea23492"; // You can change this to your desired PIN

  app.post("/api/verify-pin", async (req: Request, res) => {
    const { pin } = req.body;
    if (pin === PIN) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });

  app.get("/api/proxy", async (req: Request, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).send("URL parameter is required");
      }

      // Prevent proxy loops
      const refererUrl = req.headers.referer;
      if (refererUrl && new URL(refererUrl).pathname === "/api/proxy") {
        return res.redirect(url);
      }

      // Clean and validate URL
      let targetUrl: string;
      try {
        const parsed = new URL(url);
        if (!parsed.protocol.startsWith("http")) {
          parsed.protocol = "https:";
        }
        // Prevent accessing our own server
        if (parsed.hostname === req.hostname) {
          return res.status(400).send("Cannot proxy requests to this server");
        }
        targetUrl = parsed.toString();
      } catch (e) {
        targetUrl = `https://${url}`;
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      // Set response headers
      res.set({
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Final-URL": response.url,
      });

      // Handle HTML content
      if (contentType.includes("text/html")) {
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
        html = html.replace("</body>", `${script}</body>`);

        return res.send(html);
      }

      // Stream other content types
      response.body.pipe(res);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send("Error fetching URL");
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messages = req.body.messages;
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: messages,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          if (error.includes("invalid_api_key")) {
            console.log("Used API key:", process.env.GROQ_API_KEY);
          }
          throw new Error(`Groq API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        res.json(data);
      } catch (error) {
        console.error("Chat API error:", error);
        res.status(500).json({
          error: error.message || "Internal server error",
          details: error.stack,
        });
      }
    } catch (outerError) {
      console.error("Route handler error:", outerError);
      res.status(500).json({
        error: "Internal server error",
        details: outerError.message,
      });
    }
  });

  app.get("/api/music/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`,
      );
      const data = await response.json();

      res.json(
        data.data.map((track: any) => ({
          videoId: track.id,
          title: track.title,
          artist: track.artist.name,
          url: track.preview,
        })),
      );
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  });

  app.get("/api/music/stream", async (req, res) => {
    try {
      const videoId = req.query.videoId as string;
      const response = await fetch(`https://api.deezer.com/track/${videoId}`);
      const data = await response.json();
      res.json({ url: data.preview });
    } catch (error) {
      console.error("Stream error:", error);
      res.status(500).json({ error: "Failed to get song URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
