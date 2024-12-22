import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupBareServer } from "./bare";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files including Ultraviolet files
app.use(express.static(path.join(__dirname, "../public")));

// Set up paths for Ultraviolet files
const uvPath = path.join(__dirname, "../node_modules/@titaniumnetwork-dev/ultraviolet/dist");
const publicUvPath = path.join(__dirname, "../public/uv");

// Function to copy UV files
const copyUVFiles = async () => {
  try {
    const fs = await import('fs/promises');
    
    // Ensure the UV directory exists
    await fs.mkdir(publicUvPath, { recursive: true });
    
    // Define files to copy
    const files = ['uv.bundle.js', 'uv.handler.js', 'uv.sw.js'];
    
    // Copy each file, overwriting if it exists
    for (const file of files) {
      const sourcePath = path.join(uvPath, file);
      const destPath = path.join(publicUvPath, file);
      
      try {
        // Check if source file exists
        await fs.access(sourcePath);
        
        // Copy file, overwriting if it exists
        await fs.copyFile(sourcePath, destPath);
        log(`Copied ${file} successfully`);
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          throw new Error(`Source file ${file} not found in ${uvPath}`);
        }
        throw err;
      }
    }
    
    // Copy config file if it doesn't exist
    const configPath = path.join(publicUvPath, 'uv.config.js');
    try {
      await fs.access(configPath);
    } catch {
      await fs.copyFile(
        path.join(__dirname, '../public/uv.config.js'),
        configPath
      );
      log('Created UV config file');
    }
    
    log('Ultraviolet files copied successfully');
  } catch (err) {
    console.error('Error copying Ultraviolet files:', err);
    throw err;
  }
};

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
  try {
    // Copy UV files first
    await copyUVFiles();

    const server = createServer(app);
    
    // Setup bare server first
    setupBareServer(server);
    
    // Setup Vite or static serving
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

    // Start the server on port 5000
    server.listen(5000, "0.0.0.0", () => {
      log(`Server running on port 5000`);
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})().catch(err => {
  console.error('Unhandled error during server initialization:', err);
  process.exit(1);
});
