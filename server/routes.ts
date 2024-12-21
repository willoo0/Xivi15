
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { Ultraviolet } from '@titaniumnetwork-dev/ultraviolet';

export function registerRoutes(app: Express): Server {
  const uv = new Ultraviolet();

  app.use('/uv', (req, res) => {
    const url = Buffer.from(req.path.slice(1), 'base64').toString();
    uv.fetch(url, {
      headers: req.headers as any,
      method: req.method,
      body: req.body
    }).then(response => {
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      return response.body.pipe(res);
    }).catch(error => {
      console.error('Proxy error:', error);
      res.status(500).send('Error fetching URL');
    });
  });

  return createServer(app);
}
