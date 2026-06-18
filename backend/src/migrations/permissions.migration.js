import "dotenv/config";
import mongoose from "mongoose";
import Permission from "../models/permission.model.js";
import User from "../models/user.model.js";
import { logger } from "../utils/logger.js";

const PERMISSIONS = [
  { name: "Spare-Inventory-Stock", actions: ["View", "Add", "Update", "Delete", "Spare-In", "Spare-Out", "History"] },
  { name: "Blogs-Social-Media", actions: ["Add", "Update", "Delete"] },
  { name: "Plant-Category", actions: ["View", "Add", "Update", "Delete", "Approval"] },
  { name: "Items", actions: ["View", "Add", "Update", "Delete"] },
  { name: "Product", actions: ["Add", "Update", "Delete"] },
  { name: "Category", actions: ["Add", "Update", "Delete"] },
  { name: "Blog", actions: ["Add", "Update", "Delete"] },
  { name: "Order", actions: ["Update"] },
  { name: "User", actions: ["Add", "Update", "Delete"] },
  { name: "Content", actions: ["Update"] },
  { name: "Permission", actions: ["View", "Assign"] },
  { name: "Coupon", actions: ["View", "Add", "Update", "Delete", "Assign", "Analytics"] }
];

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";

const seedPermissions = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error("Missing env var: MONGODB_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected for seeding permissions");

    // 1. Sync Permission Master List
    for (const perm of PERMISSIONS) {
      await Permission.findOneAndUpdate(
        { name: perm.name },
        { actions: perm.actions },
        { upsert: true, returnDocument: "after" }
      );
    }
    logger.info(`Synced ${PERMISSIONS.length} permission modules to the database.`);

    // 2. Assign all permissions to seed admin
    const admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      const allUserPerms = PERMISSIONS.map((p) => ({
        module: p.name,
        actions: p.actions,
      }));
      
      admin.permissions = allUserPerms;
      await admin.save();
      logger.info(`Assigned all permissions to seed admin: ${ADMIN_EMAIL}`);
    } else {
      logger.warn(`Seed admin (${ADMIN_EMAIL}) not found. Run seed.js first.`);
    }

    await mongoose.disconnect();
    logger.info("Permission seeding completed. Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    logger.error("Permission seed failed:", error);
    process.exit(1);
  }
};

seedPermissions();
