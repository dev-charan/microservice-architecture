"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDBHealthy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = __importDefault(require("../core/Logger"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_CONNECTION;
const DB_NAME = process.env.MONGODB_DB_NAME || "default_db";
if (!MONGO_URI) {
    throw new Error("❌ MONGODB_CONNECTION is not defined in environment variables");
}
// Production-optimized connection options
const options = {
    dbName: DB_NAME,
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: process.env.NODE_ENV !== "production",
    retryWrites: true,
};
// Global settings
mongoose_1.default.set("strictQuery", true);
const connectDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            yield mongoose_1.default.connect(MONGO_URI, options);
            Logger_1.default.info("✅ MongoDB Connected Successfully");
            return;
        }
        catch (err) {
            Logger_1.default.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, err);
            if (i === retries - 1) {
                Logger_1.default.error("❌ All connection attempts failed");
                process.exit(1);
            }
            // Wait before retry
            yield new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
});
// Connection event handlers
mongoose_1.default.connection.on("error", (err) => {
    Logger_1.default.error("❌ MongoDB runtime error:", err);
});
mongoose_1.default.connection.on("disconnected", () => {
    Logger_1.default.warn("⚠️ MongoDB disconnected");
});
// Graceful shutdown
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        Logger_1.default.info("🛑 MongoDB connection closed");
        process.exit(0);
    }
    catch (err) {
        Logger_1.default.error("❌ Error during shutdown:", err);
        process.exit(1);
    }
});
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
// Health check utility
const isDBHealthy = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return mongoose_1.default.connection.readyState === 1;
    }
    catch (_a) {
        return false;
    }
});
exports.isDBHealthy = isDBHealthy;
exports.default = connectDB;
