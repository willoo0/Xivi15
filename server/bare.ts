import { createBareServer } from "@tomphttp/bare-server-node";
import { Server } from "http";

export function setupBareServer(server: Server) {
  const bareServer = createBareServer("/bare/", {
    logErrors: true,
    maintainWebSocket: false
  });

  server.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    }
  });

  server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  console.log("Bare server initialized at /bare/");
  return bareServer;
}
