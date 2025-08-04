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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const Logger_1 = __importDefault(require("./core/Logger"));
const database_1 = __importDefault(require("./database"));
const config_1 = require("./config");
const PORT = config_1.port !== null && config_1.port !== void 0 ? config_1.port : 8080;
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
    setTimeout(() => {
        Logger_1.default.error("⚠️ Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.default)();
        const server = app_1.default.listen(PORT, () => {
            Logger_1.default.info(`🚀 Server running on port ${PORT}`);
            Logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
        });
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
        process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
        return server;
    }
    catch (error) {
        Logger_1.default.error("❌ Failed to start server:", error);
        process.exit(1);
    }
});
// Global error handlers
process.on("uncaughtException", (err) => {
    Logger_1.default.error("❌ Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    Logger_1.default.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
// Run it
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
}))();
