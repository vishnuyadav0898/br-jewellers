/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Dynamic content page management
 */

/**
 * @swagger
 * /api/v1/content/{page}:
 *   get:
 *     tags: [Content]
 *     summary: Get content for a specific page (e.g., about-us, terms)
 *     parameters:
 *       - name: page
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content fetched successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * 
 *   patch:
 *     tags: [Content]
 *     summary: Update content for a specific page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
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
 *             description: Accepts any JSON structure
 *             example:
 *               title: "About BR Jewellers"
 *               body: "<p>BR Jewellers blends everyday polish...</p>"
 *               founderName: "Ramesh Yadav"
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Content updated successfully"
 *                 data:
 *                   title: "About BR Jewellers"
 *                   body: "<p>BR Jewellers blends everyday polish...</p>"
 *                   founderName: "Ramesh Yadav"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
