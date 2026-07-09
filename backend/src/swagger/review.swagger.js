export const reviewSwagger = {
  "/api/v1/reviews/{productId}": {
    get: {
      tags: ["Reviews"],
      summary: "Get product reviews",
      description: "Retrieve paginated reviews for a specific product",
      parameters: [
        {
          in: "path",
          name: "productId",
          required: true,
          schema: { type: "string" },
          description: "Product ID",
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
          description: "Number of reviews per page",
        },
      ],
      responses: {
        200: { description: "Reviews fetched successfully" },
      },
    },
    post: {
      tags: ["Reviews"],
      summary: "Create a review",
      description: "Submit a review for a product. User must have purchased it.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "productId",
          required: true,
          schema: { type: "string" },
          description: "Product ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["rating"],
              properties: {
                rating: { type: "integer", minimum: 1, maximum: 5 },
                title: { type: "string" },
                comment: { type: "string" },
                images: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Review submitted successfully" },
        400: { description: "Bad request or already reviewed" },
        403: { description: "Forbidden - not purchased or delivered" },
        404: { description: "Product not found" },
      },
    },
  },
  "/api/v1/reviews/{productId}/can-review": {
    get: {
      tags: ["Reviews"],
      summary: "Check review eligibility",
      description: "Check if the current user is eligible to review a product",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "productId",
          required: true,
          schema: { type: "string" },
          description: "Product ID",
        },
      ],
      responses: {
        200: { description: "Eligibility checked successfully" },
      },
    },
  },
};
