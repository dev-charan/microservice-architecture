import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import userRoutes from "./routes/userRoutes";
import todoRoutes from "./routes/todoRoutes";
import { corsUrl, environment } from "./config";
import Logger from "./core/Logger";
import { isDBHealthy } from "./database/index";
import { ApiError, ErrorType } from "./core/ApiError";
import { InternalError } from "./core/CustomError";

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);

    if (err.type === ErrorType.INTERNAL) {
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
    }
  }
  else{
    Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    Logger.error(err.stack)

    if(environment === "development")
    {
        res.status(500).send({
            message:err.message,stack:err.stack
        })
    }

    ApiError.handle(new InternalError,res)
  }
});


export default app;
