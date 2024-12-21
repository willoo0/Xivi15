
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import Ultraviolet from '@titaniumnetwork-dev/ultraviolet';

export function registerRoutes(app: Express): Server {
  const uv = new Ultraviolet({
    prefix: '/service/',
    bare: '/bare/',
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
  });

  app.use('/uv', uv.createServer());
  return createServer(app);
}
