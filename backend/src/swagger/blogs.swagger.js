/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Editorial blog management
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     tags: [Blog]
 *     summary: Get all blogs
 *     responses:
 *       200:
 *         description: Blogs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Blogs fetched successfully"
 *                 data:
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                     title: "The Art of Choosing the Perfect Engagement Ring"
 *                     image: "https://cdn.brjewelers.com/blogs/engagement-ring-guide.jpg"
 *                     description: "A comprehensive guide to selecting the ideal engagement ring, from understanding diamond cuts to choosing the right metal for your partner's style."
 *                     gallery:
 *                       - "https://cdn.brjewelers.com/blogs/ring-cuts.jpg"
 *                       - "https://cdn.brjewelers.com/blogs/ring-metals.jpg"
 *                       - "https://cdn.brjewelers.com/blogs/ring-styles.jpg"
 *                     author:
 *                       _id: "665f1a2b3c4d5e6f7a8b9c01"
 *                       name: "Vishnu Yadav"
 *                       email: "vishnu@brjewelers.com"
 *                     createdAt: "2025-06-01T10:00:00.000Z"
 *                     updatedAt: "2025-06-01T10:00:00.000Z"
 *                   - _id: "665f1a2b3c4d5e6f7a8b9c11"
 *                     title: "Gold vs Platinum: Which is Right for You?"
 *                     image: "https://cdn.brjewelers.com/blogs/gold-vs-platinum.jpg"
 *                     description: "Explore the key differences between gold and platinum jewellery to make an informed purchasing decision."
 *                     gallery:
 *                       - "https://cdn.brjewelers.com/blogs/gold-comparison.jpg"
 *                       - "https://cdn.brjewelers.com/blogs/platinum-comparison.jpg"
 *                     author:
 *                       _id: "665f1a2b3c4d5e6f7a8b9c02"
 *                       name: "Saksham Mehta"
 *                       email: "saksham@brjewelers.com"
 *                     createdAt: "2025-05-20T08:30:00.000Z"
 *                     updatedAt: "2025-05-20T08:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags: [Blog]
 *     summary: Create a new blog (Admin only)
 *     description: Author is automatically set from the logged-in user's ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Art of Choosing the Perfect Engagement Ring"
 *               image:
 *                 type: string
 *                 example: "https://cdn.brjewelers.com/blogs/engagement-ring-guide.jpg"
 *               description:
 *                 type: string
 *                 example: "A comprehensive guide to selecting the ideal engagement ring, from understanding diamond cuts to choosing the right metal for your partner's style."
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://cdn.brjewelers.com/blogs/ring-cuts.jpg", "https://cdn.brjewelers.com/blogs/ring-metals.jpg", "https://cdn.brjewelers.com/blogs/ring-styles.jpg"]
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Blog created successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                   title: "The Art of Choosing the Perfect Engagement Ring"
 *                   image: "https://cdn.brjewelers.com/blogs/engagement-ring-guide.jpg"
 *                   description: "A comprehensive guide to selecting the ideal engagement ring."
 *                   gallery:
 *                     - "https://cdn.brjewelers.com/blogs/ring-cuts.jpg"
 *                     - "https://cdn.brjewelers.com/blogs/ring-metals.jpg"
 *                   author: "665f1a2b3c4d5e6f7a8b9c01"
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-01T10:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/blogs/{id}:
 *   get:
 *     tags: [Blog]
 *     summary: Get a blog by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Blog fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Blog fetched successfully"
 *                 data:
 *                   _id: "665f1a2b3c4d5e6f7a8b9c10"
 *                   title: "The Art of Choosing the Perfect Engagement Ring"
 *                   image: "https://cdn.brjewelers.com/blogs/engagement-ring-guide.jpg"
 *                   description: "A comprehensive guide to selecting the ideal engagement ring, from understanding diamond cuts to choosing the right metal for your partner's style."
 *                   gallery:
 *                     - "https://cdn.brjewelers.com/blogs/ring-cuts.jpg"
 *                     - "https://cdn.brjewelers.com/blogs/ring-metals.jpg"
 *                     - "https://cdn.brjewelers.com/blogs/ring-styles.jpg"
 *                   author:
 *                     _id: "665f1a2b3c4d5e6f7a8b9c01"
 *                     name: "Vishnu Yadav"
 *                     email: "vishnu@brjewelers.com"
 *                   createdAt: "2025-06-01T10:00:00.000Z"
 *                   updatedAt: "2025-06-01T10:00:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     tags: [Blog]
 *     summary: Update a blog (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c10"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated: The Art of Choosing the Perfect Engagement Ring"
 *               image:
 *                 type: string
 *                 example: "https://cdn.brjewelers.com/blogs/engagement-ring-guide-v2.jpg"
 *               description:
 *                 type: string
 *                 example: "An updated comprehensive guide to selecting the ideal engagement ring."
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://cdn.brjewelers.com/blogs/ring-cuts.jpg", "https://cdn.brjewelers.com/blogs/ring-metals.jpg"]
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Blog updated successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     tags: [Blog]
 *     summary: Delete a blog (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Blog deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
