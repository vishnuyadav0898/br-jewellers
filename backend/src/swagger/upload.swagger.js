/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: MinIO Storage Management
 */

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a single image to MinIO Storage
 *     description: Uploads an image, compresses it to WebP format via Sharp, and returns the public MinIO URL. The resulting URL should then be passed into your entity creation/update payloads (e.g. creating a User).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (Max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded and compressed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: "Image uploaded and compressed successfully"
 *                 data:
 *                   url: "http://localhost:9000/ecommerce-assets/1712345_abc.webp"
 *       400:
 *         description: No image file provided or bad file type
 */
