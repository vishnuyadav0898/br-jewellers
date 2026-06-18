/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get user wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Wishlist fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c30"
 *                   user: "665f1a2b3c4d5e6f7a8b9c01"
 *                   products:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                       name: "Women Rose Gold Ring"
 *                       coverImage: "https://cdn.brjewelers.com/products/ring-cover.jpg"
 *                       category: "Ring"
 *                       priceRange:
 *                         min: 200
 *                         max: 6000
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                       name: "Diamond Pendant Necklace"
 *                       coverImage: "https://cdn.brjewelers.com/products/necklace-cover.jpg"
 *                       category: "Necklace"
 *                       priceRange:
 *                         min: 5000
 *                         max: 15000
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-10T14:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/v1/wishlist/add:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add product to wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "665f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product added to wishlist"
 *       201:
 *         description: Wishlist created and product added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product added to wishlist"
 *       400:
 *         description: Product already in wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Product already in wishlist"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/v1/wishlist/remove/{productId}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove product from wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product removed from wishlist"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
