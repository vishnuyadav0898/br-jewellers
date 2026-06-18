/**
 * @swagger
 * tags:
 *   name: Permission
 *   description: RBAC Permission management
 */

/**
 * @swagger
 * /api/v1/permissions/list:
 *   get:
 *     tags: [Permission]
 *     summary: Get all available permission modules and actions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Permissions fetched successfully"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                     name: "Product"
 *                     actions: ["Add", "Update", "Delete"]
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                     name: "Blog"
 *                     actions: ["Add", "Update", "Delete"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/permissions/user/{userId}:
 *   get:
 *     tags: [Permission]
 *     summary: Get a user's assigned permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User permissions fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "User permissions fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c02"
 *                   name: "Vishnu"
 *                   email: "vishnu@brjewelers.com"
 *                   role: "admin"
 *                   permissions:
 *                     - module: "Product"
 *                       actions: ["Add", "Update"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Permission]
 *     summary: Assign permissions to an admin user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     module:
 *                       type: string
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                 example:
 *                   - module: "Product"
 *                     actions: ["Add", "Update"]
 *                   - module: "Blog"
 *                     actions: ["Add", "Update", "Delete"]
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Permissions assigned successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
