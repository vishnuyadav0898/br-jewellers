import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getContent = async (req, res, next) => {
  try {
    const { page } = req.params;
    const content = await models.ContentPage.findOne({ page: page.toLowerCase() });

    if (!content) {
      return ResponseHandler.notFound(res, "Content not found");
    }

    // Return the data directly to make it easier for frontend to consume
    return ResponseHandler.success(res, "Content fetched successfully", content.data);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { page } = req.params;
    const data = req.body;

    const content = await models.ContentPage.findOneAndUpdate(
      { page: page.toLowerCase() },
      { data },
      { upsert: true, returnDocument: "after" }
    );

    return ResponseHandler.success(res, "Content updated successfully", content.data);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
