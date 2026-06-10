import { Router } from "express";

import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import categoryRoutes from "./categories.routes.js";
import productRoutes from "./products.routes.js";
import cartRoutes from "./cart.routes.js";
import addressRoutes from "./address.routes.js";
import orderRoutes from "./orders.routes.js";

const router = Router();

router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/user", usersRoutes);
router.use("/api/v1/category", categoryRoutes);
router.use("/api/v1/product", productRoutes);
router.use("/api/v1/cart", cartRoutes);
router.use("/api/v1/address", addressRoutes);
router.use("/api/v1/orders", orderRoutes);

export default router;
