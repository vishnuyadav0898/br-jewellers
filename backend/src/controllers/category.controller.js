import { PRODUCT_CATEGORIES } from "../utils/categoryData.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getCategories = async (req, res, next) => {
  try {
    return ResponseHandler.success(
      res,
      "Categories fetched",
      PRODUCT_CATEGORIES.map((category) => category.name),
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
