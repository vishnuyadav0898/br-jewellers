import express from "express";
import multer from "multer";
import { uploadImage, deleteImage } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit before compression
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

router.use(verifyJWT(JWT_SECRET));

router.post("/image", upload.single("image"), uploadImage);
router.delete("/image", deleteImage);

export default router;
