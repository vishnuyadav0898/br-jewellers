/**
 * @swagger
 * /api/v1/product/list:
 *   get:
 *     tags: [Product]
 *     summary: Get all products
 *     description: Fetch all products with optional active status filter
 *     parameters:
 *       - name: isActive
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter products by active status. Defaults to true.
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Products fetched successfully"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                     name: "Women Rose Gold Ring"
 *                     description: "Premium handcrafted ring"
 *                     coverImage: "https://cdn.brjewelers.com/products/ring-cover.jpg"
 *                     images:
 *                       - "https://cdn.brjewelers.com/products/ring-1.jpg"
 *                       - "https://cdn.brjewelers.com/products/ring-2.jpg"
 *                     tags: ["rose gold", "women ring"]
 *                     gemstone: "Diamond"
 *                     occasions: ["Wedding", "Engagement"]
 *                     category: "Ring"
 *                     priceRange:
 *                       min: 200
 *                       max: 6000
 *                     variants:
 *                       - name: "gold-rosegold-24k-s"
 *                         material: "Gold"
 *                         color: "Rose Gold"
 *                         purity: "24K"
 *                         size: "S"
 *                         stock: 10
 *                         price:
 *                           INR: 2000
 *                           USD: 20
 *                     createdAt: "2025-06-01T10:00:00.000Z"
 *                     updatedAt: "2025-06-01T10:00:00.000Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/v1/product/{id}:
 *   get:
 *     tags: [Product]
 *     summary: Get product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                   name: "Women Rose Gold Ring"
 *                   description: "Premium handcrafted ring"
 *                   coverImage: "https://cdn.brjewelers.com/products/ring-cover.jpg"
 *                   images:
 *                     - "https://cdn.brjewelers.com/products/ring-1.jpg"
 *                   tags: ["rose gold", "women ring"]
 *                   gemstone: "Diamond"
 *                   occasions: ["Wedding", "Engagement"]
 *                   category: "Ring"
 *                   priceRange:
 *                     min: 200
 *                     max: 6000
 *                   variants:
 *                     - name: "gold-rosegold-24k-s"
 *                       material: "Gold"
 *                       color: "Rose Gold"
 *                       purity: "24K"
 *                       size: "S"
 *                       stock: 10
 *                       price:
 *                         INR: 2000
 *                         USD: 20
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-01T10:00:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Product]
 *     summary: Update product
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
 *                 example: "Women Rose Gold Ring"
 *               description:
 *                 type: string
 *                 example: "Premium handcrafted ring"
 *               coverImage:
 *                 type: string
 *                 example: "https://cdn.brjewelers.com/products/ring-cover.jpg"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://cdn.brjewelers.com/products/ring-1.jpg"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["rose gold", "women ring", "trending"]
 *               gemstone:
 *                 type: string
 *                 example: "Diamond"
 *               occasions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wedding", "Engagement"]
 *               category:
 *                 type: string
 *                 example: "Ring"
 *               priceRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 200
 *                   max:
 *                     type: number
 *                     example: 6000
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     material:
 *                       type: string
 *                     color:
 *                       type: string
 *                     purity:
 *                       type: string
 *                     size:
 *                       type: string
 *                     stock:
 *                       type: number
 *                     price:
 *                       type: object
 *                       properties:
 *                         INR:
 *                           type: number
 *                         USD:
 *                           type: number
 *                 example:
 *                   - name: "gold-rosegold-24k-s"
 *                     material: "Gold"
 *                     color: "Rose Gold"
 *                     purity: "24K"
 *                     size: "S"
 *                     stock: 10
 *                     price:
 *                       INR: 2000
 *                       USD: 20
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Product]
 *     summary: Delete product
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
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/v1/product/create:
 *   post:
 *     tags: [Product]
 *     summary: Create product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, coverImage, gemstone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Women Rose Gold Ring"
 *               description:
 *                 type: string
 *                 example: "Premium handcrafted ring"
 *               coverImage:
 *                 type: string
 *                 example: "https://cdn.brjewelers.com/products/ring-cover.jpg"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://cdn.brjewelers.com/products/ring-1.jpg", "https://cdn.brjewelers.com/products/ring-2.jpg"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["rose gold", "women ring"]
 *               gemstone:
 *                 type: string
 *                 example: "Diamond"
 *               occasions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wedding", "Engagement"]
 *               category:
 *                 type: string
 *                 example: "Ring"
 *               priceRange:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                     example: 200
 *                   max:
 *                     type: number
 *                     example: 6000
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example:
 *                   - name: "gold-rosegold-24k-s"
 *                     material: "Gold"
 *                     color: "Rose Gold"
 *                     purity: "24K"
 *                     size: "S"
 *                     stock: 10
 *                     price:
 *                       INR: 2000
 *                       USD: 20
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *                   - field: "name"
 *                     message: "Product name is required"
 */

/**
 * @swagger
 * /api/v1/product/status/{id}:
 *   patch:
 *     tags: [Product]
 *     summary: Update product active status
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
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Product status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Product deactivated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/v1/product/bulk-import:
 *   post:
 *     tags: [Product]
 *     summary: Bulk import products via Excel
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing products and variants
 *     responses:
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
