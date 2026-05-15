import swaggerUi from "swagger-ui-express";
import { authPaths } from "./auth.swagger.js";
import { userPaths } from "./user.swagger.js";
import { categoryPaths } from "./category.swagger.js";
import { responses } from "./responses.js";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-commerce API",
    version: "1.0.0",
  },
    servers: [
    {
      url: "http://localhost:3000/api/v1",
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
    ...categoryPaths
  },
};

export const mountDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};