import swaggerJsdoc from "swagger-jsdoc";

// Gộp tất cả docs lại
const paths = {
  // ...authDocs,      ← thêm dần khi làm phase 2
  // ...medicineDocs,
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pharmacy API",
      version: "1.0.0",
      description: "API docs cho dự án Pharmacy E-Commerce",
    },
    servers: [{ url: "http://localhost:3000", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths,
  },
  apis: [], // để trống vì không dùng JSDoc nữa
};

export const swaggerSpec = swaggerJsdoc(options);
