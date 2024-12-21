import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = createServer(app);
  
  // Setup Vite or static serving first
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Register API routes after vite setup
  registerRoutes(app);

  // Error handling middleware should be last
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error(err);
  });

  // Try to find an available port starting from 5000
  const findAvailablePort = (startPort: number, maxAttempts: number = 10): Promise<number> => {
    return new Promise((resolve, reject) => {
      const tryPort = (port: number, attempts: number) => {
        const testServer = createServer();
        testServer.once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            if (attempts >= maxAttempts) {
              reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
            } else {
              tryPort(port + 1, attempts + 1);
            }
          } else {
            reject(err);
          }
        });
        
        testServer.once('listening', () => {
          testServer.close(() => resolve(port));
        });
        
        testServer.listen(port, '0.0.0.0');
      };
      
      tryPort(startPort, 1);
    });
  };

  try {
    const port = await findAvailablePort(5000);
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
