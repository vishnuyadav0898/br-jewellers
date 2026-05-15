import { Router } from "express";

import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import categoryRoutes from "./categories.routes.js";


const router = Router();

router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/user", usersRoutes);
router.use("/api/v1/category", categoryRoutes);

export default router;

