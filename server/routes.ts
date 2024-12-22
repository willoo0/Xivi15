
import type { Express } from "express";
import { createServer, type Server } from "http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import path from "path";
import express from "express";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer();
  const bareServer = createBareServer("/bare/");

  app.use("/uv/", express.static(path.join(process.cwd(), "Ultraviolet/src")));
  app.use("/service/", (req, res, next) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      next();
    }
  });

  httpServer.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  httpServer.on("error", (err) => console.error(err));
  
  return httpServer;
}
