import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/user.model.js";
import { logger } from "./utils/logger.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

const seedAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error("Missing env var: MONGODB_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected for seeding");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      logger.info(`Admin user already exists: ${ADMIN_EMAIL}`);
      // Update password and role in case they were corrupted
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      logger.info("Admin password and role have been reset");
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      logger.info(`Admin user created: ${ADMIN_EMAIL}`);
    }

    await mongoose.disconnect();
    logger.info("Seed completed. Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();
