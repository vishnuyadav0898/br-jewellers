import express from "express";
import { getContent, updateContent } from "../controllers/content.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { contentValidation } from "../validations/content.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/:page", getContent);

router.patch(
  "/:page",
  verifyJWT(JWT_SECRET),
  checkPermission("Content", "Update"),
  validate(contentValidation.update),
  updateContent
);

export default router;
