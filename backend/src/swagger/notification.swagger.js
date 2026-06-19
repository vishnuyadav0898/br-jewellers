/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push and In-App Notification Management
 */

/**
 * @swagger
 * /api/v1/notifications/register-token:
 *   post:
 *     tags: [Notifications]
 *     summary: Register a device push token (User)
 *     description: Save a Firebase Cloud Messaging (FCM) token or APNs token to the user's profile to receive push notifications.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "fkdjsf8392jfdf8sdf8dsfdsfsdfsdfds"
 *     responses:
 *       200:
 *         description: Push token registered successfully
 *
 * /api/v1/notifications/admin/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a manual push notification (Admin)
 *     description: Admins can blast a custom push notification to all users or a specific list of users.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Flash Sale Alert!"
 *               message:
 *                 type: string
 *                 example: "Get 50% off all diamond rings today only."
 *               isBroadcast:
 *                 type: boolean
 *                 description: "Set to true to send to all users. Defaults to false."
 *                 example: false
 *               userIds:
 *                 type: array
 *                 description: "Required if isBroadcast is false."
 *                 items:
 *                   type: string
 *               imageUrl:
 *                 type: string
 *                 description: "Optional image for rich push notifications"
 *                 example: "https://example.com/sale-banner.jpg"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *
 * /api/v1/notifications/admin/list:
 *   get:
 *     tags: [Notifications]
 *     summary: View global notification history (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications fetched successfully
 */
