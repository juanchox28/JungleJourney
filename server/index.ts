import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { config } from "dotenv";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: path.join(process.cwd(), envFile) });

console.log(`🌍 Loading environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Using env file: ${envFile}`);

const app = express();

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://ayahuascapuertonarino.com",
  /\.up\.railway\.app$/,
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

// Enable CORS for frontend domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (allowed) {
      callback(null, true);
    } else {
      // In production, log the rejected origin but still allow it for safety
      console.warn(`CORS: Unexpected origin ${origin} — allowing`);
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Redis client
let sessionStore: any = undefined;
if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('host:port')) {
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  sessionStore = new RedisStore({ client: redisClient });
  console.log("Using Redis for session storage");
} else {
  console.log("Using MemoryStore for session storage");
}

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
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

import { storage } from "./storage";

(async () => {
  await storage.init();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // Only serve static files if SERVE_STATIC is not set to 'false'
    if (process.env.SERVE_STATIC !== 'false') {
      serveStatic(app);
      // fall through to index.html if the file doesn't exist
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(process.cwd(), "dist", "public", "index.html"));
      });
    } else {
      // API-only mode: return 404 for non-API routes
      app.use("*", (_req, res) => {
        res.status(404).json({ error: "Not found - this is an API-only server" });
      });
    }
  }

  // Add a basic health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 8080 to match Dockerfile EXPOSE.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '8080', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
