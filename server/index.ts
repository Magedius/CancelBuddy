#!/usr/bin/env node

console.log("=== CONTAINER STARTUP DEBUG ===");
console.log("Current time:", new Date().toISOString());
console.log("Working directory:", process.cwd());
console.log("Node version:", process.version);
console.log("Platform:", process.platform, process.arch);
console.log("Environment:", process.env.NODE_ENV);
console.log("Port env:", process.env.PORT);

// Lisää process error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log("🚀 Starting imports...");
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// Health check endpoint for Google Cloud Run monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'CancelBuddy',
    version: process.env.K_REVISION || 'unknown'
  });
});

// Readiness check - more detailed than health check  
app.get('/ready', async (_req, res) => {
  try {
    // Check if storage is accessible
    await storage.getUserSession('health-check');
    res.status(200).json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        storage: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not-ready',
      timestamp: new Date().toISOString(),
      error: 'Storage not accessible'
    });
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error but don't crash the container (Cloud Run best practice)
    console.error(`Error ${status}:`, message, err.stack);
    
    res.status(status).json({ message });
    // Don't throw - handle gracefully to prevent container crashes
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Google Cloud Run injects PORT env variable. Default to 8080 if not specified.
  // Container MUST listen on 0.0.0.0, NOT 127.0.0.1 as per Cloud Run contract.
  const port = parseInt(process.env.PORT || '8080', 10);
  
  server.listen(port, '0.0.0.0', () => {
    log(`🚀 CancelBuddy serving on port ${port}`);
    log(`✅ Listening on all interfaces (0.0.0.0) as required by Cloud Run`);
  });
})();
