import mongoose from "mongoose";

import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    const err = new Error("Missing env var: MONGODB_URI");
    err.status = 500;
    throw err;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
