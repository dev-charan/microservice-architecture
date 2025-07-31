import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB, { isDBHealthy } from "./database/index";
import userRoutes from "./routes/userRoutes";
import todoRoutes from "./routes/todoRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import { corsUrl, port } from "./config";
import Logger from "./core/Logger";

dotenv.config();

const PORT = port ?? 8080;
const app = express();

// Security middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: corsUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/todo", todoRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealthy = await isDBHealthy();
    const status = dbHealthy ? "✅ UP" : "❌ DOWN";

    res.status(dbHealthy ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        connected: dbHealthy,
        readyState: mongoose.connection.readyState,
      },
    });
  } catch (error) {
    Logger.error("Health check failed:", error);
    res.status(503).json({
      status: "❌ DOWN",
      error: "Health check failed",
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string, serverInstance: any) => {
  Logger.info(`📡 Received ${signal}, shutting down gracefully...`);

  if (serverInstance) {
    serverInstance.close(async (err: any) => {
      if (err) {
        Logger.error("❌ Error during server shutdown:", err);
        process.exit(1);
      }

      try {
        await mongoose.connection.close();
        Logger.info("🛑 Server and database connections closed");
        process.exit(0);
      } catch (error) {
        Logger.error("❌ Error closing database:", error);
        process.exit(1);
      }
    });
  }

  // Force close after 10 seconds
  setTimeout(() => {
    Logger.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start the server
    const server = app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      Logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Setup graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));

    return server;
  } catch (error) {
    Logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  Logger.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Initialize server
let server: any;

(async () => {
  server = await startServer();
})();

export { app };
