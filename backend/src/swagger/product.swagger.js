export const productPaths = {
"/product/list": {
  get: {
    tags: ["Product"],
    summary: "Get all products",
    description: "Fetch all products",

    parameters: [
      {
        name: "isActive",
        in: "query",
        required: false,

        schema: {
          type: "boolean",
          default: true,
        },

        description:
          "Filter products by active status. Defaults to true.",
      },
    ],

    responses: {
      200: {
        description: "Products fetched successfully",
      },

      500: {
        $ref: "#/components/responses/ServerError",
      },
    },
  },
},

  "/product/{id}": {
    get: {
      tags: ["Product"],
      summary: "Get product by ID",

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
          description: "Product fetched successfully",
        },

        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },

    patch: {
      tags: ["Product"],
      summary: "Update product",
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
                name: {
                  type: "string",
                  example: "Women Rose Gold Ring",
                },

                description: {
                  type: "string",
                  example: "Premium handcrafted ring",
                },

                coverImage: {
                  type: "string",
                  example:
                    "https://cdn.brjewelers.com/products/ring-cover.jpg",
                },

                images: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: [
                    "https://cdn.brjewelers.com/products/ring-1.jpg",
                    "https://cdn.brjewelers.com/products/ring-2.jpg",
                  ],
                },

                tags: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: ["rose gold", "women ring", "trending"],
                },

                gemstone: {
                  type: "string",
                  example: "Diamond",
                },

                occasions: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: ["Wedding", "Engagement"],
                },

                category: {
                  type: "string",
                  example: "Ring",
                },

                priceRange: {
                  type: "object",

                  properties: {
                    min: {
                      type: "number",
                      example: 200,
                    },

                    max: {
                      type: "number",
                      example: 6000,
                    },
                  },
                },

                variants: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      name: {
                        type: "string",
                        example: "gold-rosegold-24k-s",
                      },

                      material: {
                        type: "string",
                        example: "Gold",
                      },

                      color: {
                        type: "string",
                        example: "Rose Gold",
                      },

                      purity: {
                        type: "string",
                        example: "24K",
                      },

                      size: {
                        type: "string",
                        example: "S",
                      },

                      stock: {
                        type: "number",
                        example: 10,
                      },

                      price: {
                        type: "object",

                        properties: {
                          INR: {
                            type: "number",
                            example: 2000,
                          },

                          USD: {
                            type: "number",
                            example: 20,
                          },
                        },
                      },
                    },
                  },

                  example: [
                    {
                      name: "gold-rosegold-24k-s",

                      material: "Gold",

                      color: "Rose Gold",

                      purity: "24K",

                      size: "S",

                      stock: 10,

                      price: {
                        INR: 2000,
                        USD: 20,
                      },
                    },

                    {
                      name: "gold-rosegold-24k-m",

                      material: "Gold",

                      color: "Rose Gold",

                      purity: "24K",

                      size: "M",

                      stock: 5,

                      price: {
                        INR: 3000,
                        USD: 30,
                      },
                    },

                    {
                      name: "gold-whitegold-18k-s",

                      material: "Gold",

                      color: "White Gold",

                      purity: "18K",

                      size: "S",

                      stock: 7,

                      price: {
                        INR: 2500,
                        USD: 25,
                      },
                    },
                  ],
                },

                isActive: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },

      responses: {
        200: {
          description: "Product updated successfully",
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
      tags: ["Product"],
      summary: "Delete product",
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
          description: "Product deleted successfully",
        },

        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },
  },

  "/product/create": {
    post: {
      tags: ["Product"],
      summary: "Create product",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          "application/json": {
            schema: {
              type: "object",

              required: ["name", "coverImage", "gemstone"],

              properties: {
                name: {
                  type: "string",
                  example: "Women Rose Gold Ring",
                },

                description: {
                  type: "string",
                  example: "Premium handcrafted ring",
                },

                coverImage: {
                  type: "string",
                  example:
                    "https://cdn.brjewelers.com/products/ring-cover.jpg",
                },

                images: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: [
                    "https://cdn.brjewelers.com/products/ring-1.jpg",
                    "https://cdn.brjewelers.com/products/ring-2.jpg",
                  ],
                },

                tags: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: ["rose gold", "women ring"],
                },

                gemstone: {
                  type: "string",
                  example: "Diamond",
                },

                occasions: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  example: ["Wedding", "Engagement"],
                },

                category: {
                  type: "string",
                  example: "Ring",
                },

                priceRange: {
                  type: "object",

                  properties: {
                    min: {
                      type: "number",
                      example: 200,
                    },

                    max: {
                      type: "number",
                      example: 6000,
                    },
                  },
                },

                variants: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      name: {
                        type: "string",
                        example: "gold-rosegold-24k-s",
                      },

                      material: {
                        type: "string",
                        example: "Gold",
                      },

                      color: {
                        type: "string",
                        example: "Rose Gold",
                      },

                      purity: {
                        type: "string",
                        example: "24K",
                      },

                      size: {
                        type: "string",
                        example: "S",
                      },

                      stock: {
                        type: "number",
                        example: 10,
                      },

                      price: {
                        type: "object",

                        properties: {
                          INR: {
                            type: "number",
                            example: 2000,
                          },

                          USD: {
                            type: "number",
                            example: 20,
                          },
                        },
                      },
                    },
                  },

                  example: [
                    {
                      name: "gold-rosegold-24k-s",

                      material: "Gold",

                      color: "Rose Gold",

                      purity: "24K",

                      size: "S",

                      stock: 10,

                      price: {
                        INR: 2000,
                        USD: 20,
                      },
                    },

                    {
                      name: "gold-rosegold-24k-m",

                      material: "Gold",

                      color: "Rose Gold",

                      purity: "24K",

                      size: "M",

                      stock: 5,

                      price: {
                        INR: 3000,
                        USD: 30,
                      },
                    },

                    {
                      name: "gold-whitegold-18k-s",

                      material: "Gold",

                      color: "White Gold",

                      purity: "18K",

                      size: "S",

                      stock: 7,

                      price: {
                        INR: 2500,
                        USD: 25,
                      },
                    },
                  ],
                },

                isActive: {
                  type: "boolean",
                  example: true,
                },
              },
            },
          },
        },
      },

      responses: {
        201: {
          description: "Product created successfully",
        },

        400: {
          $ref: "#/components/responses/BadRequest",
        },

        401: {
          $ref: "#/components/responses/Unauthorized",
        },
      },
    },
  },

  "/product/status/{id}": {
    patch: {
      tags: ["Product"],
      summary: "Update product active status",
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

              required: ["isActive"],

              properties: {
                isActive: {
                  type: "boolean",
                  example: false,
                },
              },
            },
          },
        },
      },

      responses: {
        200: {
          description: "Product status updated successfully",
        },

        400: {
          $ref: "#/components/responses/BadRequest",
        },

        404: {
          $ref: "#/components/responses/NotFound",
        },
      },
    },
  },
};