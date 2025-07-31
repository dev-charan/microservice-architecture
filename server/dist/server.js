"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importStar(require("./database/index"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const todoRoutes_1 = __importDefault(require("./routes/todoRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const config_1 = require("./config");
const Logger_1 = __importDefault(require("./core/Logger"));
dotenv_1.default.config();
const PORT = config_1.port !== null && config_1.port !== void 0 ? config_1.port : 8080;
const app = (0, express_1.default)();
exports.app = app;
// Security middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.corsUrl,
    credentials: true,
    optionsSuccessStatus: 200,
}));
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/todo", todoRoutes_1.default);
// Health check endpoint
app.get("/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbHealthy = yield (0, index_1.isDBHealthy)();
        const status = dbHealthy ? "✅ UP" : "❌ DOWN";
        res.status(dbHealthy ? 200 : 503).json({
            status,
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            database: {
                connected: dbHealthy,
                readyState: mongoose_1.default.connection.readyState,
            },
        });
    }
    catch (error) {
        Logger_1.default.error("Health check failed:", error);
        res.status(503).json({
            status: "❌ DOWN",
            error: "Health check failed",
        });
    }
}));
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
    });
});
// Error handling middleware (must be last)
app.use(errorMiddleware_1.errorHandler);
// Graceful shutdown
const gracefulShutdown = (signal, serverInstance) => __awaiter(void 0, void 0, void 0, function* () {
    Logger_1.default.info(`📡 Received ${signal}, shutting down gracefully...`);
    if (serverInstance) {
        serverInstance.close((err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                Logger_1.default.error("❌ Error during server shutdown:", err);
                process.exit(1);
            }
            try {
                yield mongoose_1.default.connection.close();
                Logger_1.default.info("🛑 Server and database connections closed");
                process.exit(0);
            }
            catch (error) {
                Logger_1.default.error("❌ Error closing database:", error);
                process.exit(1);
            }
        }));
    }
    // Force close after 10 seconds
    setTimeout(() => {
        Logger_1.default.error("⚠️ Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
});
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to database first
        yield (0, index_1.default)();
        // Start the server
        const server = app.listen(PORT, () => {
            Logger_1.default.info(`🚀 Server running on port ${PORT}`);
            Logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
        });
        // Setup graceful shutdown
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
        process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
        return server;
    }
    catch (error) {
        Logger_1.default.error("❌ Failed to start server:", error);
        process.exit(1);
    }
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    Logger_1.default.error("❌ Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    Logger_1.default.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
// Initialize server
let server;
(() => __awaiter(void 0, void 0, void 0, function* () {
    server = yield startServer();
}))();
