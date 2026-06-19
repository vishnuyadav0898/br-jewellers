import { Router } from "express";

import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import categoryRoutes from "./categories.routes.js";
import productRoutes from "./products.routes.js";
import cartRoutes from "./cart.routes.js";
import addressRoutes from "./address.routes.js";
import orderRoutes from "./orders.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import blogsRoutes from "./blogs.routes.js";
import contentRoutes from "./content.routes.js";
import permissionRoutes from "./permission.routes.js";
import couponRoutes from "./coupon.routes.js";
import returnRoutes from "./return.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = Router();

router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/user", usersRoutes);
router.use("/api/v1/category", categoryRoutes);
router.use("/api/v1/product", productRoutes);
router.use("/api/v1/cart", cartRoutes);
router.use("/api/v1/address", addressRoutes);
router.use("/api/v1/orders", orderRoutes);
router.use("/api/v1/wishlist", wishlistRoutes);
router.use("/api/v1/blogs", blogsRoutes);
router.use("/api/v1/content", contentRoutes);
router.use("/api/v1/permissions", permissionRoutes);
router.use("/api/v1/coupons", couponRoutes);
router.use("/api/v1/returns", returnRoutes);
router.use("/api/v1/notifications", notificationRoutes);

export default router;
