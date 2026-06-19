import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import { NotificationService } from "../services/notification.service.js";

// 🔹 User: Register FCM Token
export const registerToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    // 1. Remove the token if it's already registered to anyone else
    await models.UserDevice.deleteMany({ fcmToken });

    // 2. Remove any existing tokens for this specific user 
    //    (meaning a user only has 1 active token)
    await models.UserDevice.deleteMany({ user: userId });

    // 3. Create the new device record
    await models.UserDevice.create({
      user: userId,
      fcmToken,
    });

    return ResponseHandler.success(res, "Push token registered successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Admin: Send Manual Notification
export const sendManualNotification = async (req, res, next) => {
  try {
    const { title, message, isBroadcast, userIds, imageUrl } = req.body;

    const payload = {
      title,
      message,
      type: "system",
      imageUrl
    };

    if (isBroadcast) {
      await NotificationService.broadcast(payload);
      return ResponseHandler.success(res, "Broadcast notification sent to all users");
    } else {
      await NotificationService.sendToUsers(userIds, payload);
      return ResponseHandler.success(res, `Notification sent to ${userIds.length} users`);
    }
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Admin: List All Sent Notifications (History)
export const getAllNotifications = async (req, res, next) => {
  try {
    // Admins usually want to see what was sent system-wide
    const notifications = await models.Notification.find()
      .populate("user", "name email")
      .sort("-createdAt");

    return ResponseHandler.success(res, "All notifications fetched successfully", notifications);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
