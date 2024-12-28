import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerRoutes(app: express.Express) {
  // Create bare server instance
  const bareServer = createBareServer('/bare/');

  // Serve UV files from public directory
  app.use('/uv/', express.static(path.join(__dirname, '../public/uv')));

  // Handle bare server requests
  app.use((req, res, next) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      next();
    }
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error');
  });

  return app;
}