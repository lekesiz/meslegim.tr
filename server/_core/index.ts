import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeCronJobs } from "../services/cronJobs";
import { registerStripeWebhook } from "../stripeWebhook";
import { registerEmailTrackingRoutes } from "../emailTracking";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { initSentry, setupSentryErrorHandler } from "../utils/sentry";
import logger, { logInfo, logError } from "../utils/logger";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - Required for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Initialize Sentry (error tracking)
  initSentry(app);

  // Log server startup
  logInfo('Server initialization started');

  // Security middleware
  // Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://manus-analytics.com", "https://js.stripe.com"], // unsafe-eval needed for Vite HMR in dev
          frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:", "https://manus-analytics.com", "https://api.stripe.com"],
        },
      },
      crossOriginEmbedderPolicy: false, // Needed for some external resources
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: process.env.NODE_ENV === "production" 
        ? ["https://meslegim-tr.manus.space", "https://www.meslegim.tr"] 
        : true,
      credentials: true,
    })
  );

  // Rate limiting - Global (relaxed for development)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 200 : 2000, // 2000 for dev, 200 for prod
    message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip static assets and health checks
      if (req.path.startsWith("/client") || req.path === "/health") return true;
      // Skip rate limiting in development
      if (process.env.NODE_ENV !== "production") return true;
      return false;
    },
  });
  app.use(globalLimiter);

  // Rate limiting - Strict for auth endpoints (only in production)
  if (process.env.NODE_ENV === "production") {
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20, // 20 login attempts per 15 minutes
      message: "Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.",
      skipSuccessfulRequests: true,
    });
    app.use("/api/oauth", authLimiter);
    // Also rate limit tRPC auth mutations (login, register)
    app.use("/api/trpc/auth.login", authLimiter);
    app.use("/api/trpc/auth.register", authLimiter);
    app.use("/api/trpc/auth.requestPasswordReset", authLimiter);
  }

  // Stripe webhook MUST be registered BEFORE body parsers (needs raw body)
  registerStripeWebhook(app);

  // Email tracking routes (pixel + click redirect) - before body parsers for performance
  registerEmailTrackingRoutes(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Sentry error handler - Must be after all routes
  setupSentryErrorHandler(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    const message = `Server running on http://localhost:${port}/`;
    console.log(message);
    logInfo(message, { port });
    // Initialize cron jobs after server starts
    initializeCronJobs();
  });
}

startServer().catch(console.error);
