/**
 * @swagger
 * /api/v1/address:
 *   post:
 *     tags: [Address]
 *     summary: Create a new address for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - line1
 *               - city
 *               - state
 *               - zip
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Home"
 *               fullName:
 *                 type: string
 *                 example: "Saksham Mehta"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               line1:
 *                 type: string
 *                 example: "42, Sunrise Apartments"
 *               line2:
 *                 type: string
 *                 example: "Near City Mall, MG Road"
 *               city:
 *                 type: string
 *                 example: "Jaipur"
 *               state:
 *                 type: string
 *                 example: "Rajasthan"
 *               zip:
 *                 type: string
 *                 example: "302001"
 *               country:
 *                 type: string
 *                 example: "India"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Address created successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "664a0b1c2d3e4f5a6b7c8d9e"
 *                   label: "Home"
 *                   fullName: "Saksham Mehta"
 *                   phone: "9876543210"
 *                   line1: "42, Sunrise Apartments"
 *                   line2: "Near City Mall, MG Road"
 *                   city: "Jaipur"
 *                   state: "Rajasthan"
 *                   zip: "302001"
 *                   country: "India"
 *                   isDefault: true
 *                   createdAt: "2026-06-09T09:00:00.000Z"
 *                   updatedAt: "2026-06-09T09:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Unauthorized"
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Validation failed"
 *                 errors:
 *                   - field: "fullName"
 *                     message: "Full name is required"
 */

/**
 * @swagger
 * /api/v1/address:
 *   get:
 *     tags: [Address]
 *     summary: Get all addresses for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Addresses fetched successfully"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                     user: "664a0b1c2d3e4f5a6b7c8d9e"
 *                     label: "Home"
 *                     fullName: "Saksham Mehta"
 *                     phone: "9876543210"
 *                     line1: "42, Sunrise Apartments"
 *                     line2: "Near City Mall, MG Road"
 *                     city: "Jaipur"
 *                     state: "Rajasthan"
 *                     zip: "302001"
 *                     country: "India"
 *                     isDefault: true
 *                     createdAt: "2026-06-09T09:00:00.000Z"
 *                     updatedAt: "2026-06-09T09:00:00.000Z"
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0e"
 *                     user: "664a0b1c2d3e4f5a6b7c8d9e"
 *                     label: "Office"
 *                     fullName: "Saksham Mehta"
 *                     phone: "9123456780"
 *                     line1: "12, Tech Park Tower B"
 *                     line2: "Sector 15, Industrial Area"
 *                     city: "Gurugram"
 *                     state: "Haryana"
 *                     zip: "122001"
 *                     country: "India"
 *                     isDefault: false
 *                     createdAt: "2026-06-08T14:30:00.000Z"
 *                     updatedAt: "2026-06-08T14:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Unauthorized"
 */

/**
 * @swagger
 * /api/v1/address/{id}:
 *   patch:
 *     tags: [Address]
 *     summary: Update an address by ID for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *         example: "665f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Work"
 *               fullName:
 *                 type: string
 *                 example: "Saksham Mehta"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               line1:
 *                 type: string
 *                 example: "99, Diamond Plaza"
 *               line2:
 *                 type: string
 *                 example: "Ring Road"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               state:
 *                 type: string
 *                 example: "Maharashtra"
 *               zip:
 *                 type: string
 *                 example: "400001"
 *               country:
 *                 type: string
 *                 example: "India"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Address updated successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "664a0b1c2d3e4f5a6b7c8d9e"
 *                   label: "Work"
 *                   fullName: "Saksham Mehta"
 *                   phone: "9876543210"
 *                   line1: "99, Diamond Plaza"
 *                   line2: "Ring Road"
 *                   city: "Mumbai"
 *                   state: "Maharashtra"
 *                   zip: "400001"
 *                   country: "India"
 *                   isDefault: true
 *                   createdAt: "2026-06-09T09:00:00.000Z"
 *                   updatedAt: "2026-06-09T10:15:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Unauthorized"
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Address not found"
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Validation failed"
 *                 errors:
 *                   - field: "phone"
 *                     message: "Phone must be a valid 10-digit number"
 */

/**
 * @swagger
 * /api/v1/address/{id}:
 *   delete:
 *     tags: [Address]
 *     summary: Delete an address by ID for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *         example: "665f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Address deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Unauthorized"
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Address not found"
 */
