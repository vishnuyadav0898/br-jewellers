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
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category (comma-separated allowed).
 *       - name: material
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by variant material (comma-separated allowed).
 *       - name: purity
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by variant purity (comma-separated allowed).
 *       - name: size
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by variant size (comma-separated allowed).
 *       - name: minPrice
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum price.
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum price.
 *       - name: tags
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated).
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by name, category, tags, description, shortDescription, or variant SKU.
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
 *                       - sku: "gold-rosegold-24k-s"
 *                         attributes:
 *                           material: "Gold"
 *                           color: "Rose Gold"
 *                           purity: "24K"
 *                           size: "S"
 *                         prices:
 *                           - currency: "INR"
 *                             amount: 2000
 *                           - currency: "USD"
 *                             amount: 20
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
 *                     - sku: "gold-rosegold-24k-s"
 *                       attributes:
 *                         material: "Gold"
 *                         color: "Rose Gold"
 *                         purity: "24K"
 *                         size: "S"
 *                       prices:
 *                         - currency: "INR"
 *                           amount: 2000
 *                         - currency: "USD"
 *                           amount: 20
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
 *                     sku:
 *                       type: string
 *                     attributes:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                     prices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           currency:
 *                             type: string
 *                           amount:
 *                             type: number
 *                 example:
 *                   - sku: "gold-rosegold-24k-s"
 *                     attributes:
 *                       material: "Gold"
 *                       color: "Rose Gold"
 *                       purity: "24K"
 *                       size: "S"
 *                     prices:
 *                       - currency: "INR"
 *                         amount: 2000
 *                       - currency: "USD"
 *                         amount: 20
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
 *                   - sku: "gold-rosegold-24k-s"
 *                     attributes:
 *                       material: "Gold"
 *                       color: "Rose Gold"
 *                       purity: "24K"
 *                       size: "S"
 *                     prices:
 *                       - currency: "INR"
 *                         amount: 2000
 *                       - currency: "USD"
 *                         amount: 20
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
