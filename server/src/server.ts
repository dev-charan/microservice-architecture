import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import Logger from "./core/Logger";
import connectDB from "./database";
import { port } from "./config";

const PORT = port ?? 8080;

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

  setTimeout(() => {
    Logger.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      Logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));

    return server;
  } catch (error) {
    Logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Global error handlers
process.on("uncaughtException", (err) => {
  Logger.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run it
(async () => {
  await startServer();
})();
