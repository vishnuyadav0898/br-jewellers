/**
 * @swagger
 * tags:
 *   name: Returns
 *   description: Order Return & Refund Management
 */

/**
 * @swagger
 * /api/v1/returns/request:
 *   post:
 *     tags: [Returns]
 *     summary: Request a return for an order or specific items (User)
 *     description: Users can request a return within 3 days of delivery.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - reason
 *               - items
 *             properties:
 *               orderId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: "Product was damaged during shipping"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - sku
 *                     - quantity
 *                   properties:
 *                     sku:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       example: 1
 *     responses:
 *       201:
 *         description: Return request submitted successfully
 *       400:
 *         description: Validation failed (e.g. past 3 days, invalid quantities)
 *
 * /api/v1/returns/my-returns:
 *   get:
 *     tags: [Returns]
 *     summary: Get all return requests for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user returns
 *
 * /api/v1/returns/admin/list:
 *   get:
 *     tags: [Returns]
 *     summary: Get all return requests (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all returns
 *
 * /api/v1/returns/admin/{id}:
 *   patch:
 *     tags: [Returns]
 *     summary: Update return request status (Admin)
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, refunded]
 *               adminNote:
 *                 type: string
 *                 example: "Refund initiated to original payment method"
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
