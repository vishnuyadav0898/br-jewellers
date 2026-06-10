export const globalResponses = {
  Success: {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: true,
            message: "Action successful",
          },
        },
      },
    },
  },
  Created: {
    description: "Created",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: true,
            message: "Created successfully",
          },
        },
      },
    },
  },
  Deleted: {
    description: "Deleted",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: true,
            message: "Deleted successfully",
          },
        },
      },
    },
  },
  BadRequest: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: false,
            message: "Bad Request",
            errors: [{ field: "email", message: "Email is required" }],
          },
        },
      },
    },
  },
  Unauthorized: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: false,
            message: "Unauthorized: No token provided or malformed.",
          },
        },
      },
    },
  },
  NotFound: {
    description: "Not Found",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: false,
            message: "Not Found",
          },
        },
      },
    },
  },
  Forbidden: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: false,
            message: "Forbidden: Admin access required",
          },
        },
      },
    },
  },
  ServerError: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          example: {
            success: false,
            message: "Internal Server Error",
          },
        },
      },
    },
  },
};
