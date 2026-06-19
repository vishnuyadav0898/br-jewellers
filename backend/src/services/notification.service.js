import admin from "firebase-admin";
import models from "../models/index.js";
import { logger } from "../utils/logger.js";

// Initialize Firebase Admin (Only if credentials exist)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info("Firebase Admin initialized successfully.");
  } else {
    logger.warn("FIREBASE_SERVICE_ACCOUNT environment variable is missing. Push notifications will be mocked.");
  }
} catch (error) {
  logger.error(`Failed to initialize Firebase Admin: ${error.message}`);
}

export const NotificationService = {
  /**
   * Internal function to send push via FCM
   */
  async _dispatchFCM(tokens, payload) {
    if (!tokens || tokens.length === 0) return;

    if (!admin.apps.length) {
      logger.info(`[MOCK PUSH] Would send FCM to ${tokens.length} devices. Title: "${payload.notification.title}"`);
      return;
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: payload.notification.title,
          body: payload.notification.body,
          imageUrl: payload.notification.imageUrl || undefined,
        },
        data: payload.data || {},
      });
      
      logger.info(`FCM Multicast Response: ${response.successCount} successes, ${response.failureCount} failures.`);
    } catch (error) {
      logger.error(`FCM Dispatch Error: ${error.message}`);
    }
  },

  /**
   * Send notification to a specific array of users
   * @param {Array<String>} userIds - Array of User ObjectIds
   * @param {Object} payload - { title, message, type, relatedId, imageUrl }
   */
  async sendToUsers(userIds, payload) {
    try {
      const notifications = [];
      let allTokens = [];

      // Create DB records for In-App history
      for (const userId of userIds) {
        notifications.push({
          user: userId,
          title: payload.title,
          message: payload.message,
          type: payload.type || "system",
          relatedId: payload.relatedId || null,
          imageUrl: payload.imageUrl || null,
        });
      }

      if (notifications.length > 0) {
        await models.Notification.insertMany(notifications);
      }

      // Collect FCM tokens from UserDevice
      const devices = await models.UserDevice.find({ user: { $in: userIds } }).select("fcmToken");
      for (const device of devices) {
        if (device.fcmToken) {
          allTokens.push(device.fcmToken);
        }
      }

      // Dispatch Push
      if (allTokens.length > 0) {
        await this._dispatchFCM(allTokens, {
          notification: {
            title: payload.title,
            body: payload.message,
            imageUrl: payload.imageUrl,
          },
          data: {
            type: payload.type || "system",
            relatedId: payload.relatedId ? payload.relatedId.toString() : "",
          }
        });
      }
    } catch (error) {
      logger.error(`NotificationService.sendToUsers Error: ${error.message}`);
    }
  },

  /**
   * Send notification to ALL users
   * @param {Object} payload - { title, message, type, relatedId, imageUrl }
   */
  async broadcast(payload) {
    try {
      // Create a single DB record with user = null (Broadcast)
      await models.Notification.create({
        user: null, // Null means it's a global broadcast
        title: payload.title,
        message: payload.message,
        type: payload.type || "system",
        relatedId: payload.relatedId || null,
        imageUrl: payload.imageUrl || null,
      });

      // To avoid massive memory spikes, we collect tokens in batches
      const batchSize = 500;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const devices = await models.UserDevice.find()
          .select("fcmToken")
          .skip(skip)
          .limit(batchSize);

        if (devices.length === 0) {
          hasMore = false;
          break;
        }

        let tokensBatch = devices.map(d => d.fcmToken);

        if (tokensBatch.length > 0) {
          await this._dispatchFCM(tokensBatch, {
            notification: {
              title: payload.title,
              body: payload.message,
              imageUrl: payload.imageUrl,
            },
            data: {
              type: payload.type || "system",
              relatedId: payload.relatedId ? payload.relatedId.toString() : "",
            }
          });
        }

        skip += batchSize;
      }
    } catch (error) {
      logger.error(`NotificationService.broadcast Error: ${error.message}`);
    }
  }
};
