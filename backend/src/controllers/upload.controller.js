import ResponseHandler from "../utils/responseHandler.js";
import { StorageService } from "../services/storage.service.js";

// 🔹 Upload Single Image
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return ResponseHandler.badRequest(res, "No image file provided");
    }

    // Pass the buffer and original name to StorageService
    const publicUrl = await StorageService.uploadImage(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      success: true,
      message: "Image uploaded and compressed successfully",
      data: {
        url: publicUrl
      }
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Delete Image
export const deleteImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return ResponseHandler.badRequest(res, "Image URL is required for deletion");
    }

    await StorageService.deleteFile(url);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
