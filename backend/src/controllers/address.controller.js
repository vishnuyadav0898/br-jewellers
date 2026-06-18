import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createAddress = async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.user.id };

    // If isDefault is true, unset isDefault on all other addresses for this user
    if (data.isDefault) {
      await models.Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await models.Address.create(data);

    return ResponseHandler.created(res, "Address created successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await models.Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return ResponseHandler.success(
      res,
      "Addresses fetched successfully",
      addresses
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await models.Address.findOne({ _id: id, user: req.user.id });

    if (!address) {
      return ResponseHandler.notFound(res, "Address not found");
    }

    // If isDefault is being set to true, unset on others first
    if (req.body.isDefault) {
      await models.Address.updateMany(
        { user: req.user.id, _id: { $ne: id }, isDefault: true },
        { isDefault: false }
      );
    }

    const updatedAddress = await models.Address.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    return ResponseHandler.success(
      res,
      "Address updated successfully"
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await models.Address.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!address) {
      return ResponseHandler.notFound(res, "Address not found");
    }

    return ResponseHandler.success(res, "Address deleted successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
