/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     description: Creates an order from explicit items or from the user's cart. Snapshots product variant prices and shipping address at order time.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: string
 *                 example: "665a1b2c3d4e5f6a7b8c9d0e"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "665a1b2c3d4e5f6a7b8c9d01"
 *                     sku:
 *                       type: string
 *                       example: "RING-GLD-14K-SZ6"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Order created successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   orderNumber: "ORD-000001"
 *                   user: "665a1b2c3d4e5f6a7b8c9d0a"
 *                   items:
 *                     - product: "665a1b2c3d4e5f6a7b8c9d01"
 *                       sku: "RING-GLD-14K-SZ6"
 *                       quantity: 2
 *                       price:
 *                         INR: 15000
 *                         USD: 180
 *                   shippingAddress:
 *                     fullName: "Saksham Mehta"
 *                     phone: "+919876543210"
 *                     line1: "42, MG Road"
 *                     line2: "Near City Mall"
 *                     city: "Mumbai"
 *                     state: "Maharashtra"
 *                     zip: "400001"
 *                     country: "India"
 *                   status: "pending"
 *                   totalAmount:
 *                     INR: 30000
 *                     USD: 360
 *                   createdAt: "2026-06-09T09:00:00.000Z"
 *                   updatedAt: "2026-06-09T09:00:00.000Z"
 *       400:
 *         description: Bad request / Cart empty / Invalid variant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Cart is empty"
 *       404:
 *         description: Address or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Address not found"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Validation failed"
 *                 errors:
 *                   - field: "addressId"
 *                     message: "Address ID is required"
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders
 *     description: Admin gets all orders (with optional ?user= filter). Regular users get only their own orders. Products are populated with name and coverImage.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: (Admin only) Filter orders by user ID
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Orders fetched successfully"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                     orderNumber: "ORD-000001"
 *                     user: "665a1b2c3d4e5f6a7b8c9d0a"
 *                     items:
 *                       - product:
 *                           _id: "665a1b2c3d4e5f6a7b8c9d01"
 *                           name: "Diamond Solitaire Ring"
 *                           coverImage: "https://cdn.example.com/ring-cover.jpg"
 *                         sku: "RING-GLD-14K-SZ6"
 *                         quantity: 2
 *                         price:
 *                           INR: 15000
 *                           USD: 180
 *                     shippingAddress:
 *                       fullName: "Saksham Mehta"
 *                       phone: "+919876543210"
 *                       line1: "42, MG Road"
 *                       line2: "Near City Mall"
 *                       city: "Mumbai"
 *                       state: "Maharashtra"
 *                       zip: "400001"
 *                       country: "India"
 *                     status: "confirmed"
 *                     totalAmount:
 *                       INR: 30000
 *                       USD: 360
 *                     createdAt: "2026-06-09T09:00:00.000Z"
 *                     updatedAt: "2026-06-09T09:10:00.000Z"
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c0e"
 *                     orderNumber: "ORD-000002"
 *                     user: "665a1b2c3d4e5f6a7b8c9d0a"
 *                     items:
 *                       - product:
 *                           _id: "665a1b2c3d4e5f6a7b8c9d02"
 *                           name: "Gold Chain Necklace"
 *                           coverImage: "https://cdn.example.com/necklace-cover.jpg"
 *                         sku: "NKLC-GLD-22K"
 *                         quantity: 1
 *                         price:
 *                           INR: 45000
 *                           USD: 540
 *                     shippingAddress:
 *                       fullName: "Saksham Mehta"
 *                       phone: "+919876543210"
 *                       line1: "42, MG Road"
 *                       line2: ""
 *                       city: "Mumbai"
 *                       state: "Maharashtra"
 *                       zip: "400001"
 *                       country: "India"
 *                     status: "pending"
 *                     totalAmount:
 *                       INR: 45000
 *                       USD: 540
 *                     createdAt: "2026-06-08T15:30:00.000Z"
 *                     updatedAt: "2026-06-08T15:30:00.000Z"
 */

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     description: Fetch a single order with full product and user details. Non-admin users can only view their own orders.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Order fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   orderNumber: "ORD-000001"
 *                   user:
 *                     _id: "665a1b2c3d4e5f6a7b8c9d0a"
 *                     name: "Saksham Mehta"
 *                     email: "saksham@example.com"
 *                   items:
 *                     - product:
 *                         _id: "665a1b2c3d4e5f6a7b8c9d01"
 *                         name: "Diamond Solitaire Ring"
 *                         coverImage: "https://cdn.example.com/ring-cover.jpg"
 *                         images:
 *                           - "https://cdn.example.com/ring-1.jpg"
 *                           - "https://cdn.example.com/ring-2.jpg"
 *                         category: "Rings"
 *                       sku: "RING-GLD-14K-SZ6"
 *                       quantity: 2
 *                       price:
 *                         INR: 15000
 *                         USD: 180
 *                   shippingAddress:
 *                     fullName: "Saksham Mehta"
 *                     phone: "+919876543210"
 *                     line1: "42, MG Road"
 *                     line2: "Near City Mall"
 *                     city: "Mumbai"
 *                     state: "Maharashtra"
 *                     zip: "400001"
 *                     country: "India"
 *                   status: "confirmed"
 *                   totalAmount:
 *                     INR: 30000
 *                     USD: 360
 *                   createdAt: "2026-06-09T09:00:00.000Z"
 *                   updatedAt: "2026-06-09T09:10:00.000Z"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Order not found"
 */

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (Admin only)
 *     description: Update the status of an order. Status can only move forward (pending → confirmed → shipped → delivered) or be set to cancelled (except from delivered). Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Order status updated successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   orderNumber: "ORD-000001"
 *                   user: "665a1b2c3d4e5f6a7b8c9d0a"
 *                   items:
 *                     - product: "665a1b2c3d4e5f6a7b8c9d01"
 *                       sku: "RING-GLD-14K-SZ6"
 *                       quantity: 2
 *                       price:
 *                         INR: 15000
 *                         USD: 180
 *                   shippingAddress:
 *                     fullName: "Saksham Mehta"
 *                     phone: "+919876543210"
 *                     line1: "42, MG Road"
 *                     line2: "Near City Mall"
 *                     city: "Mumbai"
 *                     state: "Maharashtra"
 *                     zip: "400001"
 *                     country: "India"
 *                   status: "confirmed"
 *                   totalAmount:
 *                     INR: 30000
 *                     USD: 360
 *                   createdAt: "2026-06-09T09:00:00.000Z"
 *                   updatedAt: "2026-06-09T09:15:00.000Z"
 *       400:
 *         description: Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Invalid status transition from 'delivered' to 'pending'"
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Forbidden: Admin access required"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Order not found"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Validation failed"
 *                 errors:
 *                   - field: "status"
 *                     message: "Status must be one of: pending, confirmed, shipped, delivered, cancelled"
 */
