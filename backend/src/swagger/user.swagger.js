export const userPaths = {
"/user/list": {
  get: {
    tags: ["User"],
    summary: "Get all users",
    description: "Fetch all users with optional role filter",
    security: [{ bearerAuth: [] }],

    // 🔥 ADD THIS
    parameters: [
      {
        name: "role",
        in: "query",
        required: false,
        schema: {
          type: "string",
          enum: ["user", "admin"],
        },
        description: "Filter users by role (user or admin)",
        example: "admin",
      },
    ],

    responses: {
      200: {
        description: "Users fetched successfully",
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

  "/user/me": {
    get: {
      tags: ["User"],
      summary: "Get logged-in user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User fetched successfully",
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
        },
        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },
  },

  "/user/{id}": {
    get: {
      tags: ["User"],
      summary: "Get user by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "User fetched successfully",
        },
        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },

    put: {
      tags: ["User"],
      summary: "Update user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Updated Name" },
                email: { type: "string", example: "updated@gmail.com" },
                password: { type: "string", example: "NewPass123" },
                phone: { type: "string", example: "9876543210" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User updated successfully",
        },
        400: {
          $ref: "#/components/responses/BadRequest",
        },
        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },

    delete: {
      tags: ["User"],
      summary: "Delete user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "User deleted successfully",
        },
        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },
  },

  "/user/create": {
    post: {
      tags: ["User"],
      summary: "Create admin user",
      description: "Creates a new admin user (role is forced to admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "Admin User" },
                email: { type: "string", example: "admin@gmail.com" },
                password: { type: "string", example: "Admin@123" },
                phone: { type: "string", example: "9876543210" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Admin user created successfully",
        },
        400: {
          $ref: "#/components/responses/BadRequest",
        },
        409: {
          description: "User already exists",
        },
      },
    },
  },
 "/user/change-password": {
    patch: {
      tags: ["User"],
      summary: "Change password (logged-in user)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword"],
              properties: {
                oldPassword: {
                  type: "string",
                  example: "OldPass123",
                },
                newPassword: {
                  type: "string",
                  example: "NewPass123",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Password updated successfully" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },

  // 🔑 FORGOT PASSWORD
  "/user/forgot-password": {
    post: {
      tags: ["User"],
      summary: "Forgot password",
      description: "Generate a temporary password (to be sent via email in production)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  example: "user@gmail.com",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Temporary password generated" },
        404: { $ref: "#/components/responses/NotFound" },
        400: { $ref: "#/components/responses/BadRequest" },
      },
    },
  },
};