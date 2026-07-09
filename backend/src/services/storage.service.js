import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";
import path from "path";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "ecommerce-assets";
let MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";

if (MINIO_ENDPOINT.endsWith("/")) {
  MINIO_ENDPOINT = MINIO_ENDPOINT.slice(0, -1);
}

const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "Password@123",
  },
  forcePathStyle: true,
});

export const StorageService = {

  async initBucket() {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      logger.info(`MinIO: Bucket '${BUCKET_NAME}' already exists.`);
    } catch (err) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        logger.info(`MinIO: Bucket '${BUCKET_NAME}' not found. Creating...`);
        await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
            }
          ]
        };

        await s3.send(new PutBucketPolicyCommand({
          Bucket: BUCKET_NAME,
          Policy: JSON.stringify(policy)
        }));
        logger.info(`MinIO: Bucket '${BUCKET_NAME}' created and made public.`);
      } else {
        logger.error(`MinIO: Error checking bucket - ${err.message}`);
      }
    }
  },

  /**
   * Compresses and uploads an image buffer to MinIO
   * @param {Buffer} fileBuffer - The raw file buffer from Multer
   * @param {String} originalName - Original filename
   * @returns {String} - The public URL of the uploaded image
   */
  async uploadImage(fileBuffer, originalName) {
    // 1. Compress Image using Sharp
    const compressedBuffer = await sharp(fileBuffer)
      .resize({ width: 1200, withoutEnlargement: true }) // Resize large images
      .webp({ quality: 80 }) // Convert to webp with 80% quality
      .toBuffer();

    // 2. Generate unique key
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}_${uniqueId}.webp`;

    // 3. Upload to MinIO
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: compressedBuffer,
      ContentType: "image/webp",
    }));

    // 4. Return Public URL
    return `${MINIO_ENDPOINT}/${BUCKET_NAME}/${filename}`;
  },

  /**
   * Extracts the key from a URL and deletes the object from MinIO
   * @param {String} fileUrl - The full URL of the image
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    
    try {
      // Example URL: http://localhost:9000/ecommerce-assets/1712345_abc.webp
      // We need to extract just the filename
      const urlParts = fileUrl.split("/");
      const filename = urlParts[urlParts.length - 1];

      await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename
      }));
      logger.info(`MinIO: Deleted ${filename}`);
    } catch (error) {
      logger.error(`MinIO: Failed to delete file ${fileUrl} - ${error.message}`);
    }
  }
};
