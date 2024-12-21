
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  const server = createServer(app);
  const bareServer = createBareServer("/bare/");

  app.use(express.static(path.join(process.cwd(), "public")));
  app.use("/uv/", express.static(uvPath));
  app.use("/service/", (req, res) => {
    try {
      const url = atob(req.path.slice(1));
      res.redirect(307, `/uv/service/${url}`);
    } catch {
      res.status(400).send('Invalid URL');
    }
  });

  server.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  return server;
}
