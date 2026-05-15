export const categoryPaths = {
"/category/list": {
  get: {
    tags: ["Category"],
    summary: "Get all categories",
    description: "Fetch all categories for products",
    security: [{ bearerAuth: [] }],


    responses: {
      200: {
        description: "Categories fetched successfully",
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