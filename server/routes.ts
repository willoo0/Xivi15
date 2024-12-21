import type { Express } from "express";
import { createServer, type Server } from "http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer();
  const bareServer = createBareServer("/bare/");

  app.use(express.static(path.join(process.cwd(), "public")));
  app.use("/uv/", express.static(uvPath));

  const uvHtml = path.join(uvPath, "uv.html");
  app.get("/service/uv/", (req, res) => {
    res.sendFile(uvHtml);
  });

  app.use("/uv/service/", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      const url = req.url.slice(1);
      try {
        const decodedUrl = atob(url);
        res.redirect(`/service/${decodedUrl}`);
      } catch {
        res.status(400).send('Invalid URL encoding');
      }
    }
  });

  httpServer.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  httpServer.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  return httpServer;
}