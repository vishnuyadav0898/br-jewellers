import express from "express";

import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { addressValidation } from "../validations/address.validation.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", verifyJWT(JWT_SECRET), validate(addressValidation.create), createAddress);

router.get("/", verifyJWT(JWT_SECRET), getAddresses);

router.patch("/:id", verifyJWT(JWT_SECRET), validate(addressValidation.update), updateAddress);

router.delete("/:id", verifyJWT(JWT_SECRET), deleteAddress);

export default router;
