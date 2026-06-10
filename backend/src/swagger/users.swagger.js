/**
 * @swagger
 * /api/v1/user/list:
 *   get:
 *     tags: [User]
 *     summary: Get all users
 *     description: Fetch all users with optional role filter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter users by role
 *         example: admin
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Users fetched"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                     name: "Admin"
 *                     email: "admin@gmail.com"
 *                     phone: "9876543210"
 *                     role: "admin"
 *                     createdAt: "2025-06-01T10:00:00.000Z"
 *                     updatedAt: "2025-06-01T10:00:00.000Z"
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0e"
 *                     name: "John Doe"
 *                     email: "john@gmail.com"
 *                     phone: "9876543211"
 *                     role: "user"
 *                     createdAt: "2025-06-02T10:00:00.000Z"
 *                     updatedAt: "2025-06-02T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     tags: [User]
 *     summary: Get logged-in user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "User fetched"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   name: "John Doe"
 *                   email: "john@gmail.com"
 *                   phone: "9876543210"
 *                   role: "user"
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-01T10:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     tags: [User]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "User fetched"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   name: "John Doe"
 *                   email: "john@gmail.com"
 *                   phone: "9876543210"
 *                   role: "user"
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-01T10:00:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [User]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Name"
 *               email:
 *                 type: string
 *                 example: "updated@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "User updated"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   name: "Updated Name"
 *                   email: "updated@gmail.com"
 *                   phone: "9876543210"
 *                   role: "user"
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [User]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "User deleted"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/v1/user/create:
 *   post:
 *     tags: [User]
 *     summary: Create admin user
 *     description: Creates a new admin user (role is forced to admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Admin"
 *               email:
 *                 type: string
 *                 example: "newadmin@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Admin@123"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: Admin user created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Admin user created"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   name: "New Admin"
 *                   email: "newadmin@gmail.com"
 *                   phone: "9876543210"
 *                   role: "admin"
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "email already exists"
 *                 errors:
 *                   - field: "email"
 *                     message: "email already exists"
 */

/**
 * @swagger
 * /api/v1/user/change-password:
 *   patch:
 *     tags: [User]
 *     summary: Change password (logged-in user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "OldPass123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPass123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Password updated successfully"
 *       400:
 *         description: Invalid old password or same as new
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Old password is incorrect"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/v1/user/forgot-password:
 *   post:
 *     tags: [User]
 *     summary: Forgot password
 *     description: Generate a temporary password (sent via email in production)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@gmail.com"
 *     responses:
 *       200:
 *         description: Temporary password generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Password reset successfully"
 *                 data:
 *                   temporaryPassword: "aB3kLm9x"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
