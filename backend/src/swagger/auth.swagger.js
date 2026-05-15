export const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "John Doe" },
                email: { type: "string", example: "john@gmail.com" },
                password: { type: "string", example: "123456" },
                phone: { type: "string", example: "9876543210" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered",
        },
        400: {
          $ref: "#/components/responses/BadRequest",
        },
        409: {
          description: "User already exists",
        },
        500: {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },

  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "admin@gmail.com" },
                password: { type: "string", example: "Admin@123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
        },
        500: {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },
};