"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_CONNECTION;
if (!uri) {
    throw new Error("❌ MONGODB_CONNECTION is not defined in environment variables");
}
mongoose_1.default
    .connect(uri)
    .then(() => {
    console.log("✅ MongoDB Connected");
})
    .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});
