import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  app.use("/ric", async (req, res, next) => {
    if (req.url === "/") {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Xivi Surf</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="/proxy-styles.css">
        </head>
        <body>
          <div class="stars"></div>
          <div class="container">
            <h1>Xivi Surf</h1>
            <form id="form">
              <input type="text" id="url" placeholder="Enter URL or search with DuckDuckGo" required>
              <button type="submit">Go</button>
            </form>
            <p>Seamless, secure browsing.</p>
            <p>Powered by a custum version of XiviProx</p>
          </div>
          <script>
            document.getElementById('form').onsubmit = (e) => {
              e.preventDefault();
              const input = document.getElementById('url').value;
              const isUrl = input.includes('.') && !input.includes(' ');
              const url = isUrl ? input : 'https://duckduckgo.com/?q=' + encodeURIComponent(input);
              window.location.href = '/ric/proxy/' + encodeURIComponent(url);
            };
          </script>
        </body>
        </html>
      `);
    } else {
      const path = req.url;
      if (!path || path === "/") return;

      try {
        const urlMatch = path.match(/^\/proxy\/(.+)$/);
        if (!urlMatch) {
          throw new Error("Invalid URL format");
        }

        let url = decodeURIComponent(urlMatch[1]);
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }

        const targetUrl = new URL(url);
        if (targetUrl.hostname === req.hostname) {
          return res.redirect(targetUrl.pathname + targetUrl.search);
        }

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        const contentType = response.headers.get("content-type") || "";
        res.set("Content-Type", contentType);

        if (
          contentType.startsWith("image/") ||
          contentType.includes("application/octet-stream")
        ) {
          return response.body.pipe(res);
        }

        if (contentType.includes("text/html")) {
          let content = await response.text();
          const baseUrl = new URL(url).origin;

          const proxyUrl = (originalUrl: string) => {
            try {
              if (
                !originalUrl ||
                originalUrl.startsWith("javascript:") ||
                originalUrl.startsWith("#")
              ) {
                return originalUrl;
              }
              const fullUrl = originalUrl.startsWith("http")
                ? originalUrl
                : new URL(originalUrl, baseUrl).toString();
              return `/ric/proxy/${encodeURIComponent(fullUrl)}`;
            } catch {
              return originalUrl;
            }
          };

          content = content.replace(
            /(?:href|src|action)="([^"]*)"/g,
            (match, url) => {
              return match.replace(url, proxyUrl(url));
            },
          );

          const script = `
            <script>
              (function() {
                // Intercept all clicks
                document.addEventListener('click', function(e) {
                  const link = e.target.closest('a');
                  if (link) {
                    e.preventDefault();
                    const url = link.href;
                    if (!url.startsWith('javascript:') && !url.startsWith('#')) {
                      const fullUrl = new URL(url, window.location.href).toString();
                      window.location.href = '/ric/proxy/' + encodeURIComponent(fullUrl);
                    }
                  }
                });

                // Handle form submissions
                document.addEventListener('submit', function(e) {
                  const form = e.target;
                  e.preventDefault();
                  const formData = new FormData(form);
                  const queryString = new URLSearchParams(formData).toString();
                  const baseUrl = new URL(form.action || window.location.href).toString();
                  const fullUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + queryString;
                  window.location.href = '/ric/proxy/' + encodeURIComponent(fullUrl);
                });

                // Override window.location assignments
                const _historyPush = history.pushState;
                history.pushState = function(state, unused, url) {
                  if (url && !url.startsWith('/ric/proxy/')) {
                    const fullUrl = new URL(url, window.location.href).toString();
                    url = '/ric/proxy/' + encodeURIComponent(fullUrl);
                  }
                  return _historyPush.call(this, state, unused, url);
                };
              })();
            </script>
          `;

          content = content.replace("</body>", script + "</body>");
          res.send(content);
        } else {
          response.body.pipe(res);
        }
      } catch (error) {
        res.status(500).send(`Proxy Error: ${error.message}`);
      }
    }
  });
  const PIN = "41289473";

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

      const refererUrl = req.headers.referer;
      if (refererUrl && new URL(refererUrl).pathname === "/api/proxy") {
        return res.redirect(url);
      }

      let targetUrl: string;
      try {
        const parsed = new URL(url);
        if (!parsed.protocol.startsWith("http")) {
          parsed.protocol = "https:";
        }
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

      res.set({
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Final-URL": response.url,
      });

      if (contentType.includes("text/html")) {
        let html = await response.text();

        const baseTag = `<base href="${new URL(response.url).origin}/">`;
        html = html.replace(/<head>/, `<head>${baseTag}`);

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
