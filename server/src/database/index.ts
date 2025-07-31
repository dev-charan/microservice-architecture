import mongoose from "mongoose";
import dotenv from "dotenv";
import Logger from "../core/Logger";

dotenv.config();

const MONGO_URI = process.env.MONGODB_CONNECTION;
const DB_NAME = process.env.MONGODB_DB_NAME || "default_db";

if (!MONGO_URI) {
  throw new Error(
    "❌ MONGODB_CONNECTION is not defined in environment variables"
  );
}

// Production-optimized connection options
const options: mongoose.ConnectOptions = {
  dbName: DB_NAME,
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV !== "production",
  retryWrites: true,
};

// Global settings
mongoose.set("strictQuery", true);

const connectDB = async (retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI, options);
      Logger.info("✅ MongoDB Connected Successfully");
      return;
    } catch (err) {
      Logger.error(
        `❌ MongoDB connection attempt ${i + 1}/${retries} failed:`,
        err
      );

      if (i === retries - 1) {
        Logger.error("❌ All connection attempts failed");
        process.exit(1);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// Connection event handlers
mongoose.connection.on("error", (err) => {
  Logger.error("❌ MongoDB runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  Logger.warn("⚠️ MongoDB disconnected");
});

// Graceful shutdown
const shutdown = async () => {
  try {
    await mongoose.connection.close();
    Logger.info("🛑 MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    Logger.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Health check utility
export const isDBHealthy = async (): Promise<boolean> => {
  try {
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

export default connectDB;
