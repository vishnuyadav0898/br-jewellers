import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { globalResponses } from "./responses.js";

const router = express.Router();

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://br-jewellers.onrender.com"
    : "http://localhost:3000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BR Jewellers",
      version: "1.0.0",
      description: "BR Jewellers E-commerce REST API with JWT authentication",
    },
    servers: [
      {
        url: SERVER_URL,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication & Authorization" },
      { name: "User", description: "User management" },
      { name: "Category", description: "Product categories" },
      { name: "Product", description: "Product CRUD" },
      { name: "Cart", description: "Shopping cart" },
      { name: "Address", description: "User addresses" },
      { name: "Order", description: "Order management" },
      { name: "Wishlist", description: "User wishlist management" },
      { name: "Blog", description: "Editorial blog management" },
      { name: "Content", description: "Dynamic content page management" },
      { name: "Permission", description: "RBAC Permission management" },
      { name: "Coupon", description: "Coupon and Discount module" },
      { name: "Returns", description: "Order Return & Refund Module" },
      { name: "Notifications", description: "Push and In-App Notification Management" },
      { name: "Upload", description: "MinIO Storage Management" },
      { name: "Reviews", description: "Product Rating and Reviews" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      responses: globalResponses,
    },
  },
  apis: ["./src/swagger/*.swagger.js"],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * ========================================================
 * 🌐 Swagger UI Routes
 * --------------------------------------------------------
 * Provides interactive Swagger UI and raw JSON spec.
 * - `/` → Interactive Swagger UI
 * - `/openapi.json` → Raw OpenAPI spec
 * ========================================================
 */
router.use("/", swaggerUi.serve);

/**
 * GET `/` - Render Swagger UI
 * --------------------------------------------------------
 */
router.get("/", (req, res, next) => {
  try {
    const html = swaggerUi.generateHTML(swaggerSpec, {
      /** persist JWT auth across reloads */
      swaggerOptions: { persistAuthorization: true },
      /** enable search/explorer in UI */
      explorer: true,
    });

    res.send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * GET `/openapi.json` - Return OpenAPI JSON
 * --------------------------------------------------------
 */
router.get("/openapi.json", (req, res) => {
  try {
    res.json(swaggerSpec);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch OpenAPI spec",
    });
  }
});

export default router;