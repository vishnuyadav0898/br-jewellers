/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to the cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "665f1a2b3c4d5e6f7a8b9c10"
 *               variantIndex:
 *                 type: number
 *                 example: 0
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item added to cart (new cart created)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Item added to cart"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c0f"
 *                       product: "665f1a2b3c4d5e6f7a8b9c10"
 *                       variantIndex: 0
 *                       quantity: 2
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:00:00.000Z"
 *       200:
 *         description: Item added to existing cart (quantity updated or new item pushed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Item added to cart"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c0f"
 *                       product: "665f1a2b3c4d5e6f7a8b9c10"
 *                       variantIndex: 0
 *                       quantity: 4
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                       product: "665f1a2b3c4d5e6f7a8b9c12"
 *                       variantIndex: 1
 *                       quantity: 1
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:05:00.000Z"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Product not found"
 */

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the current user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Cart fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c0f"
 *                       product:
 *                         _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                         name: "Women Rose Gold Ring"
 *                         coverImage: "https://cdn.brjewelers.com/ring.jpg"
 *                         description: "Elegant rose gold ring with diamond studding"
 *                         category: "Rings"
 *                         gemstone: "Diamond"
 *                         priceRange:
 *                           min: 15000
 *                           max: 25000
 *                         variants:
 *                           - name: "14K Rose Gold - Size 6"
 *                             material: "Rose Gold"
 *                             color: "Rose"
 *                             purity: "14K"
 *                             size: "6"
 *                             price:
 *                               INR: 15000
 *                               USD: 180
 *                           - name: "18K Rose Gold - Size 7"
 *                             material: "Rose Gold"
 *                             color: "Rose"
 *                             purity: "18K"
 *                             size: "7"
 *                             price:
 *                               INR: 25000
 *                               USD: 300
 *                       variantIndex: 0
 *                       quantity: 2
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                       product:
 *                         _id: "665f1a2b3c4d5e6f7a8b9c12"
 *                         name: "Men Platinum Chain"
 *                         coverImage: "https://cdn.brjewelers.com/chain.jpg"
 *                         description: "Classic platinum chain for men"
 *                         category: "Chains"
 *                         gemstone: "None"
 *                         priceRange:
 *                           min: 50000
 *                           max: 50000
 *                         variants:
 *                           - name: "Platinum 20 inch"
 *                             material: "Platinum"
 *                             color: "Silver"
 *                             purity: "950"
 *                             size: "20in"
 *                             price:
 *                               INR: 50000
 *                               USD: 600
 *                       variantIndex: 0
 *                       quantity: 1
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:05:00.000Z"
 */

/**
 * @swagger
 * /api/v1/cart/item/{id}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update quantity of a cart item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item subdocument _id
 *         example: "665f1a2b3c4d5e6f7a8b9c0f"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Cart item updated"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c0f"
 *                       product: "665f1a2b3c4d5e6f7a8b9c10"
 *                       variantIndex: 0
 *                       quantity: 3
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:10:00.000Z"
 *       404:
 *         description: Cart or item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Cart item not found"
 */

/**
 * @swagger
 * /api/v1/cart/item/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item subdocument _id
 *         example: "665f1a2b3c4d5e6f7a8b9c0f"
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Item removed from cart"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items:
 *                     - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                       product: "665f1a2b3c4d5e6f7a8b9c12"
 *                       variantIndex: 1
 *                       quantity: 1
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:15:00.000Z"
 *       404:
 *         description: Cart or item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Cart item not found"
 */

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear all items from the cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Cart cleared successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c0d"
 *                   user: "665f1a2b3c4d5e6f7a8b9c0e"
 *                   items: []
 *                   createdAt: "2025-06-09T10:00:00.000Z"
 *                   updatedAt: "2025-06-09T10:20:00.000Z"
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Cart not found"
 */
