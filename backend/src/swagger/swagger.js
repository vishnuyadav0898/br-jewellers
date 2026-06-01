import swaggerUi from "swagger-ui-express";
import { authPaths } from "./auth.swagger.js";
import { userPaths } from "./user.swagger.js";
import { categoryPaths } from "./category.swagger.js";
import { productPaths } from "./product.swagger.js";
import { responses } from "./responses.js";

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://br-jewellers.onrender.com/api/v1"
    : "http://localhost:3000/api/v1";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-commerce API",
    version: "1.0.0",
  },
    servers: [
    {
      url: SERVER_URL,
    },
  ],

  tags: [
    { name: "Auth", description: "Authentication APIs" },
  ],

  components: {
    responses, 
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },

  paths: {
    ...authPaths,
    ...userPaths,
    ...categoryPaths,
    ...productPaths
  },
};

export const mountDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};