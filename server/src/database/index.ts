import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_CONNECTION;
if (!uri) {
  throw new Error(
    "❌ MONGODB_CONNECTION is not defined in environment variables"
  );
}

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
