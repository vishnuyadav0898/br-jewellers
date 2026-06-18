/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon and Discount Management
 */

/**
 * @swagger
 * /api/v1/coupons/create:
 *   post:
 *     tags: [Coupon]
 *     summary: Create a new discount coupon
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Loyalty Customer Discount"
 *               code:
 *                 type: string
 *                 example: "LOYAL20"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 example: 20
 *               maxDiscount:
 *                 type: object
 *                 properties:
 *                   INR: { type: number }
 *                   USD: { type: number }
 *                 example: { "INR": 5000, "USD": 60 }
 *               minOrderAmount:
 *                 type: object
 *                 properties:
 *                   INR: { type: number }
 *                   USD: { type: number }
 *                 example: { "INR": 10000, "USD": 120 }
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               applicableMaterials:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["gold", "diamond"]
 *               applicableOnOrderNumber:
 *                 type: number
 *                 description: "Restrict coupon to exactly the Nth order (e.g. 1 for first order, 3 for third order)"
 *                 example: 1
 *               usageLimit:
 *                 type: number
 *                 example: 1000
 *               usagePerUser:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *
 * /api/v1/coupons/list:
 *   get:
 *     tags: [Coupon]
 *     summary: List all coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all coupons
 *
 * /api/v1/coupons/{id}:
 *   patch:
 *     tags: [Coupon]
 *     summary: Update an existing coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *
 *   delete:
 *     tags: [Coupon]
 *     summary: Delete a coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *
 * /api/v1/coupons/assign:
 *   post:
 *     tags: [Coupon]
 *     summary: Assign a coupon to a specific user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assigned successfully
 *
 * /api/v1/coupons/assign/{assignmentId}:
 *   delete:
 *     tags: [Coupon]
 *     summary: Remove an assigned coupon from a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *
 * /api/v1/coupons/assigned:
 *   get:
 *     tags: [Coupon]
 *     summary: Get assigned coupons with optional user ID filter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter assignments by user ID
 *     responses:
 *       200:
 *         description: Array of coupon assignments
 */
