import mongoose from "mongoose"
import { db } from "../config.js"

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
