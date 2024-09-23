require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const topicRoutes = require("./routes/topicRoutes");
const path = require("path");
const app = express();
const cors = require('cors');

// Connect to the database
connectDB();

// Middleware for JSON
app.use(express.json());
// Serve static files for uploaded images
app.use(
  cors({
    origin: "http://localhost:3001", // React app's URL
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", lessonRoutes);
app.use("/api", topicRoutes);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description:
        "API documentation for user management, courses, lessons, and topics",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/userRoutes.js",
    "./routes/courseRoutes.js",
    "./routes/lessonRoutes.js",
    "./routes/topicRoutes.js",
  ], // Adjust paths as needed
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
