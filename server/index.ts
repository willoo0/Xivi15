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
    
    // Define files to copy with their source and destination
    const files = [
      { 
        src: 'uv.bundle.js',
        dest: 'uv.bundle.js',
        required: true 
      },
      { 
        src: 'uv.handler.js',
        dest: 'uv.handler.js',
        required: true 
      },
      { 
        src: 'uv.sw.js',
        dest: 'uv.sw.js',
        required: true 
      }
    ];
    
    // Copy each file
    for (const file of files) {
      const sourcePath = path.join(uvPath, file.src);
      const destPath = path.join(publicUvPath, file.dest);
      
      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, destPath);
        log(`Copied ${file.src} to ${file.dest}`);
      } catch (err: any) {
        if (err.code === 'ENOENT' && file.required) {
          throw new Error(`Required UV file ${file.src} not found in ${uvPath}`);
        }
        console.error(`Warning: Could not copy ${file.src}:`, err);
      }
    }
    
    // Create UV config if it doesn't exist
    const configContent = `// This file configures Ultraviolet's proxy settings
self.__uv$config = {
  prefix: '/service/',
  bare: '/bare/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/uv/uv.handler.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/uv/uv.sw.js'
};

// Log when config is loaded for debugging
console.log('UV config loaded:', self.__uv$config);
`;
    
    const configPath = path.join(publicUvPath, 'uv.config.js');
    await fs.writeFile(configPath, configContent, 'utf-8');
    log('UV config file created/updated');
    
    log('Ultraviolet files setup completed');
  } catch (err) {
    console.error('Error setting up Ultraviolet files:', err);
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
